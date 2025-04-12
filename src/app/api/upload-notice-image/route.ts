import ImageKit from "imagekit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const uploadResponse = await imagekit.upload({
      file: Buffer.from(await file.arrayBuffer()),
      fileName: `notice-${Date.now()}`,
      folder: "/users-notices/",
      useUniqueFileName: true,
    });

    return NextResponse.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
