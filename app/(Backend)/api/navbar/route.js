import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import { normalizeTranslations } from "@/Lib/Kliniko/translation";
import connectDB from "@/Lib/mongoDB";
import KlinikoNavbar from "@/Models/KlinikoNavbar/KlinikoNavbar";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAVBAR_KEY = "main";

const TRANSLATED_FIELDS = [
  "brand",
  "searchTitle",
  "searchSubtitle",
  "searchPlaceholder",
  "appointmentText",
];

// Allows caching on public loads to eliminate MongoDB latency/delay
function reply(data, status = 200, isPublic = false) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": isPublic
        ? "public, s-maxage=60, stale-while-revalidate=300"
        : "no-store",
    },
  });
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanTranslations(value) {
  const normalized = normalizeTranslations(value);

  return Object.fromEntries(
    Object.entries(normalized).map(([code, translation]) => [
      code,
      translation.slice(0, 500),
    ]),
  );
}

function isValidLink(value) {
  if (typeof value !== "string") return false;

  return (
    /^\/(?!\/)\S*$/.test(value) ||
    /^#[\w-]+$/.test(value) ||
    /^https?:\/\/\S+$/i.test(value)
  );
}

function isValidLogo(value) {
  return !value || /^https:\/\/\S+$/i.test(value);
}

function stringFlag(value) {
  return value === true || value === "true" ? "true" : "false";
}

function prepareContent(input = {}) {
  const content = {
    logo: text(input.logo),
    logoPublicId: text(input.logoPublicId),
    appointmentLink: text(input.appointmentLink) || "/appointment",
  };

  for (const field of TRANSLATED_FIELDS) {
    content[field] = cleanTranslations(input[field]);
  }

  return content;
}

function prepareCards(input) {
  return input.map((item) => ({
    id: text(item?.id),
    label: cleanTranslations(item?.label),
    link: text(item?.link),
    parentId: text(item?.parentId),
    hasDropdown: stringFlag(item?.hasDropdown),
    showInFooter: stringFlag(item?.showInFooter),
  }));
}

function validateCards(cards) {
  if (!Array.isArray(cards) || cards.length > 50) {
    return "Add no more than 50 menu items.";
  }

  const ids = cards.map((card) => card.id);

  if (new Set(ids).size !== ids.length) {
    return "Menu item IDs must be unique.";
  }

  const rootMenus = new Map();

  for (const card of cards) {
    if (!card.parentId) {
      rootMenus.set(card.id, card);
    }
  }

  for (const card of cards) {
    const validId = /^[a-z0-9_-]{1,80}$/i.test(card.id);
    const englishLabel = card.label.en?.trim();
    const validParent =
      !card.parentId || rootMenus.get(card.parentId)?.hasDropdown === "true";

    if (!validId || !englishLabel || !isValidLink(card.link) || !validParent) {
      return "Check menu names, links, and dropdown structure.";
    }
  }

  return "";
}

// GET Navbar data (Public reads load instantly, admin gets fresh data)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get("public") === "1";

    await connectDB();

    const navbar = await KlinikoNavbar.findOne({
      key: NAVBAR_KEY,
    }).lean();

    return reply(
      {
        success: true,
        version: navbar?.__v ?? null,
        data: {
          content: navbar?.content || {},
          cards: navbar?.cards || [],
        },
      },
      200,
      isPublic,
    );
  } catch (error) {
    console.error("Navbar GET:", error);
    return reply({ success: false, message: "Could not load Navbar." }, 500);
  }
}

// POST creates the Navbar once, then updates it on later saves.
export async function POST(request) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }

    const rawBody = await request.text();

    if (rawBody.length > 150_000) {
      return reply({ success: false, message: "Request is too large." }, 413);
    }

    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return reply(
        { success: false, message: "Request contains invalid JSON." },
        400,
      );
    }

    if (
      body.version !== null &&
      (!Number.isSafeInteger(body.version) || body.version < 0)
    ) {
      return reply({ success: false, message: "Reload before saving." }, 400);
    }

    if (!Array.isArray(body.cards)) {
      return reply(
        { success: false, message: "Menu items must be a list." },
        400,
      );
    }

    const content = prepareContent(body.content);

    if (!isValidLogo(content.logo) || !isValidLink(content.appointmentLink)) {
      return reply(
        { success: false, message: "Check the logo and appointment URL." },
        400,
      );
    }

    const cards = prepareCards(body.cards);
    const cardError = validateCards(cards);

    if (cardError) {
      return reply({ success: false, message: cardError }, 400);
    }

    await connectDB();

    // Look up the Navbar first to avoid trying to create a duplicate.
    const existingNavbar = await KlinikoNavbar.findOne({
      key: NAVBAR_KEY,
    }).lean();

    if (!existingNavbar && body.version !== null) {
      return reply(
        {
          success: false,
          message: "Navbar was not found. Reload the page and try again.",
        },
        409,
      );
    }

    if (existingNavbar && body.version === null) {
      return reply(
        {
          success: false,
          message: "Navbar already exists. Reload the page before saving.",
        },
        409,
      );
    }

    let navbar;

    if (!existingNavbar) {
      navbar = await KlinikoNavbar.create({
        key: NAVBAR_KEY,
        content,
        cards,
      });
    } else {
      navbar = await KlinikoNavbar.findOneAndUpdate(
        {
          key: NAVBAR_KEY,
          __v: body.version,
        },
        {
          $set: { content, cards },
          $inc: { __v: 1 },
        },
        {
          new: true,
          runValidators: true,
        },
      );
    }

    if (!navbar) {
      return reply(
        {
          success: false,
          message: "Navbar changed. Reload the page before saving.",
        },
        409,
      );
    }

    return reply({
      success: true,
      version: navbar.__v,
      data: {
        content: navbar.content,
        cards: navbar.cards,
      },
    });
  } catch (error) {
    console.error("Navbar POST:", error);

    const isDuplicate = error?.code === 11000;

    return reply(
      {
        success: false,
        message: isDuplicate
          ? "Navbar already exists. Reload the page before saving."
          : "Could not save Navbar.",
      },
      isDuplicate ? 409 : 500,
    );
  }
}
