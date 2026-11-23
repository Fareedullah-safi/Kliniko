const rich = (key, label) => ({
  key,
  label,
  type: "rich",
});

const input = (key, label, type = "plain") => ({
  key,
  label,
  type,
});

// ==========================================
// ONLY ENGLISH AND DARI
// ==========================================

export const KLINIKO_LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "fa", label: "دری", short: "FA" },
];

// ==========================================
// ALL KLINIKO SECTIONS
// ==========================================

export const KLINIKO_SECTIONS = {
  hero: {
    name: "Hero",
    fields: [
      rich("badge", "Small Heading"),
      rich("title", "Main Heading"),
      rich("description", "Description"),
      rich("buttonText", "Button Text"),
      input("buttonLink", "Button Link", "link"),
      input("mainImage", "Doctor Image URL", "image"),
      input("videoLink", "Video URL", "url"),
    ],
  },

  about: {
    name: "About Kliniko",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Title"),
      rich("description", "Description"),
      rich("experienceNumber", "Experience Number"),
      rich("experienceLabel", "Experience Label"),
      rich("buttonText", "Button Text"),
      input("buttonLink", "Button Link", "link"),
      input("mainImage", "Main Image URL", "image"),
      input("thumbnailImage", "Thumbnail Image URL", "image"),
      input("videoLink", "Video URL", "url"),
    ],
  },

  services: {
    name: "Services",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
    ],

    cardName: "Service",

    cardFields: [
      rich("title", "Service Title"),
      rich("description", "Description"),
      input("icon", "Icon Name"),
      input("image", "Image URL", "image"),
      input("link", "Service Link", "link"),
    ],
  },

  "why-choose": {
    name: "Why Choose Us",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Title"),
      rich("description", "Description"),
      rich("stat1", "First Statistic"),
      rich("stat2", "Second Statistic"),
      rich("stat3", "Third Statistic"),
      rich("stat4", "Fourth Statistic"),
      input("image", "Section Image URL", "image"),
    ],

    cardName: "Feature",

    cardFields: [
      rich("title", "Feature Title"),
      rich("description", "Description"),
      input("icon", "Icon Name"),
    ],
  },

  doctors: {
    name: "Expert Doctors",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Title"),
      rich("description", "Description"),
    ],

    cardName: "Doctor",

    cardFields: [
      rich("name", "Doctor Name"),
      rich("specialty", "Specialty"),
      rich("bio", "Short Biography"),
      input("image", "Doctor Photo URL", "image"),
      input("link", "Profile Link", "link"),
    ],
  },

  "case-study": {
    name: "Case Studies",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Title"),
      rich("description", "Description"),
    ],

    cardName: "Case Study",

    cardFields: [
      rich("title", "Case Title"),
      rich("category", "Category"),
      rich("description", "Description"),
      input("image", "Case Image URL", "image"),
      input("link", "Details Link", "link"),
    ],
  },

  appointment: {
    name: "Appointment",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Title"),
      rich("description", "Description"),
      rich("buttonText", "Button Text"),
      input("phone", "Phone", "phone"),
      input("videoLink", "Video URL", "url"),
      input("image", "Image URL", "image"),
    ],
  },

  testimonials: {
    name: "Testimonials",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Title"),
      rich("description", "Description"),
    ],

    cardName: "Review",

    cardFields: [
      rich("name", "Patient Display Name"),
      rich("role", "Patient Label"),
      rich("review", "Review"),
      input("rating", "Rating", "rating"),
      input("image", "Patient Photo URL", "image"),
    ],
  },

  blog: {
    name: "Blog & News",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Title"),
      rich("description", "Description"),
    ],

    cardName: "Article",

    cardFields: [
      rich("title", "Article Title"),
      rich("excerpt", "Short Description"),
      rich("author", "Author"),
      input("date", "Publication Date", "date"),
      input("image", "Image URL", "image"),
      input("link", "Article Link", "link"),
    ],
  },

  navbar: {
    name: "Navbar",
    fields: [
      rich("brand", "Website Brand Name"),
      rich("appointmentText", "Appointment Button"),
      rich("searchPlaceholder", "Search Placeholder"),
      input("logo", "Logo URL", "image"),
      input("appointmentLink", "Appointment Link", "link"),
    ],

    cardName: "Menu Link",

    cardFields: [
      rich("label", "Menu Label"),
      input("link", "Menu URL", "link"),
    ],
  },

  footer: {
    name: "Footer",
    fields: [
      rich("brand", "Brand Name"),
      rich("description", "Description"),
      rich("address", "Address"),
      rich("phone", "Phone Display Text"),
      rich("email", "Email Display Text"),
      rich("newsletterTitle", "Newsletter Title"),
      rich("copyright", "Copyright / NetHub Credits"),
      input("logo", "Footer Logo URL", "image"),
    ],

    cardName: "Footer Link",

    cardFields: [
      rich("label", "Link Label"),
      input("link", "Link URL", "link"),
    ],
  },
};

// ==========================================
// CREATE EMPTY SECTION DATA
// ==========================================

export function emptyKlinikoSection(section) {
  const config = KLINIKO_SECTIONS[section];

  if (!config) return null;

  return {
    content: Object.fromEntries(
      config.fields.map((field) => [
        field.key,
        field.type === "rich" ? { en: "", fa: "" } : "",
      ]),
    ),

    cards: [],
  };
}

// ==========================================
// CREATE EMPTY CARD DATA
// ==========================================

export function emptyKlinikoCard(section) {
  const config = KLINIKO_SECTIONS[section];

  if (!config || !config.cardFields) {
    return {};
  }

  return Object.fromEntries(
    config.cardFields.map((field) => [
      field.key,
      field.type === "rich" ? { en: "", fa: "" } : "",
    ]),
  );
}
