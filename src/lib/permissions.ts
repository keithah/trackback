import { MembershipRole } from "@prisma/client"

import { prisma } from "@/db/prisma"

export class PermissionError extends Error {
  status: number

  constructor(message: string, status = 403) {
    super(message)
    this.name = "PermissionError"
    this.status = status
  }
}

export async function requireProjectMember(userId: string, projectId: string) {
  const membership = await prisma.membership.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  })

  if (!membership) {
    throw new PermissionError("Forbidden")
  }

  return membership
}

export async function requireProjectOwner(userId: string, projectId: string) {
  const membership = await requireProjectMember(userId, projectId)

  if (membership.role !== MembershipRole.OWNER) {
    throw new PermissionError("Forbidden")
  }

  return membership
}
