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

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const userId = await requireUserId()
    const membership = await prisma.membership.findUnique({
      where: {
        projectId_userId: {
          projectId: params.projectId,
          userId,
        },
      },
      select: { role: true },
    })

    if (!membership) {
      return jsonError("Not found", 404)
    }

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
    })

    if (!project) {
      return jsonError("Not found", 404)
    }

    return NextResponse.json({ project, role: membership.role })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401)
    }

    return jsonError("Internal server error", 500)
  }
}
