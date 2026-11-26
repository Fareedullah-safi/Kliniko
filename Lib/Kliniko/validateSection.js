import sanitizeHtml from "sanitize-html";

const MAX_CARDS = 50;
const MAX_RICH_LENGTH = 10000;

const cleanHtml = (html) =>
  sanitizeHtml(html, {
    allowedTags: [
      ...new Set([...sanitizeHtml.defaults.allowedTags, "span", "h1", "h2"]),
    ],

    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style"],
      a: ["href", "title", "target", "rel"],
    },

    allowedClasses: {
      "*": [/^ql-(?:align|size|indent)-[a-z0-9-]+$/],
    },

    allowedStyles: {
      "*": {
        color: [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d.,\s%]+\)$/i],

        "background-color": [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d.,\s%]+\)$/i],

        "text-align": [/^(left|center|right|justify)$/],
      },
    },

    allowedSchemes: ["https", "http", "mailto", "tel"],
  });

// ==========================================
// CHECK VISIBLE RICH TEXT
// ==========================================

function visible(html) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

// ==========================================
// VALIDATE URLS
// ==========================================

function validLink(link, isImage = false) {
  if (!link) return true;

  if (link.startsWith("/") && !link.startsWith("//") && !/[\\\s]/.test(link)) {
    return true;
  }

  if (!isImage && /^#[a-z\d_-]+$/i.test(link)) {
    return true;
  }

  try {
    const url = new URL(link);

    return (
      (isImage
        ? url.protocol === "https:"
        : ["http:", "https:"].includes(url.protocol)) && Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

// ==========================================
// VALIDATE AND CLEAN FIELDS
// ==========================================

function cleanFields(fields, input, location, errors) {
  const result = {};

  const source =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};

  for (const field of fields) {
    const value = source[field.key];

    const key = `${location}.${field.key}`;

    // ======================================
    // MULTILINGUAL RICH TEXT
    // ======================================

    if (field.type === "rich") {
      if (
        value != null &&
        (typeof value !== "object" || Array.isArray(value))
      ) {
        errors[key] = `${field.label} must contain language translations.`;

        continue;
      }

      const translations = {};

      for (const [code, raw] of Object.entries(value || {})) {
        // Accept dynamic language codes.
        // Do not remove newly added languages.

        if (
          !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(code) ||
          typeof raw !== "string"
        ) {
          errors[key] = `${field.label} has an invalid language entry.`;

          continue;
        }

        if (raw.length > MAX_RICH_LENGTH) {
          errors[key] = `${field.label} is too long in ${code}.`;

          continue;
        }

        translations[code.toLowerCase()] = cleanHtml(raw);
      }

      // English is required only when
      // the rich text field is required.
      // Other languages are optional.

      if (field.required && !visible(translations.en || "")) {
        errors[key] = `${field.label} is required in English.`;
      }

      result[field.key] = translations;

      continue;
    }

    // ======================================
    // COMMON IMAGE FOR ALL LANGUAGES
    // ======================================

    if (field.type === "image") {
      const url = typeof value === "string" ? value.trim() : "";

      const idValue = source[`${field.key}PublicId`];

      const id = typeof idValue === "string" ? idValue.trim() : "";

      if (url.length > 2000 || !validLink(url, true)) {
        errors[key] =
          `${field.label} must be a valid HTTPS image URL or internal path.`;
      }

      if (
        id.length > 250 ||
        (id && (!/^[a-z\d_./-]+$/i.test(id) || id.split("/").includes("..")))
      ) {
        errors[key] = `${field.label} has an invalid public ID.`;
      }

      // Just one image URL and public ID.
      // No en/fa/ps image translations.

      result[field.key] = url;

      result[`${field.key}PublicId`] = url ? id : "";

      continue;
    }

    // ======================================
    // COMMON TEXT, LINKS, NUMBERS, DATES
    // ======================================

    if (value != null && typeof value !== "string") {
      errors[key] = `${field.label} must be a string.`;

      continue;
    }

    const v = (value || "").trim();

    if (v.length > 2000) {
      errors[key] = `${field.label} is too long.`;
    }

    // Common URLs for every language.
    if (
      ["buttonLink", "appointmentLink", "videoLink", "link"].includes(
        field.key,
      ) &&
      !validLink(v)
    ) {
      errors[key] = `${field.label} must be a valid URL or internal link.`;
    }

    // Validate dates.
    if (field.type === "date" && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      errors[key] = `${field.label} requires YYYY-MM-DD.`;
    }

    // Validate numbers.
    if (
      field.type === "number" &&
      v &&
      (!Number.isFinite(Number(v)) || Number(v) < 1 || Number(v) > 5)
    ) {
      errors[key] = `${field.label} must be between 1 and 5.`;
    }

    result[field.key] = v;
  }

  return result;
}

// ==========================================
// MAIN SECTION VALIDATOR
// ==========================================

export function validateSectionDraft(config, payload) {
  const errors = {};

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      data: null,
      errors: {
        form: "Invalid request body.",
      },
    };
  }

  if (
    payload.content == null ||
    typeof payload.content !== "object" ||
    Array.isArray(payload.content)
  ) {
    return {
      data: null,
      errors: {
        content: "Section content is required.",
      },
    };
  }

  if (payload.cards != null && !Array.isArray(payload.cards)) {
    return {
      data: null,
      errors: {
        cards: "Cards must be an array.",
      },
    };
  }

  const cardsInput = payload.cards || [];

  if (cardsInput.length > MAX_CARDS) {
    errors.cards = `Maximum ${MAX_CARDS} cards allowed.`;
  }

  if (!config.cardFields && cardsInput.length) {
    errors.cards = "This section does not support cards.";
  }

  // Validate main section content.
  const content = cleanFields(
    config.fields,
    payload.content,
    "content",
    errors,
  );

  // Validate section cards.
  const seenIds = new Set();

  const cards = (config.cardFields ? cardsInput.slice(0, MAX_CARDS) : []).map(
    (card, i) => {
      const id = card?.id;

      if (
        typeof id !== "string" ||
        !/^[a-z0-9_-]{1,80}$/i.test(id) ||
        seenIds.has(id)
      ) {
        errors[`cards.${i}.id`] = "Each card must have a unique valid ID.";
      }

      if (typeof id === "string") {
        seenIds.add(id);
      }

      return {
        id,

        ...cleanFields(config.cardFields, card, `cards.${i}`, errors),
      };
    },
  );

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
// COLLECT SHARED CLOUDINARY IMAGE IDS
// ==========================================

export function collectImageIds(config, data) {
  const all = new Set();

  const add = (fields, values) => {
    for (const field of fields || []) {
      if (field.type !== "image") {
        continue;
      }

      const id = values?.[`${field.key}PublicId`];

      if (typeof id === "string" && id) {
        all.add(id);
      }
    }
  };

  // Main section images.
  add(config.fields, data?.content);

  // Card images.
  for (const card of data?.cards || []) {
    add(config.cardFields, card);
  }

  return all;
}
