import mongoose from "mongoose";

const KlinikoNavbarSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
      required: true,
    },

    // Stores logo, links, and dynamic language translation maps.
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    // Stores navbar menu items and their translated labels.
    cards: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const KlinikoNavbar =
  mongoose.models.KlinikoNavbar ||
  mongoose.model("KlinikoNavbar", KlinikoNavbarSchema);

export default KlinikoNavbar;
