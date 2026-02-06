import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";
import { requireSession } from "@/lib/auth";
import { PermissionError, requireProjectMember } from "@/lib/permissions";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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

const externalVersionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  notes: z.string().trim().min(1).max(2000).optional(),
  externalUrl: z.string().trim().url(),
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ projectId: string; trackId: string }> }
) {
  try {
    const { projectId, trackId } = await params;
    const userId = await requireUserId();
    await requireProjectMember(userId, projectId);

    const versions = await prisma.version.findMany({
      where: { trackId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        notes: true,
        audioUrl: true,
        audioMime: true,
        audioDurationSeconds: true,
        audioSampleRate: true,
        audioBitrateKbps: true,
        audioSource: true,
        isCurrent: true,
        sessionLabel: true,
        sessionCreatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    if (error instanceof PermissionError) {
      return jsonError("Forbidden", 403);
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return jsonError("Internal server error", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; trackId: string }> }
) {
  try {
    const { projectId, trackId } = await params;
    const userId = await requireUserId();
    await requireProjectMember(userId, projectId);

    const body = await request.json().catch(() => null);

    if (!body) {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = externalVersionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const track = await prisma.track.findFirst({
      where: { id: trackId, projectId },
      select: { id: true },
    });

    if (!track) {
      return jsonError("Not found", 404);
    }

    const transactionResult = await prisma.$transaction([
      prisma.version.updateMany({
        where: { trackId },
        data: { isCurrent: false },
      }),
      prisma.version.create({
        data: {
          trackId,
          name: parsed.data.name,
          notes: parsed.data.notes,
          audioUrl: parsed.data.externalUrl,
          audioSource: "EXTERNAL",
          isCurrent: true,
        },
      }),
    ]);

    const version = transactionResult[1];

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    if (error instanceof PermissionError) {
      return jsonError("Forbidden", 403);
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return jsonError("Internal server error", 500);
  }
}
