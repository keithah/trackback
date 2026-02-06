import Link from "next/link";

type ProjectCardProps = {
  id: string;
  name: string;
  updatedAt: Date | string;
  description?: string | null;
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

export default function ProjectCard({
  id,
  name,
  updatedAt,
  description
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className="surface-card group flex h-full flex-col justify-between gap-6 px-6 py-5 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--color-accent)]"
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
          Project
        </p>
        <h3 className="font-display text-xl font-semibold text-[color:var(--color-text)]">
          {name}
        </h3>
        {description ? (
          <p className="text-sm leading-relaxed text-[color:var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between text-xs text-[color:var(--color-text-muted)]">
        <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1">
          Updated {formatDate(updatedAt)}
        </span>
        <span className="text-[color:var(--color-accent)]">Open</span>
      </div>
    </Link>
  );
}
