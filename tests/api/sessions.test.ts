import { describe, expect, test, vi } from "vitest";

const sessionState = {
  user: {
    id: "",
    email: "test+session@local",
  },
};

vi.mock("@/lib/auth", () => ({
  requireSession: async () => sessionState,
}));

const { GET, POST } = await import(
  "@/app/api/projects/[projectId]/tracks/[trackId]/sessions/route"
);
const { prisma } = await import("@/db/prisma");

describe("session milestones API", () => {
  test("creates and lists milestones", async () => {
    const owner = await prisma.user.create({
      data: { email: "test+session@local" },
    });
    sessionState.user.id = owner.id;

    const project = await prisma.project.create({
      data: {
        name: "Session project",
        memberships: {
          create: { userId: owner.id, role: "OWNER" },
        },
      },
    });

    const track = await prisma.track.create({
      data: {
        projectId: project.id,
        name: "Session track",
      },
    });

    const version = await prisma.version.create({
      data: {
        trackId: track.id,
        name: "Session v1",
        isCurrent: true,
      },
    });

    const createResponse = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Mix review" }),
      }),
      { params: Promise.resolve({ projectId: project.id, trackId: track.id }) }
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: project.id, trackId: track.id }),
    });
    const listPayload = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listPayload.milestones).toHaveLength(1);
    expect(listPayload.milestones[0].id).toBe(version.id);
    expect(listPayload.milestones[0].sessionLabel).toBe("Mix review");
  });
});
