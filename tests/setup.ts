import { beforeEach, afterAll } from "vitest";

import { prisma } from "@/db/prisma";

beforeEach(async () => {
  await prisma.chatMessage.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.version.deleteMany();
  await prisma.track.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.project.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
