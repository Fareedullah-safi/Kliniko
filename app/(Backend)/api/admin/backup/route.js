import mongoose from "mongoose";
import { NextResponse } from "next/server";

import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";

import connectDB from "@/Lib/mongoDB";
import Backup from "@/Models/Backup/Backup";
import KlinikoSection from "@/Models/Kliniko/KlinikoSection";
import KlinikoNavbar from "@/Models/KlinikoNavbar/KlinikoNavbar";
import Page from "@/Models/Pages/Page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUTO_BACKUPS = 5;

// Send the same response format your Backup Manager already uses.
function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNavbar(value) {
  return isObject(value?.content) && Array.isArray(value.cards);
}

// Older backups may also contain Bexon groups inside "sections".
// Only this key belongs to the Kliniko section model.
function getSavedSections(backup) {
  return backup.sections?.klinikoSections ?? [];
}

// --------------------------------------------------
// CREATE A BACKUP
// --------------------------------------------------

async function createBackup({ name, note = "", kind = "manual" }) {
  const [pages, navbar, sections] = await Promise.all([
    Page.find({}).lean(),

    KlinikoNavbar.findOne({ key: "main" })
      .select("key content cards -_id")
      .lean(),

    KlinikoSection.find({}).select("section content cards -_id").lean(),
  ]);

  const backup = await Backup.create({
    name,
    note,
    kind,
    pages,
    pageCount: pages.length,
    navbar,
    sections: {
      klinikoSections: sections,
    },
  });

  return backup;
}

// Keep the five most recent automatic safety backups.
async function pruneAutoBackups() {
  const oldBackups = await Backup.find({ kind: "auto" })
    .sort({ createdAt: -1, _id: -1 })
    .skip(MAX_AUTO_BACKUPS)
    .select("_id")
    .lean();

  if (oldBackups.length > 0) {
    await Backup.deleteMany({
      _id: { $in: oldBackups.map((backup) => backup._id) },
    });
  }
}

// --------------------------------------------------
// CHECK A SNAPSHOT BEFORE CHANGING LIVE DATA
// --------------------------------------------------

async function checkSnapshot(backup) {
  const pages = backup.pages ?? [];
  const sections = getSavedSections(backup);

  if (!Array.isArray(pages) || !Array.isArray(sections)) {
    throw new Error("The saved backup has an invalid format.");
  }

  const pageIds = new Set();

  for (const page of pages) {
    if (!isObject(page) || !mongoose.isValidObjectId(page._id)) {
      throw new Error("A saved page has an invalid ID.");
    }

    const id = String(page._id);

    if (pageIds.has(id)) {
      throw new Error("The backup contains a duplicate page ID.");
    }

    pageIds.add(id);

    // Check the page model before replacing the live pages.
    await new Page(page).validate();
  }

  const sectionNames = new Set();

  for (const item of sections) {
    if (
      typeof item?.section !== "string" ||
      !item.section.trim() ||
      !isObject(item.content) ||
      !Array.isArray(item.cards) ||
      sectionNames.has(item.section)
    ) {
      throw new Error("The backup contains an invalid or duplicate section.");
    }

    sectionNames.add(item.section);

    await new KlinikoSection({
      section: item.section,
      content: item.content,
      cards: item.cards,
    }).validate();
  }

  if (pages.length === 0 && sections.length === 0 && !isNavbar(backup.navbar)) {
    throw new Error(
      "This backup has no pages, Kliniko navbar, or Kliniko sections.",
    );
  }
}

// --------------------------------------------------
// RESTORE A BACKUP
// --------------------------------------------------

async function restoreBackup(backup) {
  const pages = backup.pages ?? [];
  const sections = getSavedSections(backup);
  const restored = [];

  // An empty pages array skips pages, matching your existing route.
  if (pages.length > 0) {
    await Page.deleteMany({});
    await Page.insertMany(pages);
    restored.push(`${pages.length} pages`);
  }

  // Older Bexon navbar snapshots used a different structure.
  // Only apply snapshots with Kliniko's content and cards fields.
  if (isNavbar(backup.navbar)) {
    await KlinikoNavbar.updateOne(
      { key: "main" },
      {
        $set: {
          content: backup.navbar.content,
          cards: backup.navbar.cards,
        },
        $inc: { __v: 1 },
      },
      { upsert: true, runValidators: true },
    );

    restored.push("navbar");
  }

  // Restore each saved section by name. Sections created later stay in place.
  for (const item of sections) {
    await KlinikoSection.updateOne(
      { section: item.section },
      {
        $set: {
          content: item.content,
          cards: item.cards,
        },
        $inc: { revision: 1 },
      },
      { upsert: true, runValidators: true },
    );
  }

  if (sections.length > 0) {
    restored.push(`${sections.length} website sections`);
  }

  return restored;
}

// --------------------------------------------------
// GET /api/admin/backup
// List backups for the existing admin page.
// --------------------------------------------------

export async function GET() {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectDB();

    // Return only the metadata needed by the backup list.
    const backups = await Backup.aggregate([
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $project: {
          _id: { $toString: "$_id" },
          name: 1,
          createdAt: 1,
          note: { $ifNull: ["$note", ""] },
          kind: { $ifNull: ["$kind", "manual"] },
          pageCount: { $ifNull: ["$pageCount", 0] },
          hasNavbar: {
            $and: [
              { $eq: [{ $type: "$navbar.content" }, "object"] },
              { $isArray: "$navbar.cards" },
            ],
          },
          sectionKeys: {
            $map: {
              input: {
                $cond: [
                  { $isArray: "$sections.klinikoSections" },
                  "$sections.klinikoSections",
                  [],
                ],
              },
              as: "item",
              in: "$$item.section",
            },
          },
        },
      },
    ]);

    return reply({ success: true, backups });
  } catch (error) {
    console.error("Backup GET:", error);
    return reply({ success: false, message: "Could not load backups." }, 500);
  }
}

// --------------------------------------------------
// POST /api/admin/backup
// Actions used by the admin page: create, restore, delete.
// --------------------------------------------------

export async function POST(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    let body;

    try {
      body = await request.json();
    } catch {
      return reply({ success: false, message: "Invalid JSON." }, 400);
    }

    const { action, backupId } = body ?? {};

    if (!["create", "restore", "delete"].includes(action)) {
      return reply({ success: false, message: "Invalid backup action." }, 400);
    }

    await connectDB();

    if (action === "create") {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const note = typeof body.note === "string" ? body.note.trim() : "";

      if (!name || name.length > 120 || note.length > 240) {
        return reply(
          {
            success: false,
            message:
              "Enter a name of 1–120 characters and a note of up to 240 characters.",
          },
          400,
        );
      }

      const backup = await createBackup({ name, note });
      const sectionCount = getSavedSections(backup).length;
      const parts = [`${backup.pageCount} pages`, `${sectionCount} sections`];

      if (backup.navbar) parts.push("navbar");

      return reply({
        success: true,
        navbarSaved: Boolean(backup.navbar),
        message: `Backup created (${parts.join(" + ")}).`,
      });
    }

    if (typeof backupId !== "string" || !mongoose.isValidObjectId(backupId)) {
      return reply({ success: false, message: "Invalid backup ID." }, 400);
    }

    if (action === "delete") {
      const deletePermission = await requireDeletePermission();
      if (!deletePermission.authorized) return deletePermission.response;

      const deleted = await Backup.findByIdAndDelete(backupId);

      if (!deleted) {
        return reply({ success: false, message: "Backup not found." }, 404);
      }

      return reply({ success: true, message: "Backup deleted successfully." });
    }

    // Restore
    const backup = await Backup.findById(backupId).lean();

    if (!backup) {
      return reply({ success: false, message: "Backup not found." }, 404);
    }

    try {
      await checkSnapshot(backup);
    } catch (error) {
      console.error("Backup validation:", error);
      return reply(
        {
          success: false,
          message:
            "This backup has invalid data or no supported content. Restore cancelled.",
        },
        422,
      );
    }

    // Save the current site before the first live write.
    let safety;

    try {
      safety = await createBackup({
        name: `Auto: before restoring "${backup.name}"`.slice(0, 120),
        note: "Created automatically before restoring a backup.",
        kind: "auto",
      });
    } catch (error) {
      console.error("Safety backup:", error);
      return reply(
        {
          success: false,
          message: "Could not create the safety backup. Restore cancelled.",
        },
        500,
      );
    }

    let restored;

    try {
      restored = await restoreBackup(backup);
    } catch (error) {
      console.error("Backup restore:", error);

      try {
        await restoreBackup(safety);

        return reply(
          {
            success: false,
            message: `Restore failed. Saved records from "${safety.name}" were reapplied. Check the site before retrying.`,
          },
          500,
        );
      } catch (rollbackError) {
        console.error("Safety restore:", rollbackError);

        return reply(
          {
            success: false,
            message: `Restore and recovery both failed. The safety backup is "${safety.name}".`,
          },
          500,
        );
      }
    }

    // Retention runs after restore so a failed restore keeps its recovery point.
    try {
      await pruneAutoBackups();
    } catch (error) {
      console.error("Automatic backup cleanup:", error);
    }

    return reply({
      success: true,
      message: `Restored ${restored.join(" + ")}. Safety backup: "${safety.name}".`,
    });
  } catch (error) {
    console.error("Backup POST:", error);
    return reply(
      {
        success: false,
        message: "Backup request failed. Check the server logs.",
      },
      500,
    );
  }
}
