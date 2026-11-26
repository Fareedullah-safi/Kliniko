import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import connectDB from "@/Lib/mongoDB";
import KlinikoLanguages from "@/Models/Kliniko/KlinikoLanguages";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    enabled: true,
  },
  {
    code: "fa",
    name: "Dari",
    nativeName: "دری",
    direction: "rtl",
    enabled: true,
  },
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

async function getRequestBody(request) {
  const raw = await request.text();

  if (raw.length > 200_000) {
    return { error: "Request too large.", status: 413 };
  }

  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: "Invalid JSON.", status: 400 };
  }
}

function normalizeLanguages(input) {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Add at least one language." };
  }

  const languages = input.map((item) => ({
    code: String(item?.code || "")
      .trim()
      .toLowerCase(),
    name: String(item?.name || "")
      .trim()
      .slice(0, 80),
    nativeName: String(item?.nativeName || "")
      .trim()
      .slice(0, 80),
    direction: item?.direction === "rtl" ? "rtl" : "ltr",
    enabled: item?.enabled === true,
  }));

  const codes = new Set();

  for (const language of languages) {
    if (
      !LANGUAGE_CODE_PATTERN.test(language.code) ||
      !language.name ||
      !language.nativeName ||
      codes.has(language.code)
    ) {
      return { error: "Invalid or duplicate language code/name." };
    }

    codes.add(language.code);
  }

  if (
    !languages.some((language) => language.code === "en" && language.enabled)
  ) {
    return { error: "English must remain enabled." };
  }

  return { languages };
}

// Read all languages for the admin page.
// Public requests receive enabled languages only.
export async function GET(request) {
  try {
    const all = new URL(request.url).searchParams.get("all") === "1";

    if (all) {
      const permission = await requireEditPermission();
      if (!permission.authorized) return permission.response;
    }

    await connectDB();

    const document = await KlinikoLanguages.findOne({
      key: "website",
    }).lean();

    const languages = document?.languages?.length
      ? document.languages
      : DEFAULT_LANGUAGES;

    return reply({
      success: true,
      languages: all
        ? languages
        : languages.filter((language) => language.enabled),
      defaultLanguage: document?.defaultLanguage || "en",
      ...(all ? { version: document?.__v ?? null } : {}),
    });
  } catch (error) {
    console.error("Languages GET:", error);

    return reply({ success: false, message: "Could not load languages." }, 500);
  }
}

// Add or edit language settings.
export async function POST(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    const parsed = await getRequestBody(request);
    if (parsed.error) {
      return reply({ success: false, message: parsed.error }, parsed.status);
    }

    const { body } = parsed;
    const normalized = normalizeLanguages(body?.languages);

    if (normalized.error) {
      return reply({ success: false, message: normalized.error }, 400);
    }

    const { languages } = normalized;
    const defaultLanguage = String(body?.defaultLanguage || "en")
      .trim()
      .toLowerCase();

    if (
      !languages.some(
        (language) => language.code === defaultLanguage && language.enabled,
      )
    ) {
      return reply(
        {
          success: false,
          message: "Choose an enabled default language.",
        },
        400,
      );
    }

    if (
      body.version !== null &&
      !(Number.isSafeInteger(body.version) && body.version >= 0)
    ) {
      return reply(
        { success: false, message: "Reload the language settings." },
        400,
      );
    }

    await connectDB();

    const existing = await KlinikoLanguages.findOne({
      key: "website",
    }).lean();

    if ((existing?.__v ?? null) !== body.version) {
      return reply(
        {
          success: false,
          message: "Settings changed. Reload before saving.",
        },
        409,
      );
    }

    let document;

    if (!existing) {
      document = await KlinikoLanguages.create({
        key: "website",
        defaultLanguage,
        languages,
      });
    } else {
      document = await KlinikoLanguages.findOneAndUpdate(
        {
          key: "website",
          __v: body.version,
        },
        {
          $set: {
            defaultLanguage,
            languages,
          },
          $inc: { __v: 1 },
        },
        {
          new: true,
          runValidators: true,
        },
      );
    }

    if (!document) {
      return reply(
        {
          success: false,
          message: "Settings changed. Reload before saving.",
        },
        409,
      );
    }

    return reply({
      success: true,
      languages: document.languages,
      defaultLanguage: document.defaultLanguage,
      version: document.__v,
    });
  } catch (error) {
    console.error("Languages POST:", error);

    return reply(
      {
        success: false,
        message:
          error?.code === 11000
            ? "Settings already exist. Reload before saving."
            : "Could not save languages.",
      },
      error?.code === 11000 ? 409 : 500,
    );
  }
}

// Remove a language from the language settings.
// Its old translations remain until the Language Syncer is run.
export async function DELETE(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    const parsed = await getRequestBody(request);
    if (parsed.error) {
      return reply({ success: false, message: parsed.error }, parsed.status);
    }

    const code = String(parsed.body?.code || "")
      .trim()
      .toLowerCase();

    if (!LANGUAGE_CODE_PATTERN.test(code)) {
      return reply(
        { success: false, message: "Enter a valid language code." },
        400,
      );
    }

    if (code === "en") {
      return reply(
        { success: false, message: "English cannot be deleted." },
        400,
      );
    }

    await connectDB();

    const settings = await KlinikoLanguages.findOne({
      key: "website",
    });

    if (!settings) {
      return reply(
        { success: false, message: "Language settings were not found." },
        404,
      );
    }

    if (settings.defaultLanguage === code) {
      return reply(
        {
          success: false,
          message: "Choose another default language before deleting it.",
        },
        400,
      );
    }

    if (!settings.languages.some((language) => language.code === code)) {
      return reply(
        { success: false, message: "This language does not exist." },
        404,
      );
    }

    const updated = await KlinikoLanguages.findOneAndUpdate(
      {
        key: "website",
        __v: settings.__v,
      },
      {
        $pull: {
          languages: { code },
        },
        $inc: { __v: 1 },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      return reply(
        {
          success: false,
          message: "Settings changed. Reload and try again.",
        },
        409,
      );
    }

    return reply({
      success: true,
      deletedCode: code,
      languages: updated.languages,
      defaultLanguage: updated.defaultLanguage,
      version: updated.__v,
    });
  } catch (error) {
    console.error("Languages DELETE:", error);

    return reply(
      { success: false, message: "Could not delete the language." },
      500,
    );
  }
}
