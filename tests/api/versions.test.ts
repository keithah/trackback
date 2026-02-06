import { describe, expect, test, vi } from "vitest";

const sessionState = {
  user: {
    id: "",
    email: "test+versions@local"
  }
};

vi.mock("@/lib/auth", () => ({
  requireSession: async () => sessionState
}));

const { DELETE } = await import(
  "@/app/api/projects/[projectId]/tracks/[trackId]/versions/[versionId]/route"
);
const { prisma } = await import("@/db/prisma");

describe("versions API", () => {
  test("only owners can delete versions", async () => {
    const owner = await prisma.user.create({
      data: { email: "test+owner@local" }
    });
    const collaborator = await prisma.user.create({
      data: { email: "test+collab@local" }
    });

    const project = await prisma.project.create({
      data: {
        name: "Version Project",
        memberships: {
          create: [
            { userId: owner.id, role: "OWNER" },
            { userId: collaborator.id, role: "COLLABORATOR" }
          ]
        }
      }
    });

    const track = await prisma.track.create({
      data: {
        projectId: project.id,
        name: "Version track",
        versions: { create: { name: "Initial version" } }
      },
      include: { versions: true }
    });

    const versionId = track.versions[0]?.id;
    expect(versionId).toBeTruthy();

    sessionState.user.id = collaborator.id;
    const forbiddenResponse = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({
        projectId: project.id,
        trackId: track.id,
        versionId: versionId as string
      })
    });

    expect(forbiddenResponse.status).toBe(403);

    sessionState.user.id = owner.id;
    const okResponse = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({
        projectId: project.id,
        trackId: track.id,
        versionId: versionId as string
      })
    });

    expect(okResponse.status).toBe(200);
    const remaining = await prisma.version.count({
      where: { id: versionId as string }
    });
    expect(remaining).toBe(0);
  });
});
