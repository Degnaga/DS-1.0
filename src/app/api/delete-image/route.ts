import ImageKit from "imagekit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  });

  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "Missing fileId" },
        { status: 400 }
      );
    }

    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Image deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
