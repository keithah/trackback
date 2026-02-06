import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import TrackStatusSelect, {
  TrackDeleteButton,
  VersionDeleteButton
} from "@/components/TrackStatusSelect";
import VersionList from "@/components/VersionList";
import VersionUploadPanel from "@/components/VersionUploadPanel";
import CommentSection from "@/components/CommentSection";
import SessionMilestones from "@/components/SessionMilestones";
import ProductionNotesPanel from "@/components/ProductionNotesPanel";

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

export default async function TrackPage({
  params
}: {
  params: Promise<{ projectId: string; trackId: string }>;
}) {
  const { projectId, trackId } = await params;
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

  const track = await prisma.track.findFirst({
    where: {
      id: trackId,
      projectId
    },
    select: {
      id: true,
      name: true,
      notes: true,
      productionNotes: true,
      url: true,
      status: true,
      updatedAt: true,
      versions: {
        select: {
          id: true,
          name: true,
          notes: true,
          audioUrl: true,
          audioMime: true,
          audioDurationSeconds: true,
          audioSampleRate: true,
          audioBitrateKbps: true,
          audioSource: true,
          isCurrent: true,
          sessionLabel: true,
          sessionCreatedAt: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" }
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
        href={`/projects/${projectId}`}
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
            projectId={projectId}
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
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            Audio link
          </h2>
          {track.url ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={track.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text)] transition hover:border-[color:var(--color-accent)]"
              >
                Play audio
              </a>
              <span className="text-xs text-[color:var(--color-text-muted)]">
                {track.url}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">
              No audio link added.
            </p>
          )}
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
                projectId={projectId}
                trackId={track.id}
                versionId={latestVersion.id}
                versionName={latestVersion.name}
              />
            ) : null}
          </div>
        </div>
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
          <VersionUploadPanel projectId={projectId} trackId={track.id} />
        </div>
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
          <VersionList
            projectId={projectId}
            trackId={track.id}
            isOwner={isOwner}
            versions={track.versions}
          />
        </div>
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
          <ProductionNotesPanel
            projectId={projectId}
            trackId={track.id}
            initialNotes={track.productionNotes}
          />
        </div>
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
          <SessionMilestones
            projectId={projectId}
            trackId={track.id}
            isOwner={isOwner}
          />
        </div>
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
          <CommentSection
            projectId={projectId}
            trackId={track.id}
            defaultVersionId={latestVersion?.id}
          />
        </div>
        {isOwner ? (
          <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
            <TrackDeleteButton
              projectId={projectId}
              trackId={track.id}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
