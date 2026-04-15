import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB input
const IMAGE_MAX_DIM = 1600;
const IMAGE_QUALITY = 75;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envió archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no válido. Sube JPG, PNG, WebP o PDF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede 5 MB" },
        { status: 400 },
      );
    }

    const input = Buffer.from(await file.arrayBuffer());

    let storedBuffer: Buffer;
    let storedMime: string;

    if (file.type === "application/pdf") {
      storedBuffer = input;
      storedMime = "application/pdf";
    } else {
      // Compress to JPEG, cap dimension, strip metadata
      storedBuffer = await sharp(input)
        .rotate()
        .resize({ width: IMAGE_MAX_DIM, height: IMAGE_MAX_DIM, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: IMAGE_QUALITY, mozjpeg: true })
        .toBuffer();
      storedMime = "image/jpeg";
    }

    const row = await prisma.comprobanteArchivo.create({
      data: {
        mimeType: storedMime,
        data: storedBuffer,
        sizeBytes: storedBuffer.length,
      },
      select: { id: true },
    });

    const url = `/api/comprobantes/${row.id}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
