import { describe, expect, test, vi } from "vitest";

const sessionState = {
  user: {
    id: "",
    email: "test+projects@local"
  }
};

vi.mock("@/lib/auth", () => ({
  requireSession: async () => sessionState
}));

const { GET, POST } = await import("@/app/api/projects/route");
const { prisma } = await import("@/db/prisma");

describe("projects API", () => {
  test("creates a project with owner membership", async () => {
    const user = await prisma.user.create({
      data: { email: "test+projects@local" }
    });
    sessionState.user.id = user.id;

    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Demo Project",
        description: "Sample",
        defaultTrackStatus: "DEMO"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.project?.name).toBe("Demo Project");

    const membership = await prisma.membership.findFirst({
      where: { projectId: payload.project.id, userId: user.id }
    });

    expect(membership?.role).toBe("OWNER");
  });

  test("lists projects for the current user", async () => {
    const user = await prisma.user.create({
      data: { email: "test+projects@local" }
    });
    sessionState.user.id = user.id;

    const project = await prisma.project.create({
      data: {
        name: "Listed Project",
        memberships: {
          create: { userId: user.id, role: "OWNER" }
        }
      }
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.projects).toHaveLength(1);
    expect(payload.projects[0].id).toBe(project.id);
    expect(payload.projects[0].role).toBe("OWNER");
  });
});
