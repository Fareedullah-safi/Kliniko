import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";
import connectDB from "@/Lib/mongoDB";

import { getSectionConfig } from "@/Lib/Kliniko/sections";
import { validateSectionDraft } from "@/Lib/Kliniko/validateSection";

import KlinikoSection from "@/Models/Kliniko/KlinikoSection";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Maximum JSON request size: 1 MB.
// Images are uploaded separately to Cloudinary.
const MAX_BODY_SIZE = 1024 * 1024;

const ADMIN_ROLES = new Set(["super-admin", "admin", "editor", "viewer"]);

// ==========================================
// RESPONSE HELPER
// ==========================================

function send(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

// ==========================================
// CHECK SECTION NAME
// ==========================================

async function resolveSection(context) {
  const { section } = await context.params;

  const config = getSectionConfig(section);

  return {
    section,
    config,
  };
}

// ==========================================
// CHECK ADMIN READ ACCESS
// ==========================================

async function canRead() {
  const session = await getAdminSession();

  return Boolean(session?.uid && ADMIN_ROLES.has(session.role));
}

// ==========================================
// PARSE JSON SAFELY
// ==========================================

async function parseBody(request) {
  const declaredSize = Number(request.headers.get("content-length") || 0);

  if (declaredSize > MAX_BODY_SIZE) {
    return {
      error: "Request body is too large.",
      status: 413,
    };
  }

  const contentType = request.headers.get("content-type") || "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return {
      error: "Content-Type must be application/json.",
      status: 415,
    };
  }

  try {
    const raw = await request.text();

    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_SIZE) {
      return {
        error: "Request body is too large.",
        status: 413,
      };
    }

    const body = JSON.parse(raw);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return {
        error: "Invalid request body.",
        status: 400,
      };
    }

    return { body };
  } catch {
    return {
      error: "Invalid JSON request body.",
      status: 400,
    };
  }
}

// ==========================================
// GET SECTION DATA
// ==========================================

export async function GET(request, context) {
  try {
    // 1. Validate the section.
    const { section, config } = await resolveSection(context);

    if (!config) {
      return send(
        {
          success: false,
          message: "Invalid Kliniko section.",
        },
        404,
      );
    }

    // 2. Admin authentication.
    // All admin roles may read the CMS.
    if (!(await canRead())) {
      return send(
        {
          success: false,
          message: "Admin login required.",
        },
        401,
      );
    }

    // 3. Connect to database.
    await connectDB();

    // 4. Find only the requested section.
    const document = await KlinikoSection.findOne({
      section,
    })
      .select("content cards revision updatedAt")
      .lean();

    // 5. Return data to the reusable editor.
    return send({
      success: true,
      section,
      exists: Boolean(document),

      data: {
        content: document?.content || {},
        cards: document?.cards || [],
      },

      revision: document?.revision ?? 0,
      updatedAt: document?.updatedAt || null,
    });
  } catch (error) {
    console.error("Kliniko GET error:", error);

    return send(
      {
        success: false,
        message: "Unable to load section data.",
      },
      500,
    );
  }
}

// ==========================================
// POST — CREATE / UPDATE SECTION
// ==========================================

export async function POST(request, context) {
  try {
    // 1. Validate the requested section.
    const { section, config } = await resolveSection(context);

    if (!config) {
      return send(
        {
          success: false,
          message: "Invalid Kliniko section.",
        },
        404,
      );
    }

    // 2. Check edit permissions.
    // Viewer cannot edit content.
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }

    // 3. Read and validate JSON.
    const parsed = await parseBody(request);

    if (parsed.error) {
      return send(
        {
          success: false,
          message: parsed.error,
        },
        parsed.status,
      );
    }

    const body = parsed.body;

    // 4. Require an expected revision.
    // 0 means the section has never been saved.
    const expectedRevision = body.expectedRevision;

    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      return send(
        {
          success: false,
          message: "A valid expectedRevision is required.",
        },
        400,
      );
    }

    // 5. Connect to MongoDB.
    await connectDB();

    // 6. Read the existing document.
    const existing = await KlinikoSection.findOne({
      section,
    }).lean();

    const currentRevision = existing?.revision ?? 0;

    // 7. Prevent outdated saves.
    if (currentRevision !== expectedRevision) {
      return send(
        {
          success: false,
          message:
            "This section was updated by another admin. Reload the latest content before saving.",
          currentRevision,
        },
        409,
      );
    }

    // 8. Validate the section fields.
    // Uses sections.js and validateSection.js.
    const { data, errors } = validateSectionDraft(
      config,
      {
        content: body.content,
        cards: body.cards,
      },
      existing,
    );

    if (!data) {
      return send(
        {
          success: false,
          message: "Please correct the invalid fields.",
          errors,
        },
        400,
      );
    }

    let saved;

    // ======================================
    // CREATE NEW SECTION
    // ======================================

    if (!existing) {
      try {
        saved = await KlinikoSection.create({
          section,
          content: data.content,
          cards: data.cards,
          revision: 1,
        });
      } catch (error) {
        // Another admin may have created
        // the same section simultaneously.
        if (error.code === 11000) {
          return send(
            {
              success: false,
              message:
                "Another admin created this section. Reload before saving.",
            },
            409,
          );
        }

        throw error;
      }
    }

    // ======================================
    // UPDATE EXISTING SECTION
    // ======================================
    else {
      saved = await KlinikoSection.findOneAndUpdate(
        {
          section,
          revision: expectedRevision,
        },
        {
          $set: {
            content: data.content,
            cards: data.cards,
          },

          $inc: {
            revision: 1,
          },
        },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

      // Another save happened while
      // this request was being processed.
      if (!saved) {
        return send(
          {
            success: false,
            message:
              "Save conflict. Another admin updated this section. Reload before saving.",
          },
          409,
        );
      }
    }

    // ======================================
    // SUCCESS RESPONSE
    // ======================================

    return send({
      success: true,
      message: `${config.name} saved successfully.`,

      section,

      data: {
        content: saved.content,
        cards: saved.cards,
      },

      revision: saved.revision,
      updatedAt: saved.updatedAt,
    });
  } catch (error) {
    console.error("Kliniko POST error:", error);

    return send(
      {
        success: false,
        message: "Unable to save section.",
      },
      500,
    );
  }
}
