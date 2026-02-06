import { NextResponse } from "next/server"

import { prisma } from "@/db/prisma"
import { requireSession } from "@/lib/auth"
import { PermissionError, requireProjectOwner } from "@/lib/permissions"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function requireUserId() {
  const session = await requireSession()
  const directId = (session.user as { id?: string } | undefined)?.id

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
  }: {
    params: Promise<{ projectId: string; trackId: string; versionId: string }>
  }
) {
  try {
    const { projectId, trackId, versionId } = await params
    const userId = await requireUserId()

    const version = await prisma.version.findFirst({
      where: {
        id: versionId,
        trackId,
        track: { projectId },
      },
      select: { id: true },
    })

    if (!version) {
      return jsonError("Not found", 404)
    }

    await requireProjectOwner(userId, projectId)

    await prisma.version.delete({
      where: { id: versionId },
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

export async function PATCH(
  _: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; trackId: string; versionId: string }>
  }
) {
  try {
    const { projectId, trackId, versionId } = await params
    const userId = await requireUserId()

    const version = await prisma.version.findFirst({
      where: {
        id: versionId,
        trackId,
        track: { projectId },
      },
      select: { id: true },
    })

    if (!version) {
      return jsonError("Not found", 404)
    }

    await requireProjectOwner(userId, projectId)

    const transactionResult = await prisma.$transaction([
      prisma.version.updateMany({
        where: { trackId },
        data: { isCurrent: false },
      }),
      prisma.version.update({
        where: { id: versionId },
        data: { isCurrent: true },
      }),
    ])

    const updated = transactionResult[1]

    return NextResponse.json({ version: updated })
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
