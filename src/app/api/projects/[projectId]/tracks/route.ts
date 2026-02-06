import { NextResponse } from "next/server"

import { prisma } from "@/db/prisma"
import { requireSession } from "@/lib/auth"
import { PermissionError, requireProjectMember } from "@/lib/permissions"
import { trackCreateSchema } from "@/lib/validators/track"

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function jsonErrorWithDebug(message: string, status: number, error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return jsonError(message, status)
  }

  const detail =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) }

  return NextResponse.json({ error: message, detail }, { status })
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

export async function GET(
  _: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const userId = await requireUserId()
    await requireProjectMember(userId, projectId)

    const tracks = await prisma.track.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("Track create error", error)
    if (error instanceof PermissionError) {
      return jsonError("Forbidden", 403)
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401)
    }

    return jsonErrorWithDebug("Internal server error", 500, error)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const userId = await requireUserId()
    await requireProjectMember(userId, projectId)
    const body = await request.json().catch(() => null)

    if (!body) {
      return jsonError("Invalid JSON", 400)
    }

    const parsed = trackCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, notes, status, url } = parsed.data
    const existing = await prisma.track.findFirst({
      where: {
        projectId,
        name: { equals: name },
      },
      select: { id: true },
    })

    if (existing) {
      return jsonError("Track name already exists", 409)
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { defaultTrackStatus: true },
    })

    if (!project) {
      return jsonError("Not found", 404)
    }

    const [track] = await prisma.$transaction([
      prisma.track.create({
        data: {
          projectId,
          name,
          notes,
          url,
          status: status ?? project.defaultTrackStatus,
          versions: {
            create: {
              name: "Initial version",
              isCurrent: true,
            },
          },
        },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() },
      }),
    ])

    return NextResponse.json({ track }, { status: 201 })
  } catch (error) {
    console.error("Track create error", error)
    if (error instanceof PermissionError) {
      return jsonError("Forbidden", 403)
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401)
    }

    return jsonErrorWithDebug("Internal server error", 500, error)
  }
}
