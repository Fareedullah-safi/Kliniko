import "server-only";

import { SECTIONS } from "@/Lib/Kliniko/sections";
import connectDB from "@/Lib/mongoDB";
import KlinikoSection from "@/Models/Kliniko/KlinikoSection";

import { connection } from "next/server";
import { cache } from "react";
import sanitizeHtml from "sanitize-html";

// ==========================================
// ALLOWED RICH TEXT FORMATTING
// ==========================================

const SAFE_HTML_OPTIONS = {
  allowedTags: [
    "p",
    "div",
    "br",
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
    "*": ["style"],
    a: ["href", "title"],
  },

  allowedSchemes: ["http", "https", "mailto", "tel"],

  allowedStyles: {
    "*": {
      color: [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      "background-color": [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      "text-align": [/^(left|right|center|justify)$/],
    },
  },
};

// These fields may contain links in their HTML.
const LINKABLE_FIELDS = new Set([
  "description",
  "bio",
  "excerpt",
  "review",
  "address",
  "copyright",
]);

// ==========================================
// SANITIZE ONE RICH TEXT VALUE
// ==========================================

function cleanRichText(value, allowLinks) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ");

  return sanitizeHtml(normalized, {
    ...SAFE_HTML_OPTIONS,

    // Don't allow nested links inside buttons,
    // linked cards, navbar items, etc.
    allowedTags: allowLinks
      ? SAFE_HTML_OPTIONS.allowedTags
      : SAFE_HTML_OPTIONS.allowedTags.filter((tag) => tag !== "a"),
  });
}

// ==========================================
// SANITIZE ALL RICH FIELDS
// ==========================================

function cleanFields(fields, values = {}) {
  const result = { ...values };

  for (const field of fields || []) {
    if (field.type !== "rich") {
      continue;
    }

    const translation = values?.[field.key] || {};

    const allowLinks = LINKABLE_FIELDS.has(field.key);

    result[field.key] = {
      en: cleanRichText(translation.en, allowLinks),
      fa: cleanRichText(translation.fa, allowLinks),
    };
  }

  return result;
}

// ==========================================
// GET ALL KLINIKO CONTENT
// ==========================================

export const getKlinikoContent = cache(async () => {
  await connection();
  await connectDB();

  // ONE QUERY FOR ALL SECTIONS
  const sections = await KlinikoSection.find({
    section: {
      $in: Object.keys(SECTIONS),
    },
  })
    .select("section content cards -_id")
    .lean();

  const data = {};

  for (const item of sections) {
    const config = SECTIONS[item.section];

    if (!config) continue;

    data[item.section] = {
      content: cleanFields(config.fields, item.content || {}),

      cards: Array.isArray(item.cards)
        ? item.cards.map((card) => ({
            ...cleanFields(config.cardFields || [], card),
          }))
        : [],
    };
  }

  return data;
});
