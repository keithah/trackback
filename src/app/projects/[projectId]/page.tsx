import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import TrackCard from "@/components/TrackCard";
import TrackCreateModal from "@/components/TrackCreateModal";
import InviteModal from "@/components/InviteModal";

export const dynamic = "force-dynamic";

type TrackStatus = "DEMO" | "MIXING" | "MASTERED" | "RELEASED";

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

export default async function ProjectPage({
  params,
  searchParams
}: {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;
  const userId = await requireUserId();

  const membership = await prisma.membership.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    },
    select: { role: true }
  });

  if (!membership) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true
    }
  });

  if (!project) {
    notFound();
  }

  const tracks: Array<{
    id: string;
    name: string;
    status: TrackStatus;
    url: string | null;
    updatedAt: Date;
    versions: Array<{
      id: string;
      name: string;
      createdAt: Date;
    }>;
  }> = await prisma.track.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      url: true,
      updatedAt: true,
      versions: {
        select: {
          id: true,
          name: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  const activeTracks = tracks.filter(
    (track) => track.status === "DEMO" || track.status === "MIXING"
  );
  const finishedTracks = tracks.filter(
    (track) => track.status === "MASTERED" || track.status === "RELEASED"
  );
  const shouldOpenTrackModal = resolvedSearchParams?.created === "1";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-muted)]">
            Project dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold">
            {project.name}
          </h1>
          {project.description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--color-text-muted)]">
              {project.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {tracks.length ? (
            <TrackCreateModal projectId={project.id} />
          ) : null}
          <InviteModal projectId={project.id} />
        </div>
      </div>

      {tracks.length ? (
        <div className="mt-10 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Active</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
                {activeTracks.length} tracks
              </span>
            </div>
            {activeTracks.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {activeTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    id={track.id}
                    projectId={project.id}
                    name={track.name}
                    status={track.status}
                    url={track.url}
                    updatedAt={track.updatedAt}
                    latestVersion={track.versions[0] ?? null}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[color:var(--color-text-muted)]">
                No active tracks yet. Start with a demo or mixing pass.
              </p>
            )}
          </section>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Finished</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
                {finishedTracks.length} tracks
              </span>
            </div>
            {finishedTracks.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {finishedTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    id={track.id}
                    projectId={project.id}
                    name={track.name}
                    status={track.status}
                    url={track.url}
                    updatedAt={track.updatedAt}
                    latestVersion={track.versions[0] ?? null}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Finished tracks will appear once they are mastered or released.
              </p>
            )}
          </section>
        </div>
      ) : (
        <div className="surface-card mt-12 flex flex-col items-start gap-4 px-8 py-10">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold">
              Add the first track
            </h2>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Track progress from demo to release and keep every update in one
              place.
            </p>
          </div>
          <TrackCreateModal
            projectId={project.id}
            defaultOpen={shouldOpenTrackModal}
            triggerLabel="Add your first track"
          />
        </div>
      )}
    </main>
  );
}
