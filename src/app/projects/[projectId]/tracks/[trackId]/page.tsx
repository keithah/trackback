import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import TrackStatusSelect, {
  TrackDeleteButton,
  VersionDeleteButton
} from "@/components/TrackStatusSelect";

type TrackStatus = "DEMO" | "MIXING" | "MASTERED" | "RELEASED";

async function requireUserId() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const directId = session.user.id;

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

export default async function TrackPage({
  params
}: {
  params: { projectId: string; trackId: string };
}) {
  const userId = await requireUserId();

  const membership = await prisma.membership.findUnique({
    where: {
      projectId_userId: {
        projectId: params.projectId,
        userId
      }
    },
    select: { role: true }
  });

  if (!membership) {
    notFound();
  }

  const track = await prisma.track.findFirst({
    where: {
      id: params.trackId,
      projectId: params.projectId
    },
    select: {
      id: true,
      name: true,
      notes: true,
      status: true,
      updatedAt: true,
      versions: {
        select: {
          id: true,
          name: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 1
      },
      project: {
        select: { name: true }
      }
    }
  });

  if (!track) {
    notFound();
  }

  const isOwner = membership.role === "OWNER";
  const latestVersion = track.versions[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <Link
        href={`/projects/${params.projectId}`}
        className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]"
      >
        Back to {track.project.name}
      </Link>
      <div className="surface-card mt-6 px-8 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-muted)]">
              Track detail
            </p>
            <h1 className="font-display text-3xl font-semibold">
              {track.name}
            </h1>
          </div>
          <TrackStatusSelect
            projectId={params.projectId}
            trackId={track.id}
            status={track.status as TrackStatus}
          />
        </div>
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            Notes
          </h2>
          <p className="text-base leading-relaxed text-[color:var(--color-text)]">
            {track.notes?.trim()
              ? track.notes
              : "No notes added yet. Capture the latest requests or creative decisions."}
          </p>
        </div>
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                Latest version
              </h2>
              {latestVersion ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-[color:var(--color-text)]">
                    {latestVersion.name}
                  </p>
                  <p className="text-[color:var(--color-text-muted)]">
                    Added {latestVersion.createdAt.toLocaleDateString("en-US")}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  No versions yet.
                </p>
              )}
            </div>
            {isOwner && latestVersion ? (
              <VersionDeleteButton
                projectId={params.projectId}
                trackId={track.id}
                versionId={latestVersion.id}
                versionName={latestVersion.name}
              />
            ) : null}
          </div>
        </div>
        {isOwner ? (
          <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
            <TrackDeleteButton
              projectId={params.projectId}
              trackId={track.id}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
