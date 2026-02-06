import Link from "next/link";

type TrackStatus = "DEMO" | "MIXING" | "MASTERED" | "RELEASED";

type TrackCardProps = {
  id: string;
  projectId: string;
  name: string;
  status: TrackStatus;
  updatedAt: Date | string;
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
  updatedAt
}: TrackCardProps) {
  return (
    <Link
      href={`/projects/${projectId}/tracks/${id}`}
      className="surface-card group flex h-full flex-col justify-between gap-6 px-6 py-5 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--color-accent)]"
    >
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
          Track
        </p>
        <h3 className="font-display text-xl font-semibold text-[color:var(--color-text)]">
          {name}
        </h3>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span
          className={`rounded-full px-3 py-1 font-semibold uppercase tracking-[0.2em] ${statusBadge[status]}`}
        >
          {statusLabels[status]}
        </span>
        <span className="text-[color:var(--color-text-muted)]">
          Updated {formatDate(updatedAt)}
        </span>
      </div>
    </Link>
  );
}
