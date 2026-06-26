"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { issues } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function createIssue(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);
  const address = formData.get("address") as string;
  const imageFile = formData.get("image") as File | null;

  // validate
  if (!title || !description || !category || isNaN(lat) || isNaN(lng)) {
    throw new Error("Missing required fields");
  }

  let imageUrl: string | null = null;

  // upload image to cloudinary if provided
  if (imageFile && imageFile.size > 0) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "civic-fixit",
            transformation: [{ width: 1200, quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result.secure_url);
          }
        )
        .end(buffer);
    });

    imageUrl = uploaded;
  }

  await db.insert(issues).values({
    title: title.trim(),
    description: description.trim(),
    category: category as any,
    lat,
    lng,
    address: address || null,
    imageUrl,
    userId: session.user.id,
  });

  redirect("/map");
}