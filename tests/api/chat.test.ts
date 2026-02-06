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

const { GET, POST } = await import(
  "@/app/api/projects/[projectId]/tracks/[trackId]/versions/[versionId]/chat/route"
);
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

    const track = await prisma.track.create({
      data: {
        projectId: project.id,
        name: "Chat track",
        versions: {
          create: {
            name: "Initial",
            isCurrent: true,
          },
        },
      },
      select: { id: true, versions: { select: { id: true }, take: 1 } },
    });

    const versionId = track.versions[0]?.id;

    expect(versionId).toBeTruthy();

    const createResponse = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Hello team" }),
      }),
      {
        params: Promise.resolve({
          projectId: project.id,
          trackId: track.id,
          versionId: versionId as string,
        }),
      }
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await GET(new Request("http://localhost"), {
      params: Promise.resolve({
        projectId: project.id,
        trackId: track.id,
        versionId: versionId as string,
      }),
    });
    const listPayload = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listPayload.messages).toHaveLength(1);
    expect(listPayload.messages[0].body).toBe("Hello team");
  });
});
