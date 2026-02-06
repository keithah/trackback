import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { parseBuffer } from "music-metadata";

type AudioMetadata = {
  durationSeconds: number | null;
  sampleRate: number | null;
  bitrateKbps: number | null;
  mimeType: string | null;
};

const uploadDir = path.join(process.cwd(), "public", "uploads");

function getFileExtension(name: string) {
  const ext = path.extname(name).toLowerCase();
  return ext.length > 1 ? ext : "";
}

function getSafeFilename(originalName: string) {
  const ext = getFileExtension(originalName) || ".bin";
  return `${randomUUID()}${ext}`;
}

function extractMetadata(buffer: Buffer, fallbackMime: string | null) {
  return parseBuffer(buffer, fallbackMime ?? undefined)
    .then((metadata: {
      format: {
        duration?: number | null;
        sampleRate?: number | null;
        bitrate?: number | null;
        mimeType?: string | null;
      };
    }) => {
      const durationSeconds = metadata.format.duration ?? null;
      const sampleRate = metadata.format.sampleRate ?? null;
      const bitrate = metadata.format.bitrate ?? null;

      return {
        durationSeconds,
        sampleRate,
        bitrateKbps: bitrate ? Math.round(bitrate / 1000) : null,
        mimeType: metadata.format.mimeType ?? fallbackMime ?? null,
      } satisfies AudioMetadata;
    })
    .catch(() => ({
      durationSeconds: null,
      sampleRate: null,
      bitrateKbps: null,
      mimeType: fallbackMime ?? null,
    } as AudioMetadata));
}

export async function storeUploadedAudio(file: File) {
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = getSafeFilename(file.name || "audio");
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, buffer);

  const metadata = await extractMetadata(buffer, file.type || null);

  return {
    url: `/uploads/${filename}`,
    path: filePath,
    metadata,
  };
}
