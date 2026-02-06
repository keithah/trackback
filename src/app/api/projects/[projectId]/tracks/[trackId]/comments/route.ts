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

const commentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  timestampSeconds: z.coerce.number().int().min(0),
  versionId: z.string().trim().optional(),
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ projectId: string; trackId: string }> }
) {
  try {
    const { projectId, trackId } = await params;
    const userId = await requireUserId();
    await requireProjectMember(userId, projectId);

    const comments = await prisma.comment.findMany({
      where: { trackId },
      orderBy: [{ timestampSeconds: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        body: true,
        timestampSeconds: true,
        createdAt: true,
        versionId: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ comments });
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

    const parsed = commentSchema.safeParse(body);

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

    if (parsed.data.versionId) {
      const version = await prisma.version.findFirst({
        where: { id: parsed.data.versionId, trackId },
        select: { id: true },
      });

      if (!version) {
        return jsonError("Version not found", 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        trackId,
        versionId: parsed.data.versionId,
        userId,
        body: parsed.data.body,
        timestampSeconds: parsed.data.timestampSeconds,
      },
      select: {
        id: true,
        body: true,
        timestampSeconds: true,
        createdAt: true,
        versionId: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
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
