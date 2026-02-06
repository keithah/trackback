import Link from "next/link";

type TrackStatus = "DEMO" | "MIXING" | "MASTERED" | "RELEASED";

type TrackCardProps = {
  id: string;
  projectId: string;
  name: string;
  status: TrackStatus;
  updatedAt: Date | string;
  url?: string | null;
  latestVersion?: {
    name: string;
    createdAt: Date | string;
  } | null;
};

const statusLabels: Record<TrackStatus, string> = {
  DEMO: "Demo",
  MIXING: "Mixing",
  MASTERED: "Mastered",
  RELEASED: "Released"
};

const statusBadge: Record<TrackStatus, string> = {
  DEMO: "bg-orange-100 text-orange-700",
  MIXING: "bg-amber-100 text-amber-700",
  MASTERED: "bg-emerald-100 text-emerald-700",
  RELEASED: "bg-sky-100 text-sky-700"
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(date);
}

export default function TrackCard({
  id,
  projectId,
  name,
  status,
  url,
  updatedAt,
  latestVersion
}: TrackCardProps) {
  return (
    <div className="surface-card group relative flex h-full flex-col justify-between gap-6 px-6 py-5 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--color-accent)]">
      <Link
        href={`/projects/${projectId}/tracks/${id}`}
        aria-label={`Open ${name}`}
        className="absolute inset-0"
      />
      <div className="relative z-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
          Track
        </p>
        <h3 className="font-display text-xl font-semibold text-[color:var(--color-text)]">
          {name}
        </h3>
      </div>
      <div className="relative z-10 space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 font-semibold uppercase tracking-[0.2em] ${statusBadge[status]}`}
          >
            {statusLabels[status]}
          </span>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)]"
            >
              Play
            </a>
          ) : null}
          <span className="text-[color:var(--color-text-muted)]">
            Updated {formatDate(updatedAt)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-[color:var(--color-text-muted)]">
          <span className="text-[0.65rem] uppercase tracking-[0.35em]">
            Latest version
          </span>
          <span>
            {latestVersion
              ? `${latestVersion.name} • ${formatDate(latestVersion.createdAt)}`
              : "No versions yet"}
          </span>
        </div>
      </div>
    </div>
  );
}
