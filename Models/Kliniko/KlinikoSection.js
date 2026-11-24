
import mongoose from "mongoose";
import { SECTION_KEYS } from "@/Lib/Kliniko/sections";

// ==========================================
// KLINIKO SECTION SCHEMA
// ==========================================

const KlinikoSectionSchema = new mongoose.Schema(
  {
    // Unique section name:
    // hero, about, services, doctors, etc.
    section: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      enum: SECTION_KEYS,
    },

    // Main section fields:
    // title, badge, description, links, images.
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    // Repeatable items:
    // doctors, services, testimonials, etc.
    cards: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Used to prevent two admins from
    // silently overwriting each other's work.
    revision: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    minimize: false,
    strict: "throw",
  },
);

// ==========================================
// PREVENT MODEL RECOMPILATION
// ==========================================

const KlinikoSection =
  mongoose.models.KlinikoSection ||
  mongoose.model(
    "KlinikoSection",
    KlinikoSectionSchema,
  );

export default KlinikoSection;
