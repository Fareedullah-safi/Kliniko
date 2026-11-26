import mongoose from "mongoose";

const LanguageSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    nativeName: {
      type: String,
      required: true,
    },
    direction: {
      type: String,
      enum: ["ltr", "rtl"],
      default: "ltr",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const KlinikoLanguagesSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "website",
    },
    defaultLanguage: {
      type: String,
      default: "en",
    },
    languages: {
      type: [LanguageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

export default mongoose.models.KlinikoLanguages ||
  mongoose.model("KlinikoLanguages", KlinikoLanguagesSchema);
