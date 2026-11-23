import { requireDeletePermission } from "@/Lib/AdminPermission/adminPermissions";
import connectDB from "@/Lib/mongoDB";
import Contact from "@/Models/home/Contact";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// ==========================================
// POST ROUTE (CREATE CONTACT MESSAGE)
// ==========================================
export async function POST(request) {
  try {
    const { fullName, email, phone, service, message } = await request.json();

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const contact = await Contact.create({
      fullName,
      email,
      phone,
      service: service || "",
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been submitted successfully.",
        data: contact,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit your message.",
      },
      { status: 500 },
    );
  }
}

// ==========================================
// GET ROUTE (GET ALL MESSAGES)
// ==========================================
export async function GET() {
  try {
    await connectDB();
    const messages = await Contact.find().sort({ createdAt: -1 }); // Newest first
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Contact GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Error loading messages" },
      { status: 500 },
    );
  }
}

// ==========================================
// DELETE ROUTE (DIRECT DELETE MESSAGE)
// ==========================================
export async function DELETE(request) {
  try {
    const permission = await requireDeletePermission();

    if (!permission.authorized) {
      return permission.response;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Valid message ID is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete message" },
      { status: 500 },
    );
  }
}
