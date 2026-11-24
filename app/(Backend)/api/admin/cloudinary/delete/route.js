import { requireDeletePermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    // 1. Check admin delete permission
    const permission = await requireDeletePermission();

    if (!permission.authorized) {
      return permission.response;
    }

    // 2. Get old image public ID
    const { publicId } = await req.json();

    if (
      typeof publicId !== "string" ||
      !publicId.trim() ||
      publicId.length > 250 ||
      !/^[a-zA-Z0-9_./-]+$/.test(publicId) ||
      publicId.split("/").includes("..")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid image ID" },
        { status: 400 },
      );
    }

    // 3. Configure Cloudinary
    cloudinary.config({
      cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    // 4. Verify image belongs to Kliniko
    let asset;

    try {
      asset = await cloudinary.api.resource(publicId);
    } catch (error) {
      if (error.http_code === 404) {
        return NextResponse.json({ success: true });
      }
      throw error;
    }

    const folder = asset.asset_folder ?? asset.folder;

    const allowed =
      folder != null
        ? folder === "kliniko/images" || folder.startsWith("kliniko/images/")
        : publicId.startsWith("kliniko/images/");

    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Image is outside Kliniko folder" },
        { status: 403 },
      );
    }

    // 5. Delete old image
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (!["ok", "not found"].includes(result.result)) {
      throw new Error("Cloudinary deletion failed");
    }

    return NextResponse.json({
      success: true,
      message: "Old image deleted successfully",
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete image" },
      { status: 500 },
    );
  }
}
