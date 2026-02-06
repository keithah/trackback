import { NextResponse } from "next/server";

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

export async function DELETE(
  _: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; trackId: string; commentId: string }>;
  }
) {
  try {
    const { projectId, trackId, commentId } = await params;
    const userId = await requireUserId();
    await requireProjectMember(userId, projectId);

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, trackId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      return jsonError("Not found", 404);
    }

    if (comment.userId !== userId) {
      await requireProjectOwner(userId, projectId);
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ ok: true });
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
