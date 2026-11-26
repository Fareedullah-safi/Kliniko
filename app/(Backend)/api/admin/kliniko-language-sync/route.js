import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import connectDB from "@/Lib/mongoDB";
import KlinikoLanguages from "@/Models/Kliniko/KlinikoLanguages";
import KlinikoSection from "@/Models/Kliniko/KlinikoSection";
import NavBar from "@/Models/KlinikoNavbar/KlinikoNavbar";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LANGUAGES = [
  { code: "en", enabled: true },
  { code: "fa", enabled: true },
];

// Add every other model that stores translated content.
const LANGUAGE_DATA_MODELS = [
  KlinikoSection,
  NavBar,

  // Add your actual navbar model here if it stores translations separately.
  // Example:
  // KlinikoNavbar,
];

const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isTranslationMap(value) {
  if (!isPlainObject(value)) return false;

  const entries = Object.entries(value);

  return (
    entries.length > 0 &&
    entries.every(
      ([code, text]) =>
        LANGUAGE_CODE_PATTERN.test(code) &&
        (typeof text === "string" || text == null),
    )
  );
}

function addOrphan(stats, code, documentId) {
  let entry = stats.get(code);

  if (!entry) {
    entry = {
      documents: new Set(),
      maps: 0,
    };
    stats.set(code, entry);
  }

  entry.documents.add(String(documentId));
  entry.maps += 1;
}

function inspectValue(value, availableCodes, documentId, stats) {
  if (Array.isArray(value)) {
    for (const item of value) {
      inspectValue(item, availableCodes, documentId, stats);
    }
    return;
  }

  if (!isPlainObject(value)) return;

  if (isTranslationMap(value)) {
    for (const code of Object.keys(value)) {
      if (!availableCodes.has(code.toLowerCase())) {
        addOrphan(stats, code.toLowerCase(), documentId);
      }
    }
    return;
  }

  for (const item of Object.values(value)) {
    inspectValue(item, availableCodes, documentId, stats);
  }
}

function cleanValue(value, availableCodes) {
  if (Array.isArray(value)) {
    let changed = false;

    const cleaned = value.map((item) => {
      const result = cleanValue(item, availableCodes);
      changed ||= result.changed;
      return result.value;
    });

    return { value: cleaned, changed };
  }

  if (!isPlainObject(value)) {
    return { value, changed: false };
  }

  if (isTranslationMap(value)) {
    const cleaned = {};
    let changed = false;

    for (const [code, text] of Object.entries(value)) {
      if (availableCodes.has(code.toLowerCase())) {
        cleaned[code] = text;
      } else {
        changed = true;
      }
    }

    return { value: cleaned, changed };
  }

  const cleaned = {};
  let changed = false;

  for (const [key, item] of Object.entries(value)) {
    const result = cleanValue(item, availableCodes);
    cleaned[key] = result.value;
    changed ||= result.changed;
  }

  return { value: cleaned, changed };
}

async function getAvailableCodes() {
  const settings = await KlinikoLanguages.findOne({ key: "website" }).lean();
  const languages = settings?.languages?.length
    ? settings.languages
    : DEFAULT_LANGUAGES;

  return {
    languages,
    codes: new Set(languages.map((language) => language.code.toLowerCase())),
  };
}

async function scanLanguageData(availableCodes, shouldClean) {
  const stats = new Map();
  let updatedDocuments = 0;

  for (const Model of LANGUAGE_DATA_MODELS) {
    const cursor = Model.find({}).lean().cursor();

    for await (const document of cursor) {
      let documentChanged = false;
      const updates = {};

      for (const [field, value] of Object.entries(document)) {
        if (
          field === "_id" ||
          field === "__v" ||
          field === "createdAt" ||
          field === "updatedAt"
        ) {
          continue;
        }

        if (shouldClean) {
          const result = cleanValue(value, availableCodes);

          if (result.changed) {
            updates[field] = result.value;
            documentChanged = true;
          }
        } else {
          inspectValue(value, availableCodes, document._id, stats);
        }
      }

      if (shouldClean && documentChanged) {
        const result = await Model.updateOne(
          { _id: document._id },
          { $set: updates },
        );

        if (result.modifiedCount > 0) {
          updatedDocuments += 1;
        }
      }
    }
  }

  if (shouldClean) {
    return { updatedDocuments };
  }

  const orphanLanguages = [...stats.entries()]
    .map(([code, entry]) => ({
      code,
      documents: entry.documents.size,
      translationMaps: entry.maps,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  return {
    orphanLanguages,
    updatedDocuments: 0,
  };
}

export async function GET() {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectDB();

    const { languages, codes } = await getAvailableCodes();
    const scan = await scanLanguageData(codes, false);

    return reply({
      success: true,
      languages,
      orphanLanguages: scan.orphanLanguages,
      totalOrphanDocuments: scan.orphanLanguages.reduce(
        (total, item) => total + item.documents,
        0,
      ),
    });
  } catch (error) {
    console.error("Language Sync GET:", error);

    return reply(
      {
        success: false,
        message: "Could not scan translated content.",
      },
      500,
    );
  }
}

export async function POST() {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectDB();

    const { languages, codes } = await getAvailableCodes();
    const result = await scanLanguageData(codes, true);

    return reply({
      success: true,
      languages,
      updatedDocuments: result.updatedDocuments,
      message: "Unused language translations were cleaned up.",
    });
  } catch (error) {
    console.error("Language Sync POST:", error);

    return reply(
      {
        success: false,
        message: "Could not clean translated content.",
      },
      500,
    );
  }
}
