import { describe, expect, test, vi } from "vitest";

const sessionState = {
  user: {
    id: "",
    email: "test+tracks@local"
  }
};

vi.mock("@/lib/auth", () => ({
  requireSession: async () => sessionState
}));

const { POST } = await import(
  "@/app/api/projects/[projectId]/tracks/route"
);
const { prisma } = await import("@/db/prisma");

describe("tracks API", () => {
  test("creates a track with an initial version", async () => {
    const user = await prisma.user.create({
      data: { email: "test+tracks@local" }
    });
    sessionState.user.id = user.id;

    const project = await prisma.project.create({
      data: {
        name: "Track Project",
        memberships: {
          create: { userId: user.id, role: "OWNER" }
        }
      }
    });

    const request = new Request(
      `http://localhost/api/projects/${project.id}/tracks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "First track", notes: "hello" })
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ projectId: project.id })
    });
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.track?.name).toBe("First track");

    const versionCount = await prisma.version.count({
      where: { trackId: payload.track.id }
    });

    expect(versionCount).toBe(1);
  });
});
