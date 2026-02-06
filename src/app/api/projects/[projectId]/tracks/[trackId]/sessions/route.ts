import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/db/prisma";
import { requireSession } from "@/lib/auth";
import { PermissionError, requireProjectMember, requireProjectOwner } from "@/lib/permissions";

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

const sessionSchema = z.object({
  label: z.string().trim().min(1).max(120),
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ projectId: string; trackId: string }> }
) {
  try {
    const { projectId, trackId } = await params;
    const userId = await requireUserId();
    await requireProjectMember(userId, projectId);

    const milestones = await prisma.version.findMany({
      where: {
        trackId,
        sessionLabel: { not: null },
      },
      orderBy: { sessionCreatedAt: "desc" },
      select: {
        id: true,
        name: true,
        sessionLabel: true,
        sessionCreatedAt: true,
      },
    });

    return NextResponse.json({ milestones });
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
    await requireProjectOwner(userId, projectId);

    const body = await request.json().catch(() => null);

    if (!body) {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = sessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const currentVersion = await prisma.version.findFirst({
      where: { trackId, isCurrent: true },
      select: { id: true },
    });

    if (!currentVersion) {
      return jsonError("No current version", 409);
    }

    const version = await prisma.version.update({
      where: { id: currentVersion.id },
      data: {
        sessionLabel: parsed.data.label,
        sessionCreatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        sessionLabel: true,
        sessionCreatedAt: true,
      },
    });

    return NextResponse.json({ milestone: version }, { status: 201 });
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
