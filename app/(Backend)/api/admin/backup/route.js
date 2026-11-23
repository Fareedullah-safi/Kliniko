// =============================================
// BACKUP API — app/api/admin/backup/route.js
// =============================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import connectMongo from "@/Lib/mongoDB";
import Backup from "@/Models/Backup/Backup";

// --- SECTION & CONTENT MODELS ---
import AboutUs from "@/Models/AboutUs";
import CtaBanner from "@/Models/CtaBanner/CtaBanner";
import Features from "@/Models/Features";
import HomeSlider from "@/Models/HomeSlider";
import Projects from "@/Models/Projects/Projects";
import ServiceDetails from "@/Models/Services-Details/Service-Details/ServiceDetails";
import BlogSection from "@/Models/articles-section/BlogSection";
import brandLogoTitle from "@/Models/brand-logo-title";
import brandLogos from "@/Models/brand-logos";
import ReviewSection from "@/Models/counters/ReviewSection";
import Faq from "@/Models/faq/FAQ";

// --- ABOUT PAGE MODELS ---
import AboutUsFaqs from "@/Models/About-Page-Models/AboutUsFaqs/FAQS";
import Banner from "@/Models/About-Page-Models/Banner/Banner";
import MissionVision from "@/Models/About-Page-Models/MissionVision/MissionVision";

// --- FOOTER & PROFILE MODELS ---
import Footer from "@/Models/Footer/Footer";

// --- ADMIN USERS DATA ---
import AddAdmin from "@/Models/AdminUsers/AddAdmin";

// --- CONTACT PAGE DETAILS ---
import contactDetails from "@/Models/Contact-Page/contact-details/contact-details";

// --- CORE NAVIGATION & PAGES ---
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";

export const dynamic = "force-dynamic";

// How many automatic "before restore" backups to keep
const MAX_AUTO_BACKUPS = 5;

// Helper: send JSON response
const reply = (body, status = 200) => NextResponse.json(body, { status });

// Helper: convert MongoDB doc to plain object
const toPlain = (doc) => JSON.parse(JSON.stringify(doc));

// Helper: remove MongoDB internal fields we don't want to save
function cleanDoc(doc) {
  if (!doc) return null;
  const copy = toPlain(doc);
  delete copy._id;
  delete copy.__v;
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy;
}

// =============================================
// ★ FULL WEBSITE SECTION REGISTRY
// =============================================
// single: true  = Single document settings/banner (findOne)
// single: false = Array of documents/items (find)
// =============================================
const SECTIONS = [
  // Homepage Sections
  { key: "sliders", label: "Sliders", model: HomeSlider, single: false },
  { key: "features", label: "Features", model: Features, single: false },
  { key: "brandLogos", label: "Brand Logos", model: brandLogos, single: false },
  {
    key: "brandLogoTitle",
    label: "Brand Logo Title",
    model: brandLogoTitle,
    single: true,
  },
  {
    key: "aboutUsHome",
    label: "About Us (Home)",
    model: AboutUs,
    single: true,
  },
  {
    key: "services",
    label: "Services Details",
    model: ServiceDetails,
    single: false,
  },
  { key: "projects", label: "Projects", model: Projects, single: false },
  {
    key: "reviews",
    label: "Reviews & Counters",
    model: ReviewSection,
    single: false,
  },
  { key: "faqs", label: "FAQs", model: Faq, single: false },
  {
    key: "blogArticles",
    label: "Blog Articles",
    model: BlogSection,
    single: false,
  },
  { key: "ctaBanner", label: "CTA Banner", model: CtaBanner, single: true },

  // About Us Page Sections
  {
    key: "aboutBanner",
    label: "About Page Banner",
    model: Banner,
    single: true,
  },
  {
    key: "missionVision",
    label: "Mission & Vision",
    model: MissionVision,
    single: true,
  },
  {
    key: "aboutUsFaqs",
    label: "About Page FAQs",
    model: AboutUsFaqs,
    single: false,
  },

  // Footer & Contact
  { key: "footer", label: "Footer Settings", model: Footer, single: true },
  {
    key: "contactDetails",
    label: "Contact Details",
    model: contactDetails,
    single: true,
  },

  // System & Admin Users
  { key: "admins", label: "Admin Users", model: AddAdmin, single: false },
];
// =============================================

// ---------------------------------------------
// READ: grabs everything from live database
// ---------------------------------------------
async function readLiveSite() {
  console.log("[Backup] Reading live site data...");

  // 1. Pages
  const pages = toPlain(await Page.find({}).lean());
  console.log(`[Backup]   Pages: ${pages.length}`);

  // 2. Navbar
  const navbar = cleanDoc(await NavMenu.findOne({}).lean());
  console.log(`[Backup]   Navbar: ${navbar ? "found" : "empty"}`);

  // 3. All registered sections
  const sections = {};
  for (const sec of SECTIONS) {
    try {
      if (sec.single) {
        const doc = await sec.model.findOne({}).lean();
        sections[sec.key] = doc ? cleanDoc(doc) : null;
        console.log(`[Backup]   ${sec.label}: ${doc ? "found" : "empty"}`);
      } else {
        const docs = toPlain(await sec.model.find({}).lean());
        sections[sec.key] = docs;
        console.log(`[Backup]   ${sec.label}: ${docs.length} items`);
      }
    } catch (err) {
      console.error(`[Backup Error reading ${sec.label}]:`, err.message);
      sections[sec.key] = sec.single ? null : [];
    }
  }

  return { pages, navbar, sections };
}

// ---------------------------------------------
// SAVE: creates a backup document
// ---------------------------------------------
async function saveBackup({ name, note = "", kind = "manual" }) {
  console.log(`[Backup] Creating backup: "${name}" (kind: ${kind})`);

  const { pages, navbar, sections } = await readLiveSite();

  const backup = await Backup.create({
    name,
    note,
    kind,
    pages,
    pageCount: pages.length,
    navbar,
    sections,
  });

  console.log(`[Backup] Saved with ID: ${backup._id}`);

  // Clean up old auto-backups
  if (kind === "auto") {
    const old = await Backup.find({ kind: "auto" })
      .sort({ createdAt: -1 })
      .skip(MAX_AUTO_BACKUPS)
      .select("_id")
      .lean();
    if (old.length) {
      await Backup.deleteMany({ _id: { $in: old.map((b) => b._id) } });
      console.log(`[Backup] Cleaned up ${old.length} old auto-backups`);
    }
  }

  return { backup, pages, navbar, sections };
}

// ---------------------------------------------
// RESTORE: puts backup data back onto live site
// ---------------------------------------------
async function applyData({ pages, navbar, sections = {} }) {
  const results = [];

  // ---- PAGES ----
  if (pages && pages.length > 0) {
    try {
      await Page.deleteMany({});
      await Page.insertMany(pages);
      results.push(`✅ Pages: ${pages.length} restored`);
      console.log(`[Restore] ✅ Pages: ${pages.length} restored`);
    } catch (err) {
      results.push(`❌ Pages: FAILED — ${err.message}`);
      console.error(`[Restore] ❌ Pages failed:`, err.message);
      throw err;
    }
  } else {
    results.push("⏭️ Pages: skipped (backup is empty)");
    console.log("[Restore] ⏭️ Pages: skipped (backup is empty)");
  }

  // ---- NAVBAR ----
  const nav = cleanDoc(navbar);
  if (nav) {
    try {
      await NavMenu.deleteMany({});
      await NavMenu.create(nav);
      results.push("✅ Navbar: restored");
      console.log("[Restore] ✅ Navbar: restored");
    } catch (err) {
      results.push(`⚠️ Navbar: FAILED — ${err.message}`);
      console.error(`[Restore] ⚠️ Navbar failed:`, err.message);
    }
  } else {
    results.push("⏭️ Navbar: skipped (backup is empty)");
    console.log("[Restore] ⏭️ Navbar: skipped (backup is empty)");
  }

  // ---- SECTIONS ----
  for (const sec of SECTIONS) {
    const data = sections[sec.key];

    // SAFETY CHECK: skip if empty so live data stays untouched
    const hasData = sec.single ? !!data : data && data.length > 0;

    if (!hasData) {
      results.push(`⏭️ ${sec.label}: skipped (backup is empty)`);
      console.log(`[Restore] ⏭️ ${sec.label}: skipped (backup is empty)`);
      continue;
    }

    try {
      await sec.model.deleteMany({});

      if (sec.single) {
        await sec.model.create(data);
        results.push(`✅ ${sec.label}: restored (1 doc)`);
        console.log(`[Restore] ✅ ${sec.label}: restored (1 doc)`);
      } else {
        await sec.model.insertMany(data);
        results.push(`✅ ${sec.label}: ${data.length} restored`);
        console.log(`[Restore] ✅ ${sec.label}: ${data.length} restored`);
      }
    } catch (err) {
      results.push(`❌ ${sec.label}: FAILED — ${err.message}`);
      console.error(`[Restore] ❌ ${sec.label} failed:`, err.message);
    }
  }

  return results;
}

// =============================================
// GET — list all backups
// =============================================
export async function GET() {
  try {
    await connectMongo();

    const backups = await Backup.find({})
      .select("-pages -sections")
      .sort({ createdAt: -1 })
      .lean();

    return reply({
      success: true,
      backups: backups.map((b) => ({
        _id: b._id.toString(),
        name: b.name,
        note: b.note || "",
        kind: b.kind || "manual",
        pageCount: b.pageCount || 0,
        hasNavbar: !!b.navbar,
        sectionKeys: b.sections ? Object.keys(b.sections) : [],
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Backup GET Error]:", error);
    return reply({ success: false, message: "Server error" }, 500);
  }
}

// =============================================
// POST — create / restore / delete
// =============================================
export async function POST(req) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectMongo();

    let body;
    try {
      body = await req.json();
    } catch {
      return reply({ success: false, message: "Invalid JSON body" }, 400);
    }

    const { action, name, note, backupId } = body || {};

    // ---------- CREATE ----------
    if (action === "create") {
      if (!name || !name.trim()) {
        return reply(
          { success: false, message: "Backup name is required" },
          400,
        );
      }

      const { backup, pages, sections } = await saveBackup({
        name: name.trim(),
        note: note ? note.trim() : "",
      });

      const parts = [`${pages.length} pages`];
      for (const sec of SECTIONS) {
        const data = sections[sec.key];
        const count = sec.single ? (data ? 1 : 0) : data?.length || 0;
        if (count > 0) parts.push(`${count} ${sec.label.toLowerCase()}`);
      }
      if (backup.navbar) parts.push("navbar");

      return reply({
        success: true,
        navbarSaved: !!backup.navbar,
        message: `Backup created (${parts.join(" + ")})`,
      });
    }

    // ---------- RESTORE ----------
    if (action === "restore") {
      if (!mongoose.isValidObjectId(backupId)) {
        return reply(
          { success: false, message: "Valid backup ID required" },
          400,
        );
      }

      const backup = await Backup.findById(backupId).lean();
      if (!backup) {
        return reply({ success: false, message: "Backup not found" }, 404);
      }

      if (!backup.pages || backup.pages.length === 0) {
        return reply(
          {
            success: false,
            message:
              "This backup has no pages. Restoring it would empty your site. Nothing was changed.",
          },
          422,
        );
      }

      // 1. Automatic safety backup before restore
      console.log("[Restore] Step 1: Saving safety backup...");
      let safety;
      try {
        safety = await saveBackup({
          name: `Auto: before restoring "${backup.name}"`.slice(0, 120),
          note: "Created automatically before a restore",
          kind: "auto",
        });
        console.log("[Restore] Safety backup saved ✅");
      } catch (err) {
        console.error(
          "[Restore] ❌ Could not create safety backup:",
          err.message,
        );
        return reply(
          {
            success: false,
            message:
              "Could not create safety backup. Restore cancelled to protect your data.",
          },
          500,
        );
      }

      // 2. Apply Backup Data
      console.log("[Restore] Step 2: Applying backup data...");
      try {
        const results = await applyData({
          pages: backup.pages,
          navbar: backup.navbar,
          sections: backup.sections || {},
        });

        const failures = results.filter((r) => r.startsWith("❌"));
        if (failures.length > 0) {
          return reply({
            success: true,
            message: `Restore mostly succeeded, but some sections failed: ${failures.join(", ")}. Safety backup: "${safety.backup.name}".`,
          });
        }

        return reply({
          success: true,
          message: `Restore complete! All sections restored. Safety backup: "${safety.backup.name}".`,
        });
      } catch (error) {
        console.error("[Restore] ❌ Critical error:", error.message);
        console.log("[Restore] Step 3: Rolling back to safety backup...");

        try {
          await applyData({
            pages: safety.pages,
            navbar: safety.navbar,
            sections: safety.sections || {},
          });
          return reply(
            {
              success: false,
              message:
                "Restore failed, but your site was put back exactly as it was. Nothing was lost.",
            },
            500,
          );
        } catch (rollbackError) {
          return reply(
            {
              success: false,
              message: `CRITICAL: Restore failed. Manually restore safety backup "${safety.backup.name}".`,
            },
            500,
          );
        }
      }
    }

    // ---------- DELETE ----------
    if (action === "delete") {
      if (!mongoose.isValidObjectId(backupId)) {
        return reply(
          { success: false, message: "Valid backup ID required" },
          400,
        );
      }

      const delPerm = await requireDeletePermission();
      if (!delPerm.authorized) return delPerm.response;

      const deleted = await Backup.findByIdAndDelete(backupId);
      if (!deleted) {
        return reply({ success: false, message: "Backup not found" }, 404);
      }

      return reply({ success: true, message: "Backup deleted successfully" });
    }

    return reply({ success: false, message: "Invalid action" }, 400);
  } catch (error) {
    console.error("[Backup POST Error]:", error);
    return reply(
      { success: false, message: "Server error. Check the server logs." },
      500,
    );
  }
}
