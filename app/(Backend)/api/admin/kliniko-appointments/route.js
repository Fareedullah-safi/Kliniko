import mongoose from "mongoose";
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

import { requireDeletePermission } from "@/Lib/AdminPermission/adminPermissions";
import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";
import connectDB from "@/Lib/mongoDB";
import Appointment from "@/Models/Kliniko/Appointment";
import KlinikoSection from "@/Models/Kliniko/KlinikoSection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "Diagnostics",
];

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const day = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(day.getTime()) && day.toISOString().slice(0, 10) === value
  );
}

// Public form submission.
export async function POST(request) {
  let body;

  try {
    const raw = await request.text();

    if (raw.length > 16000) {
      return reply({ success: false, message: "Request too large." }, 413);
    }

    body = JSON.parse(raw);
  } catch {
    return reply(
      { success: false, message: "Invalid appointment request." },
      400,
    );
  }

  const name = text(body?.name);
  const email = text(body?.email);
  const phone = text(body?.phone);
  const department = text(body?.department);
  const doctorId = text(body?.doctor);
  const date = text(body?.date);
  const message = text(body?.message);

  if (!name || name.length > 100) {
    return reply({ success: false, message: "Enter your name." }, 400);
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(
      { success: false, message: "Enter a valid email address." },
      400,
    );
  }

  if (!phone || phone.length > 40) {
    return reply({ success: false, message: "Enter your phone number." }, 400);
  }

  if (!DEPARTMENTS.includes(department)) {
    return reply(
      { success: false, message: "Select a valid department." },
      400,
    );
  }

  if (!doctorId || doctorId.length > 200 || !validDate(date)) {
    return reply(
      { success: false, message: "Select a doctor and a valid date." },
      400,
    );
  }

  if (message.length > 2000) {
    return reply({ success: false, message: "Your message is too long." }, 400);
  }

  try {
    await connectDB();

    // Look up only the selected card. This also checks whether the doctor
    // was removed after the visitor opened the homepage.
    const section = await KlinikoSection.findOne(
      { section: "doctors", "cards.id": doctorId },
      { "cards.$": 1, _id: 0 },
    ).lean();

    const card = section?.cards?.[0];
    const rawName = typeof card?.name === "string" ? card.name : card?.name?.en;

    const doctorName = sanitizeHtml(text(rawName), {
      allowedTags: [],
      allowedAttributes: {},
    })
      .replace(/&nbsp;|\u00a0/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();

    if (!doctorName) {
      return reply(
        {
          success: false,
          message:
            "This doctor is no longer available. Refresh the page and select again.",
        },
        409,
      );
    }

    await Appointment.create({
      name,
      email,
      phone,
      department,
      doctorId,
      doctorName: doctorName.slice(0, 200),
      date,
      message,
    });

    return reply(
      {
        success: true,
        message: "Your appointment request has been submitted.",
      },
      201,
    );
  } catch (error) {
    console.error("Appointment POST failed:", error?.name);

    return reply(
      { success: false, message: "Could not save the appointment request." },
      500,
    );
  }
}

// Private list used by your existing /admin/messages page.
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session?.uid) {
      return reply({ success: false, message: "Admin login required." }, 401);
    }

    if (!["super-admin", "admin"].includes(session.role)) {
      return reply({ success: false, message: "Admin access required." }, 403);
    }

    await connectDB();

    const data = await Appointment.find({})
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return reply({ success: true, data });
  } catch (error) {
    console.error("Appointment GET failed:", error?.name);

    return reply(
      { success: false, message: "Could not load appointments." },
      500,
    );
  }
}

// Delete one appointment from the admin inbox.
export async function DELETE(request) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) return permission.response;

    const id = new URL(request.url).searchParams.get("id");

    if (!mongoose.isObjectIdOrHexString(id)) {
      return reply({ success: false, message: "Invalid appointment ID." }, 400);
    }

    await connectDB();

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return reply({ success: false, message: "Appointment not found." }, 404);
    }

    return reply({ success: true, message: "Appointment deleted." });
  } catch (error) {
    console.error("Appointment DELETE failed:", error?.name);

    return reply(
      { success: false, message: "Could not delete the appointment." },
      500,
    );
  }
}
