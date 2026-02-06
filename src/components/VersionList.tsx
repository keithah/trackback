"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AudioPlayer from "@/components/AudioPlayer";
import VersionCompare from "@/components/VersionCompare";

type VersionItem = {
  id: string;
  name: string;
  notes: string | null;
  audioUrl: string | null;
  audioMime: string | null;
  audioDurationSeconds: number | null;
  audioSampleRate: number | null;
  audioBitrateKbps: number | null;
  audioSource: "UPLOAD" | "EXTERNAL" | null;
  isCurrent: boolean;
  sessionLabel: string | null;
  sessionCreatedAt: string | Date | null;
  createdAt: string | Date;
};

type VersionListProps = {
  projectId: string;
  trackId: string;
  isOwner: boolean;
  versions: VersionItem[];
};

function formatDuration(durationSeconds: number | null) {
  if (!durationSeconds) {
    return "-";
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = Math.round(durationSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function VersionList({
  projectId,
  trackId,
  isOwner,
  versions,
}: VersionListProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isUpdatingCurrent, setIsUpdatingCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!versions.length) {
      setSelectedId(null);
      setCompareIds([]);
      return;
    }

    setSelectedId((current) => {
      if (current && versions.some((version) => version.id === current)) {
        return current;
      }

      return versions.find((version) => version.audioUrl)?.id ?? versions[0].id;
    });
  }, [versions]);

  const selectedVersion = versions.find((version) => version.id === selectedId) ?? null;
  const compareVersions = useMemo(
    () => compareIds.map((id) => versions.find((version) => version.id === id)).filter(Boolean),
    [compareIds, versions]
  );

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length < 2) {
        return [...current, id];
      }

      return [current[1], id];
    });
  };

  const setCurrentVersion = async (id: string) => {
    setIsUpdatingCurrent(id);
    const response = await fetch(
      `/api/projects/${projectId}/tracks/${trackId}/versions/${id}`,
      { method: "PATCH" }
    );
    setIsUpdatingCurrent(null);

    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <section className="space-y-4">
      {selectedVersion ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 px-5 py-4">
          <h3 className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Playback
          </h3>
          <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">
            {selectedVersion.name}
          </p>
          <div className="mt-4">
            {selectedVersion.audioUrl ? (
              <AudioPlayer
                audioUrl={selectedVersion.audioUrl}
                durationSeconds={selectedVersion.audioDurationSeconds}
                sampleRate={selectedVersion.audioSampleRate}
                bitrateKbps={selectedVersion.audioBitrateKbps}
              />
            ) : (
              <p className="text-sm text-[color:var(--color-text-muted)]">
                No audio URL available for this version.
              </p>
            )}
          </div>
        </div>
      ) : null}
      {compareVersions.length === 2 ? (
        <VersionCompare
          left={compareVersions[0] as VersionItem}
          right={compareVersions[1] as VersionItem}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
          Versions
        </h2>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          {versions.length} total
        </span>
      </div>
      {versions.length ? (
        <div className="grid gap-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`rounded-2xl border bg-white/60 px-5 py-4 transition ${
                version.id === selectedId
                  ? "border-[color:var(--color-accent)]"
                  : "border-[color:var(--color-border)]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[color:var(--color-text)]">
                      {version.name}
                    </p>
                    {version.isCurrent ? (
                      <span className="rounded-full bg-[color:var(--color-accent)] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-white">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[color:var(--color-text-muted)]">
                    {new Date(version.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                    {version.audioSource ? ` • ${version.audioSource}` : ""}
                  </p>
                  {version.sessionLabel ? (
                    <p className="text-xs text-[color:var(--color-text-muted)]">
                      Session: {version.sessionLabel}
                      {version.sessionCreatedAt
                        ? ` • ${new Date(version.sessionCreatedAt).toLocaleDateString("en-US")}`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCompare(version.id)}
                    className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] transition ${
                      compareIds.includes(version.id)
                        ? "border-[color:var(--color-accent)] text-[color:var(--color-text)]"
                        : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
                    }`}
                  >
                    Compare
                  </button>
                  {version.audioUrl ? (
                    <button
                      type="button"
                      onClick={() => setSelectedId(version.id)}
                      className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)]"
                    >
                      Play
                    </button>
                  ) : null}
                  {version.audioUrl ? (
                    <a
                      href={version.audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)]"
                    >
                      Open
                    </a>
                  ) : null}
                  {isOwner && !version.isCurrent ? (
                    <button
                      type="button"
                      onClick={() => setCurrentVersion(version.id)}
                      disabled={isUpdatingCurrent === version.id}
                      className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingCurrent === version.id ? "Setting" : "Set current"}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-[color:var(--color-text-muted)] sm:grid-cols-3">
                <div>
                  <span className="uppercase tracking-[0.2em]">Duration</span>
                  <p className="text-[color:var(--color-text)]">
                    {formatDuration(version.audioDurationSeconds)}
                  </p>
                </div>
                <div>
                  <span className="uppercase tracking-[0.2em]">Sample rate</span>
                  <p className="text-[color:var(--color-text)]">
                    {version.audioSampleRate ? `${version.audioSampleRate} Hz` : "-"}
                  </p>
                </div>
                <div>
                  <span className="uppercase tracking-[0.2em]">Bitrate</span>
                  <p className="text-[color:var(--color-text)]">
                    {version.audioBitrateKbps ? `${version.audioBitrateKbps} kbps` : "-"}
                  </p>
                </div>
              </div>
              {version.notes ? (
                <p className="mt-3 text-sm text-[color:var(--color-text)]">
                  {version.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] px-5 py-6 text-sm text-[color:var(--color-text-muted)]">
          No versions uploaded yet.
        </div>
      )}
    </section>
  );
}
