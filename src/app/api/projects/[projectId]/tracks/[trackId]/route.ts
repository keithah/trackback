import { NextResponse } from "next/server"

import { prisma } from "@/db/prisma"
import { requireSession } from "@/lib/auth"
import { PermissionError, requireProjectMember, requireProjectOwner } from "@/lib/permissions"
import { trackStatusSchema } from "@/lib/validators/track"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function requireUserId() {
  const session = await requireSession()
  const directId = session.user?.id

  if (directId) {
    return directId
  }

  const email = session.user?.email

  if (!email) {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user.id
}

export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string; trackId: string } }
) {
  try {
    const userId = await requireUserId()
    await requireProjectMember(userId, params.projectId)
    const body = await request.json().catch(() => null)

    if (!body) {
      return jsonError("Invalid JSON", 400)
    }

    const parsed = trackStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const track = await prisma.track.findFirst({
      where: {
        id: params.trackId,
        projectId: params.projectId,
      },
    })

    if (!track) {
      return jsonError("Not found", 404)
    }

    const [updated] = await prisma.$transaction([
      prisma.track.update({
        where: { id: params.trackId },
        data: { status: parsed.data.status },
      }),
      prisma.project.update({
        where: { id: params.projectId },
        data: { updatedAt: new Date() },
      }),
    ])

    return NextResponse.json({ track: updated })
  } catch (error) {
    if (error instanceof PermissionError) {
      return jsonError("Forbidden", 403)
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401)
    }

    return jsonError("Internal server error", 500)
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { projectId: string; trackId: string } }
) {
  try {
    const userId = await requireUserId()
    await requireProjectOwner(userId, params.projectId)

    const track = await prisma.track.findFirst({
      where: {
        id: params.trackId,
        projectId: params.projectId,
      },
      select: { id: true },
    })

    if (!track) {
      return jsonError("Not found", 404)
    }

    await prisma.$transaction([
      prisma.track.delete({
        where: { id: params.trackId },
      }),
      prisma.project.update({
        where: { id: params.projectId },
        data: { updatedAt: new Date() },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof PermissionError) {
      return jsonError("Forbidden", 403)
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401)
    }

    return jsonError("Internal server error", 500)
  }
}
