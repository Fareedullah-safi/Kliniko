import sanitizeHtml from "sanitize-html";
import "server-only";

export function doctorText(value) {
  const input = typeof value === "string" ? value : value?.en;

  if (typeof input !== "string") return "";

  // Preserve lines from older rich-text paragraphs and lists.
  const html = input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li)>/gi, "\n");

  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&nbsp;|\u00a0/gi, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

export function doctorSlug(doctor) {
  return (
    doctorText(doctor.name)
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "profile"
  );
}

export function doctorHref(doctor) {
  const id = encodeURIComponent(String(doctor.id));
  const slug = encodeURIComponent(doctorSlug(doctor));

  return `/our-doctors/${id}/${slug}`;
}
