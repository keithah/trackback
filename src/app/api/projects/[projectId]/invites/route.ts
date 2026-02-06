import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { Resend } from "resend"

import { prisma } from "@/db/prisma"
import { requireSession } from "@/lib/auth"
import { PermissionError, requireProjectMember } from "@/lib/permissions"
import { inviteSchema } from "@/lib/validators/invite"

const inviteDurationMs = 1000 * 60 * 60 * 24 * 7

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function requireUserId() {
  const session = await requireSession()
  const directId = session.user?.id

  if (directId) {
    return { userId: directId, session }
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

  return { userId: user.id, session }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId, session } = await requireUserId()
    await requireProjectMember(userId, params.projectId)
    const body = await request.json().catch(() => null)

    if (!body) {
      return jsonError("Invalid JSON", 400)
    }

    const parsed = inviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, username } = parsed.data

    if (username) {
      const targetUser = await prisma.user.findFirst({
        where: {
          name: { equals: username, mode: "insensitive" },
        },
        select: { id: true },
      })

      if (targetUser) {
        const existingMembership = await prisma.membership.findUnique({
          where: {
            projectId_userId: {
              projectId: params.projectId,
              userId: targetUser.id,
            },
          },
        })

        if (existingMembership) {
          return NextResponse.json({
            ok: true,
            membership: existingMembership,
          })
        }

        const membership = await prisma.membership.create({
          data: {
            projectId: params.projectId,
            userId: targetUser.id,
            role: "COLLABORATOR",
          },
        })

        return NextResponse.json({ ok: true, membership })
      }
    }

    if (!email) {
      return jsonError("User not found", 404)
    }

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + inviteDurationMs)
    const invite = await prisma.invite.create({
      data: {
        token,
        projectId: params.projectId,
        invitedById: userId,
        targetEmail: email,
        expiresAt,
      },
    })

    const resendApiKey = process.env.RESEND_API_KEY
    const resendFrom = process.env.RESEND_FROM

    if (!resendApiKey || !resendFrom) {
      return jsonError("Email service not configured", 500)
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000"
    const acceptUrl = `${baseUrl}/invites/${token}`
    const inviterLabel = session.user?.name ?? session.user?.email ?? "A collaborator"
    const resend = new Resend(resendApiKey)

    await resend.emails.send({
      from: resendFrom,
      to: email,
      subject: `${inviterLabel} invited you to Trackback`,
      html: `
        <p>${inviterLabel} invited you to collaborate on a Trackback project.</p>
        <p><a href="${acceptUrl}">Accept the invite</a></p>
      `,
    })

    return NextResponse.json({ ok: true, invite, acceptUrl }, { status: 201 })
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
