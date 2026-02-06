import { describe, expect, test, vi } from "vitest";

const sessionState = {
  user: {
    id: "",
    email: "test+notes@local",
  },
};

vi.mock("@/lib/auth", () => ({
  requireSession: async () => sessionState,
}));

const { POST } = await import("@/app/api/projects/[projectId]/notes/route");
const { prisma } = await import("@/db/prisma");

describe("notes API", () => {
  test("generates and saves notes", async () => {
    const user = await prisma.user.create({
      data: { email: "test+notes@local" },
    });
    sessionState.user.id = user.id;

    const project = await prisma.project.create({
      data: {
        name: "Notes project",
        memberships: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    });

    const track = await prisma.track.create({
      data: {
        projectId: project.id,
        name: "Notes track",
      },
    });

    const generateResponse = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track.id }),
      }),
      { params: Promise.resolve({ projectId: project.id }) }
    );

    expect(generateResponse.status).toBe(200);

    const saveResponse = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track.id, notes: "Do the chorus" }),
      }),
      { params: Promise.resolve({ projectId: project.id }) }
    );

    expect(saveResponse.status).toBe(200);

    const updated = await prisma.track.findUnique({
      where: { id: track.id },
      select: { productionNotes: true },
    });

    expect(updated?.productionNotes).toBe("Do the chorus");
  });
});
