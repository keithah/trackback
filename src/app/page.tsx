import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import ProjectCard from "@/components/ProjectCard";
import ProjectCreateModal from "@/components/ProjectCreateModal";

export const dynamic = "force-dynamic";

async function requireUserId() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const directId = (session.user as { id?: string }).id;

  if (directId) {
    return directId;
  }

  const email = session.user.email;

  if (!email) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (!user) {
    redirect("/signin");
  }

  return user.id;
}

export default async function Home() {
  const userId = await requireUserId();

  const projects: Array<{
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
  }> = await prisma.project.findMany({
    where: { memberships: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true
    }
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-muted)]">
            Projects
          </p>
          <h1 className="font-display text-3xl font-semibold">
            Keep every session in view
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--color-text-muted)]">
            Create a project, capture the latest track status, and invite
            collaborators into a single workspace.
          </p>
        </div>
        <ProjectCreateModal />
      </div>

      {projects.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              updatedAt={project.updatedAt}
            />
          ))}
        </div>
      ) : (
        <div className="surface-card mt-12 flex flex-col items-start gap-4 px-8 py-10">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold">
              Start your first project
            </h2>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Every project becomes a shared timeline of track progress, notes,
              and approvals.
            </p>
          </div>
          <ProjectCreateModal />
        </div>
      )}
    </main>
  );
}
