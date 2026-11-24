import sanitizeHtml from "sanitize-html";

// Server-side validation for Kliniko CMS.
// Do not import this file into client components.

// ==========================================
// LIMITS
// ==========================================

const MAX_CARDS = 50;
const MAX_RICH_LENGTH = 10_000;
const MAX_TEXT_LENGTH = 2_000;
const MAX_PUBLIC_ID_LENGTH = 250;
const MAX_IMAGE_URL_LENGTH = 2_000;

// ==========================================
// SAFE RICH TEXT CONFIGURATION
// ==========================================

const HTML_OPTIONS = {
  allowedTags: [
    "p",
    "br",
    "div",
    "span",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "sub",
    "sup",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
  ],

  allowedAttributes: {
    a: ["href", "title", "target", "rel", "class", "style"],
    "*": ["class", "style"],
  },

  allowedClasses: {
    "*": [/^ql-(?:align|size|indent|direction)-[a-z0-9-]+$/i],
  },

  allowedStyles: {
    "*": {
      color: [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      "background-color": [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      "text-align": [/^(?:left|right|center|justify)$/],
    },
  },

  allowedSchemes: ["http", "https", "mailto", "tel"],

  transformTags: {
    a: (_tagName, attributes) => {
      const safeAttributes = {
        ...attributes,
      };

      if (safeAttributes.target === "_blank") {
        safeAttributes.rel = "noopener noreferrer";
      } else {
        delete safeAttributes.target;
        delete safeAttributes.rel;
      }

      return {
        tagName: "a",
        attribs: safeAttributes,
      };
    },
  },
};

// ==========================================
// OBJECT HELPERS
// ==========================================

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const owns = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// ==========================================
// CHECK VISIBLE RICH TEXT
// ==========================================

function visibleText(html) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&(?:nbsp|#0*160|#x0*a0);/gi, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(
      /&(?:ZeroWidthSpace|#(?:8203|8204|8205|65279)|#x(?:200b|200c|200d|feff));/gi,
      "",
    )
    .trim();
}

// ==========================================
// VALIDATE URLS
// ==========================================

function isValidLink(value, image = false) {
  if (!value) return true;

  // Internal links such as /appointment
  if (value.startsWith("/") && !value.startsWith("//")) {
    return !/[\\\s]/.test(value);
  }

  // Page anchors such as #services
  if (!image && /^#[a-z\d_-]+$/i.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);

    const allowedProtocol = image
      ? url.protocol === "https:"
      : ["http:", "https:"].includes(url.protocol);

    return (
      allowedProtocol && Boolean(url.hostname) && !url.username && !url.password
    );
  } catch {
    return false;
  }
}

// ==========================================
// VALIDATE CLOUDINARY PUBLIC ID
// ==========================================

function isValidPublicId(value) {
  return (
    !value ||
    (value.length <= MAX_PUBLIC_ID_LENGTH &&
      /^[a-z\d_./-]+$/i.test(value) &&
      !value.split("/").includes(".."))
  );
}

// ==========================================
// VALIDATE REAL DATES
// ==========================================

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (year < 1000 || year > 9999) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// ==========================================
// VALIDATE INDIVIDUAL SECTION FIELDS
// ==========================================

function cleanFields(fields, incoming, path, errors, previous = {}) {
  const source = isObject(incoming) ? incoming : {};

  const old = isObject(previous) ? previous : {};

  const result = {};

  for (const field of fields) {
    const key = field.key;

    const errorKey = `${path}.${key}`;

    const value = source[key];

    // ======================================
    // 1. RICH TEXT
    // ======================================

    if (field.type === "rich") {
      if (value != null && !isObject(value)) {
        errors[errorKey] = `${field.label} must be a translation object.`;

        continue;
      }

      // English content
      const enRaw = value?.en ?? "";

      // Preserve existing Dari when
      // a request does not include fa.
      const faRaw =
        isObject(value) && owns(value, "fa") ? value.fa : (old[key]?.fa ?? "");

      if (typeof enRaw !== "string" || typeof faRaw !== "string") {
        errors[errorKey] = `${field.label} translations must be text.`;

        continue;
      }

      // Check maximum content length.
      if (enRaw.length > MAX_RICH_LENGTH || faRaw.length > MAX_RICH_LENGTH) {
        errors[errorKey] = `${field.label} is too long.`;

        continue;
      }

      // Remove unsafe HTML.
      const en = sanitizeHtml(enRaw, HTML_OPTIONS);

      const fa = sanitizeHtml(faRaw, HTML_OPTIONS);

      // Only required English text
      // must contain visible content.
      if (field.required && !visibleText(en)) {
        errors[errorKey] = `${field.label} is required in English.`;
      }

      result[key] = {
        en,
        fa,
      };

      continue;
    }

    // ======================================
    // 2. IMAGE FIELDS
    // ======================================

    if (field.type === "image") {
      const publicIdKey = `${key}PublicId`;

      const idRaw = source[publicIdKey] ?? "";

      if (
        (value != null && typeof value !== "string") ||
        typeof idRaw !== "string"
      ) {
        errors[errorKey] =
          `${field.label} must contain an image URL and public ID.`;

        continue;
      }

      const url = (value || "").trim();

      const id = idRaw.trim();

      if (field.required && !url) {
        errors[errorKey] = `${field.label} is required.`;
      } else if (url.length > MAX_IMAGE_URL_LENGTH || !isValidLink(url, true)) {
        errors[errorKey] =
          `${field.label} needs a valid HTTPS URL or internal path.`;
      } else if (!isValidPublicId(id)) {
        errors[errorKey] =
          `${field.label} has an invalid Cloudinary public ID.`;
      } else if (!url && id) {
        errors[errorKey] = `${field.label} has a public ID but no image URL.`;
      }

      result[key] = url;

      result[publicIdKey] = url ? id : "";

      continue;
    }

    // ======================================
    // 3. NORMAL TEXT FIELDS
    // ======================================

    if (value != null && typeof value !== "string") {
      errors[errorKey] = `${field.label} must be text.`;

      continue;
    }

    const input = (value || "").trim();

    // Required text
    if (field.required && !input) {
      errors[errorKey] = `${field.label} is required.`;
    }

    // Maximum length
    else if (input.length > MAX_TEXT_LENGTH) {
      errors[errorKey] = `${field.label} is too long.`;
    }

    // URL validation
    else if (
      (field.type === "url" ||
        ["link", "buttonLink", "appointmentLink", "videoLink"].includes(key)) &&
      !isValidLink(input)
    ) {
      errors[errorKey] = `${field.label} must be a valid link.`;
    }

    // Email validation
    else if (
      field.type === "email" &&
      input &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
    ) {
      errors[errorKey] = `${field.label} must be a valid email address.`;
    }

    // Phone number validation
    else if (
      field.type === "tel" &&
      input &&
      !/^\+?[0-9()\s.-]{7,30}$/.test(input)
    ) {
      errors[errorKey] = `${field.label} must be a valid phone number.`;
    }

    // Date validation
    else if (field.type === "date" && input && !isValidDate(input)) {
      errors[errorKey] =
        `${field.label} must be a real date in YYYY-MM-DD format.`;
    }

    // Number validation
    else if (
      field.type === "number" &&
      input &&
      (!Number.isFinite(Number(input)) ||
        (key === "rating" && (Number(input) < 1 || Number(input) > 5)))
    ) {
      errors[errorKey] =
        key === "rating"
          ? `${field.label} must be between 1 and 5.`
          : `${field.label} must be a valid number.`;
    }

    result[key] = input;
  }

  return result;
}

// ==========================================
// MAIN SECTION VALIDATION FUNCTION
// ==========================================

export function validateSectionDraft(config, payload, previous = null) {
  const errors = {};

  // Validate section configuration
  if (!config || !Array.isArray(config.fields)) {
    return {
      data: null,
      errors: {
        form: "Invalid section configuration.",
      },
    };
  }

  // Validate request body
  if (!isObject(payload) || !isObject(payload.content)) {
    return {
      data: null,
      errors: {
        content: "Section content is required.",
      },
    };
  }

  // Validate card array
  if (payload.cards != null && !Array.isArray(payload.cards)) {
    return {
      data: null,
      errors: {
        cards: "Cards must be an array.",
      },
    };
  }

  const incomingCards = payload.cards || [];

  // Maximum 50 cards
  if (incomingCards.length > MAX_CARDS) {
    errors.cards = `Maximum ${MAX_CARDS} cards are allowed.`;
  }

  // Sections without cards cannot
  // accept repeatable items.
  if (!config.cardFields && incomingCards.length) {
    errors.cards = "This section does not support cards.";
  }

  // ========================================
  // VALIDATE MAIN CONTENT
  // ========================================

  const content = cleanFields(
    config.fields,
    payload.content,
    "content",
    errors,
    previous?.content,
  );

  // ========================================
  // FIND EXISTING CARDS
  // ========================================

  const oldCards = new Map(
    (Array.isArray(previous?.cards) ? previous.cards : [])
      .filter((card) => isObject(card) && typeof card.id === "string")
      .map((card) => [card.id, card]),
  );

  // ========================================
  // VALIDATE ALL CARDS
  // ========================================

  const seen = new Set();

  const cards = config.cardFields
    ? incomingCards.slice(0, MAX_CARDS).map((card, index) => {
        const validObject = isObject(card);

        const id = validObject ? card.id : undefined;

        const idIsValid =
          typeof id === "string" && /^[a-z\d_-]{1,100}$/i.test(id);

        // Check unique valid IDs
        if (!idIsValid || seen.has(id)) {
          errors[`cards.${index}.id`] = "Each card needs a unique valid ID.";
        }

        if (idIsValid) {
          seen.add(id);
        }

        // Validate every card field
        const fields = cleanFields(
          config.cardFields,
          card,
          idIsValid ? `card.${id}` : `cards.${index}`,
          errors,
          oldCards.get(id),
        );

        return {
          id,
          ...fields,
        };
      })
    : [];

  // ========================================
  // RETURN VALIDATED DATA
  // ========================================

  return {
    data: Object.keys(errors).length
      ? null
      : {
          content,
          cards,
        },

    errors,
  };
}

// ==========================================
// COLLECT CLOUDINARY IMAGE PUBLIC IDs
// ==========================================

// This only collects IDs.
// It DOES NOT delete Cloudinary images.

export function collectImageIds(config, data) {
  const ids = new Set();

  function add(fields, values) {
    for (const field of fields || []) {
      if (field.type !== "image") {
        continue;
      }

      const id = values?.[`${field.key}PublicId`];

      if (typeof id === "string" && id) {
        ids.add(id);
      }
    }
  }

  // Main section images
  add(config.fields, data?.content);

  // Repeatable card images
  for (const card of data?.cards || []) {
    add(config.cardFields, card);
  }

  return ids;
}
