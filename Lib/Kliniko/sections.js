/*
 =============================================
 KLINIKO CMS - SECTION CONFIGURATION
 =============================================

 Total sections: 11

 Rules:
 - RichTextEditor for display text.
 - Regular inputs for structured values.
 - Cloudinary widget for images.
 - English is required where specified.
 - Dari is optional and hidden for now.

 This configuration is shared by:
 - Admin editor
 - Server-side validation
 - Dynamic API
*/

// =============================================
// FIELD HELPERS
// =============================================

// Rich text field.
// Use required = false for optional text.
const rich = (key, label, required = true) => ({
  key,
  label,
  type: "rich",
  required,
});

// Structured input.
// Used for URLs, icons, dates, numbers,
// phone numbers, and email addresses.
const text = (key, label, type = "text") => ({
  key,
  label,
  type,
  required: false,
});

// Cloudinary image field.
// The editor stores both URL and publicId.
const image = (key, label) => ({
  key,
  label,
  type: "image",
  required: false,
});

// =============================================
// ALL 11 KLINIKO SECTIONS
// =============================================

export const SECTIONS = {
  // ==========================================
  // 1. HERO SECTION
  // ==========================================

  hero: {
    name: "Hero",

    fields: [
      rich("badge", "Small Heading", false),
      rich("title", "Main Heading"),
      rich("description", "Description"),
      rich("buttonText", "Button Text", false),

      text("buttonLink", "Button Link"),

      image("mainImage", "Doctor Image"),

      text("videoLink", "Video URL"),
    ],
  },

  // ==========================================
  // 2. ABOUT KLINIKO
  // ==========================================

  about: {
    name: "About Kliniko",

    fields: [
      rich("badge", "Section Label", false),
      rich("title", "Section Title"),
      rich("description", "Description"),

      rich("experienceNumber", "Experience Number", false),

      rich("experienceLabel", "Experience Label", false),

      rich("buttonText", "Button Text", false),

      text("buttonLink", "Button Link"),

      image("Left", "Left Image"),
      image("RightImage", "Right Image"),
    ],
  },

  // ==========================================
  // 3. SERVICES
  // ==========================================

  services: {
    name: "Services",

    fields: [
      rich("badge", "Section Label", false),
      rich("title", "Section Title"),
      rich("bannerHeading", "Services Page Banner Heading", false),
      image("detailsBanner", "Services Page Banner Image"),
      rich("sidebarTitle", "Service Details Sidebar Heading", true),
      {
        ...image("image-services-details", "Service Detail Image"),
        required: true,
      },
      rich("services-details-title", "Service Detail Title", true),
      rich("services-details-description", "Full Service Description", true),
    ],

    cardName: "Service",

    cardFields: [
      rich("title", "Service Title"),
      rich("description", "Service Description"),
      image("image", "Service Image"),
      text("link", "Service Link"),
    ],
  },

  // ==========================================
  // 4. WHY CHOOSE US
  // ==========================================

  "why-choose": {
    name: "Why Choose Us",

    fields: [
      // Section heading
      rich("badge", "Section Subtitle", false),
      rich("title", "Section Title"),
      rich("description", "Section Description"),

      // Statistic 1 - Doctors
      text("stat1Title", "Statistic 1 Title"),
      text("stat1Value", "Statistic 1 Value"),

      // Statistic 2 - Patients
      text("stat2Title", "Statistic 2 Title"),
      text("stat2Value", "Statistic 2 Value"),

      // Statistic 3
      text("stat3Title", "Statistic 3 Title"),
      text("stat3Value", "Statistic 3 Value"),

      // Statistic 4
      text("stat4Title", "Statistic 4 Title"),
      text("stat4Value", "Statistic 4 Value"),

      // Main section image
      image("image", "Section Image"),
    ],

    cardName: "Feature",

    cardFields: [
      image("icon", "Feature Icon Image"),
      rich("title", "Feature Title"),
      rich("description", "Feature Description"),
    ],
  },

  // ==========================================
  // 5. EXPERT DOCTORS
  // ==========================================

  doctors: {
    name: "Expert Doctors",

    fields: [
      // rich("badge", "Section Label", false),
      rich("title", "Section Title"),
      rich("bannerHeading", "Doctors Page Banner Heading", false),
      image("detailsBanner", "Doctors Banner Image"),
    ],

    cardName: "Doctor",

    cardFields: [
      rich("name", "Doctor Name"),
      rich("specialty", "Doctor Specialty"),
      image("image", "Doctor Photo"),
      text("link", "Profile Link"),

      text("phone", "Public Office Phone"),
      text("email", "Public Office Email"),
      rich("experience", "Experience", false),
      rich("availability", "Availability / Office Hours", false),

      rich("summary", "Professional Summary", false),
      rich("specializations", "Specializations Description", false),
      rich("specializationList", "Specializations List", false),

      rich("skill1Name", "Skill 1 Name", false),
      text("skill1Percent", "Skill 1 Percentage"),
      rich("skill2Name", "Skill 2 Name", false),
      text("skill2Percent", "Skill 2 Percentage"),
      rich("skill3Name", "Skill 3 Name", false),
      text("skill3Percent", "Skill 3 Percentage"),
      rich("skill4Name", "Skill 4 Name", false),
      text("skill4Percent", "Skill 4 Percentage"),

      text("facebook", "Facebook URL"),
      text("twitter", "Twitter / X URL"),
      text("linkedin", "LinkedIn URL"),
      text("whatsapp", "WhatsApp URL"),
      text("instagram", "Instagram URL"),
      text("website", "Website URL"),
    ],
  },
  // ==========================================
  // 6. CASE STUDIES
  // ==========================================

  "case-study": {
    name: "Case Studies",

    fields: [
      rich("badge", "Section Label", false),
      rich("title", "Section Title"),
    ],

    cardName: "Case Study",

    cardFields: [
      rich("title", "Case Title"),
      rich("category", "Category", false),

      //   rich("description", "Case Description", false),

      image("image", "Case Image"),

      text("link", "Details Link"),
    ],
  },

  // ==========================================
  // 7. APPOINTMENT
  // ==========================================

  appointment: {
    name: "Appointment",

    fields: [
      rich("badge", "Section Label", false),
      rich("title", "Section Title"),
      rich("buttonText", "Button Text", false),

      // Phone must remain usable for tel: links.
      text("phone", "Contact Phone", "tel"),

      text("videoLink", "Video URL"),

      image("image", "Thumbnail Image"),
    ],
  },

  // ==========================================
  // 8. TESTIMONIALS
  // ==========================================

  testimonials: {
    name: "Testimonials",

    fields: [
      rich("badge", "Section Label", false),
      rich("title", "Section Title"),
    ],

    cardName: "Testimonial",

    cardFields: [
      rich("name", "Patient Name"),
      //   rich("role", "Patient Role", false),
      rich("review", "Patient Review"),

      // Rating must remain a numeric value.
      text("rating", "Rating", "number"),

      image("image", "Patient Image"),
    ],
  },

  // ==========================================
  // 9. BLOG & NEWS
  // ==========================================

  blog: {
    name: "Blog & News",

    fields: [
      rich("badge", "Section Label", false),
      rich("title", "Section Title"),
      //   rich("description", "Description", false),
    ],

    cardName: "Article",

    cardFields: [
      rich("title", "Article Title"),
      //   rich("excerpt", "Article Description", false),
      rich("author", "Author", false),

      // Dates need structured values
      // for sorting and formatting.
      text("date", "Publication Date", "date"),

      image("image", "Article Image"),

      text("link", "Article Link"),
    ],
  },

  // ==========================================
  // 10. NAVBAR
  // ==========================================

  navbar: {
    name: "Navbar",

    fields: [
      image("logo", "Website Logo"),

      rich("brand", "Website Name", false),

      rich("searchTitle", "Search Title", false),
      rich("searchSubtitle", "Search Subtitle", false),
      rich("searchPlaceholder", "Search Placeholder", false),

      rich("appointmentText", "Appointment Button Text", false),
      text("appointmentLink", "Appointment Button URL"),
    ],

    cardName: "Menu",

    cardFields: [
      rich("label", "Menu Name"),
      text("link", "Menu URL"),
      text("parentId", "Parent Menu ID"),
      text("hasDropdown", "Enable Dropdown"),
      text("showInFooter", "Show in Footer"),
    ],
  },

  footer: {
    name: "Footer",

    fields: [
      image("logo", "Footer Logo"),

      rich("brand", "Website Name", false),
      rich("description", "Footer Description", false),

      rich("address", "Address", false),
      rich("emailLabel", "Email Heading", false),
      rich("email", "Email Address", false),
      rich("phoneLabel", "Phone Heading", false),
      rich("phone", "Phone Number", false),

      rich("servicesTitle", "Services Column Heading", false),
      rich("linksTitle", "Useful Links Column Heading", false),

      rich("newsletterTitle", "Newsletter Heading", false),
      rich("newsletterDescription", "Newsletter Description", false),
      rich("newsletterPlaceholder", "Newsletter Email Placeholder", false),
      rich("subscribeText", "Subscribe Button Text", false),
      // rich("subscribingText", "Submitting Button Text", false),

      // rich("copyright", "Copyright / Credits", false),
    ],
  },
};

// =============================================
// OPTIONAL SHARED HELPERS
// =============================================

// Find a section safely.
export function getSectionConfig(section) {
  return Object.prototype.hasOwnProperty.call(SECTIONS, section)
    ? SECTIONS[section]
    : null;
}

// Used by model or API route validation.
export const SECTION_KEYS = Object.keys(SECTIONS);

// Check whether a section supports cards.
export function hasSectionCards(section) {
  const config = getSectionConfig(section);

  return Array.isArray(config?.cardFields);
}

// All supported languages.
// Dari is stored but not required.
export const CONTENT_LANGUAGES = ["en", "fa"];

export const DEFAULT_LANGUAGE = "en";

export const ENABLE_DARI_EDITOR = false;
