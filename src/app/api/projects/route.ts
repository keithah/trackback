import { NextResponse } from "next/server"

import { prisma } from "@/db/prisma"
import { requireSession } from "@/lib/auth"
import { projectCreateSchema } from "@/lib/validators/project"

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

export async function GET() {
  try {
    const userId = await requireUserId()
    const projects = await prisma.project.findMany({
      where: { memberships: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      include: {
        memberships: {
          where: { userId },
          select: { role: true },
        },
      },
    })

    const payload = projects.map((project: (typeof projects)[number]) => {
      const { memberships, ...rest } = project

      return {
        ...rest,
        role: memberships[0]?.role ?? null,
      }
    })

    return NextResponse.json({ projects: payload })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401)
    }

    return jsonError("Internal server error", 500)
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId()
    const body = await request.json().catch(() => null)

    if (!body) {
      return jsonError("Invalid JSON", 400)
    }

    const parsed = projectCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, defaultTrackStatus } = parsed.data

    const project = await prisma.project.create({
      data: {
        name,
        description,
        defaultTrackStatus,
        memberships: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401)
    }

    return jsonError("Internal server error", 500)
  }
}
