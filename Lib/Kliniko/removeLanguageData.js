const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;

/**
 * Removes a language key from translation maps in an object.
 * A translation map is an object whose keys are language codes,
 * such as { en: "...", ps: "..." }.
 */
function removeLanguageKey(value, languageCode) {
  if (Array.isArray(value)) {
    return value.map((item) => removeLanguageKey(item, languageCode));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const keys = Object.keys(value);
  const isTranslationMap =
    keys.length > 0 && keys.every((key) => LANGUAGE_CODE_PATTERN.test(key));

  if (isTranslationMap) {
    const result = {};

    for (const [key, item] of Object.entries(value)) {
      if (key !== languageCode) {
        result[key] = item;
      }
    }

    return result;
  }

  const result = {};

  for (const [key, item] of Object.entries(value)) {
    result[key] = removeLanguageKey(item, languageCode);
  }

  return result;
}

/**
 * Removes the language from every document in the registered models.
 * Models must be Mongoose models that store language translations.
 */
export async function removeLanguageFromModels(models, languageCode) {
  let updatedDocuments = 0;

  for (const Model of models) {
    const documents = await Model.find({}).lean();

    for (const document of documents) {
      const cleanedDocument = removeLanguageKey(document, languageCode);

      const { _id, __v, createdAt, updatedAt, ...fieldsToSave } =
        cleanedDocument;

      const result = await Model.updateOne(
        { _id: document._id },
        { $set: fieldsToSave },
      );

      if (result.modifiedCount > 0) {
        updatedDocuments += 1;
      }
    }
  }

  return updatedDocuments;
}
