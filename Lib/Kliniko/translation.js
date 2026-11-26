export function getTranslation(value, language, fallback = "en") {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return value[language] || value[fallback] || "";
}

// Keep every valid language key.
// Don't discard Pashto, Urdu, Arabic, etc.
export function normalizeTranslations(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([code, text]) =>
          /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(code) &&
          typeof text === "string",
      )
      .map(([code, text]) => [code.toLowerCase(), text]),
  );
}
