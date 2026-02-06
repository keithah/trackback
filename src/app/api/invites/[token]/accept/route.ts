import { NextResponse } from "next/server"

import { prisma } from "@/db/prisma"
import { requireSession } from "@/lib/auth"

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

export async function POST(
  _: Request,
  { params }: { params: { token: string } }
) {
  try {
    const userId = await requireUserId()
    const invite = await prisma.invite.findUnique({
      where: { token: params.token },
    })

    if (!invite) {
      return jsonError("Invite not found", 404)
    }

    if (invite.status === "ACCEPTED") {
      return jsonError("Invite already accepted", 409)
    }

    if (invite.expiresAt <= new Date()) {
      return jsonError("Invite expired", 410)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user) {
      return jsonError("Unauthorized", 401)
    }

    if (invite.targetEmail) {
      const emailMatches =
        user.email &&
        invite.targetEmail.toLowerCase() === user.email.toLowerCase()

      if (!emailMatches) {
        return jsonError("Invite target mismatch", 403)
      }
    }

    if (invite.targetUsername) {
      const nameMatches =
        user.name &&
        invite.targetUsername.toLowerCase() === user.name.toLowerCase()

      if (!nameMatches) {
        return jsonError("Invite target mismatch", 403)
      }
    }

    const existingMembership = await prisma.membership.findUnique({
      where: {
        projectId_userId: {
          projectId: invite.projectId,
          userId,
        },
      },
    })

    if (!existingMembership) {
      await prisma.membership.create({
        data: {
          projectId: invite.projectId,
          userId,
          role: "COLLABORATOR",
        },
      })
    }

    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401)
    }

    return jsonError("Internal server error", 500)
  }
}
