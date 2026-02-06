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

const notesSchema = z.object({
  trackId: z.string().trim().min(1),
  versionId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const userId = await requireUserId();
    await requireProjectMember(userId, projectId);

    const body = await request.json().catch(() => null);

    if (!body) {
      return jsonError("Invalid JSON", 400);
    }

    const parsed = notesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const track = await prisma.track.findFirst({
      where: { id: parsed.data.trackId, projectId },
      select: { id: true },
    });

    if (!track) {
      return jsonError("Not found", 404);
    }

    const recentMessages = await prisma.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { body: true, createdAt: true, user: { select: { name: true } } },
    });

    const generated =
      recentMessages.length > 0
        ? recentMessages
            .reverse()
            .map((message: { body: string; user: { name: string | null } }) =>
              `- ${message.user.name ?? "Someone"}: ${message.body}`
            )
            .join("\n")
        : "- No recent chat messages available.";

    if (parsed.data.notes) {
      const updated = await prisma.track.update({
        where: { id: parsed.data.trackId },
        data: { productionNotes: parsed.data.notes },
        select: { id: true, productionNotes: true },
      });

      return NextResponse.json({ notes: updated.productionNotes });
    }

    return NextResponse.json({ notes: generated });
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
