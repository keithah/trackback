import { describe, expect, test, vi } from "vitest";

const sessionState = {
  user: {
    id: "",
    email: "test+current@local",
  },
};

vi.mock("@/lib/auth", () => ({
  requireSession: async () => sessionState,
}));

const { PATCH } = await import(
  "@/app/api/projects/[projectId]/tracks/[trackId]/versions/[versionId]/route"
);
const { prisma } = await import("@/db/prisma");

describe("version current API", () => {
  test("owners can set current version", async () => {
    const owner = await prisma.user.create({
      data: { email: "test+current@local" },
    });
    sessionState.user.id = owner.id;

    const project = await prisma.project.create({
      data: {
        name: "Current project",
        memberships: {
          create: { userId: owner.id, role: "OWNER" },
        },
      },
    });

    const track = await prisma.track.create({
      data: {
        projectId: project.id,
        name: "Current track",
      },
    });

    const versionA = await prisma.version.create({
      data: {
        trackId: track.id,
        name: "v1",
      },
    });
    const versionB = await prisma.version.create({
      data: {
        trackId: track.id,
        name: "v2",
      },
    });

    const response = await PATCH(new Request("http://localhost"), {
      params: Promise.resolve({
        projectId: project.id,
        trackId: track.id,
        versionId: versionB.id,
      }),
    });

    expect(response.status).toBe(200);

    const current = await prisma.version.findMany({
      where: { trackId: track.id, isCurrent: true },
    });

    expect(current).toHaveLength(1);
    expect(current[0]?.id).toBe(versionB.id);

    const versionAUpdated = await prisma.version.findUnique({
      where: { id: versionA.id },
    });
    expect(versionAUpdated?.isCurrent).toBe(false);
  });
});
