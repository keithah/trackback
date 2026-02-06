import { describe, expect, test, vi } from "vitest";

const sessionState = {
  user: {
    id: "",
    email: "test+chat@local",
  },
};

vi.mock("@/lib/auth", () => ({
  requireSession: async () => sessionState,
}));

const { GET, POST } = await import("@/app/api/projects/[projectId]/chat/route");
const { prisma } = await import("@/db/prisma");

describe("chat API", () => {
  test("creates and lists messages", async () => {
    const user = await prisma.user.create({
      data: { email: "test+chat@local" },
    });
    sessionState.user.id = user.id;

    const project = await prisma.project.create({
      data: {
        name: "Chat project",
        memberships: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    });

    const createResponse = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Hello team" }),
      }),
      { params: Promise.resolve({ projectId: project.id }) }
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: project.id }),
    });
    const listPayload = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listPayload.messages).toHaveLength(1);
    expect(listPayload.messages[0].body).toBe("Hello team");
  });
});
