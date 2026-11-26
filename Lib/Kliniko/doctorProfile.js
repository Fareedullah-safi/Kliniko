import sanitizeHtml from "sanitize-html";
import "server-only";

export function doctorText(value) {
  const input = typeof value === "string" ? value : value?.en;
  if (typeof input !== "string") return "";

  const withLines = input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li)>/gi, "\n");

  return sanitizeHtml(withLines, {
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
  return `/our-doctors/${encodeURIComponent(doctor.id)}/${encodeURIComponent(
    doctorSlug(doctor),
  )}`;
}

// Pass only public URL strings into the client-side social component.
export function doctorSocialLinks(doctor) {
  return {
    facebook: doctor.facebook || "",
    twitter: doctor.twitter || "",
    linkedin: doctor.linkedin || "",
    whatsapp: doctor.whatsapp || "",
    instagram: doctor.instagram || "",
    website: doctor.website || "",
  };
}

export function doctorSkills(doctor) {
  const skills = [];

  for (let i = 1; i <= 4; i++) {
    const label = doctorText(doctor[`skill${i}Name`]);
    const raw = String(doctor[`skill${i}Percent`] ?? "").trim();
    const percent = Number(raw.replace(/%$/, ""));

    if (
      label &&
      raw &&
      Number.isFinite(percent) &&
      percent >= 0 &&
      percent <= 100
    ) {
      skills.push({ id: i, label, percent });
    }
  }

  return skills;
}
