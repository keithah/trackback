import { describe, expect, test, vi } from "vitest";

const sessionState = {
  user: {
    id: "",
    email: "test+comments@local",
  },
};

vi.mock("@/lib/auth", () => ({
  requireSession: async () => sessionState,
}));

const { GET, POST } = await import(
  "@/app/api/projects/[projectId]/tracks/[trackId]/comments/route"
);
const { DELETE } = await import(
  "@/app/api/projects/[projectId]/tracks/[trackId]/comments/[commentId]/route"
);
const { prisma } = await import("@/db/prisma");

describe("comments API", () => {
  test("creates and lists comments", async () => {
    const user = await prisma.user.create({
      data: { email: "test+comments@local" },
    });
    sessionState.user.id = user.id;

    const project = await prisma.project.create({
      data: {
        name: "Comments Project",
        memberships: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    });

    const track = await prisma.track.create({
      data: {
        projectId: project.id,
        name: "Timeline track",
        versions: { create: { name: "Demo v1" } },
      },
    });

    const createResponse = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: "Great intro",
          timestampSeconds: 42,
        }),
      }),
      { params: Promise.resolve({ projectId: project.id, trackId: track.id }) }
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: project.id, trackId: track.id }),
    });
    const listPayload = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listPayload.comments).toHaveLength(1);
    expect(listPayload.comments[0].body).toBe("Great intro");
  });

  test("owners can delete comments", async () => {
    const owner = await prisma.user.create({
      data: { email: "test+owner@local" },
    });
    const collaborator = await prisma.user.create({
      data: { email: "test+collab@local" },
    });

    const project = await prisma.project.create({
      data: {
        name: "Owner project",
        memberships: {
          create: [
            { userId: owner.id, role: "OWNER" },
            { userId: collaborator.id, role: "COLLABORATOR" },
          ],
        },
      },
    });

    const track = await prisma.track.create({
      data: {
        projectId: project.id,
        name: "Owner track",
      },
    });

    const comment = await prisma.comment.create({
      data: {
        trackId: track.id,
        userId: collaborator.id,
        body: "Needs polish",
        timestampSeconds: 12,
      },
    });

    sessionState.user.id = owner.id;

    const deleteResponse = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({
        projectId: project.id,
        trackId: track.id,
        commentId: comment.id,
      }),
    });

    expect(deleteResponse.status).toBe(200);
    const remaining = await prisma.comment.count({
      where: { id: comment.id },
    });
    expect(remaining).toBe(0);
  });
});
