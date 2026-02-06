import { NextResponse } from "next/server"

import { prisma } from "@/db/prisma"
import { requireSession } from "@/lib/auth"
import { PermissionError, requireProjectOwner } from "@/lib/permissions"

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

export async function DELETE(
  _: Request,
  {
    params,
  }: { params: { projectId: string; trackId: string; versionId: string } }
) {
  try {
    const userId = await requireUserId()

    const version = await prisma.version.findFirst({
      where: {
        id: params.versionId,
        trackId: params.trackId,
        track: { projectId: params.projectId },
      },
      select: { id: true },
    })

    if (!version) {
      return jsonError("Not found", 404)
    }

    await requireProjectOwner(userId, params.projectId)

    await prisma.version.delete({
      where: { id: params.versionId },
    })

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
