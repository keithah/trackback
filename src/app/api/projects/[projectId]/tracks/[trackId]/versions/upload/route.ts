import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { parseBuffer } from "music-metadata";

import { prisma } from "@/db/prisma";
import { requireSession } from "@/lib/auth";
import { PermissionError, requireProjectMember } from "@/lib/permissions";
import { uploadToB2 } from "@/lib/storage/b2";

export const runtime = "nodejs";

const allowedMimeTypes = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/aiff",
  "audio/x-aiff",
  "audio/flac",
  "audio/x-flac",
]);

type AudioMetadata = {
  durationSeconds: number | null;
  sampleRate: number | null;
  bitrateKbps: number | null;
  mimeType: string | null;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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
    }));
}

async function requireUserId() {
  const session = await requireSession();
  const directId = (session.user as { id?: string } | undefined)?.id;

  if (directId) {
    return directId;
  }

  const email = session.user?.email;

  if (!email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user.id;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; trackId: string }> }
) {
  try {
    const { projectId, trackId } = await params;
    const userId = await requireUserId();
    await requireProjectMember(userId, projectId);

    const formData = await request.formData();
    const file = formData.get("file");
    const name = formData.get("name");
    const notes = formData.get("notes");

    if (!file || typeof (file as { arrayBuffer?: unknown }).arrayBuffer !== "function") {
      return jsonError("File is required", 400);
    }

    const fileValue = file as {
      arrayBuffer: () => Promise<ArrayBuffer>;
      type?: string;
      name?: string;
    };

    if (fileValue.type && !allowedMimeTypes.has(fileValue.type)) {
      return jsonError("Unsupported file type", 400);
    }

    const versionName =
      typeof name === "string" && name.trim()
        ? name.trim()
        : fileValue.name || "Audio upload";
    const versionNotes =
      typeof notes === "string" && notes.trim() ? notes.trim() : undefined;

    const track = await prisma.track.findFirst({
      where: { id: trackId, projectId },
      select: { id: true },
    });

    if (!track) {
      return jsonError("Not found", 404);
    }

    const buffer = Buffer.from(await fileValue.arrayBuffer());
    const metadata = await extractMetadata(buffer, fileValue.type || null);
    const versionId = randomUUID();
    const stored = await uploadToB2({
      projectId,
      trackId,
      versionId,
      filename: fileValue.name || "audio",
      body: buffer,
      contentType: fileValue.type || null,
    });
    const transactionResult = await prisma.$transaction([
      prisma.version.updateMany({
        where: { trackId },
        data: { isCurrent: false },
      }),
      prisma.version.create({
        data: {
          id: versionId,
          trackId,
          name: versionName,
          notes: versionNotes,
          audioUrl: stored.url,
          audioPath: stored.key,
          audioMime: metadata.mimeType,
          audioDurationSeconds: metadata.durationSeconds,
          audioSampleRate: metadata.sampleRate,
          audioBitrateKbps: metadata.bitrateKbps,
          audioSource: "UPLOAD",
          isCurrent: true,
        },
      }),
    ]);

    const version = transactionResult[1];

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error("Version upload error", error);
    if (error instanceof PermissionError) {
      return jsonError("Forbidden", 403);
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    if (error instanceof Error) {
      if (error.message.startsWith("Missing B2_")) {
        return jsonError("Storage is not configured", 500);
      }

      if (
        /AccessDenied|InvalidAccessKeyId|SignatureDoesNotMatch|CredentialsProviderError/i.test(
          error.message
        )
      ) {
        return jsonError("Storage credentials rejected", 500);
      }

      if (/NoSuchBucket/i.test(error.message)) {
        return jsonError("Storage bucket not found", 500);
      }

      if (/PermanentRedirect/i.test(error.message)) {
        return jsonError("Storage endpoint or region mismatch", 500);
      }
    }

    return jsonError("Internal server error", 500);
  }
}
