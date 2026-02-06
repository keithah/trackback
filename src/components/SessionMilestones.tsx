"use client";

import { useCallback, useEffect, useState } from "react";

type Milestone = {
  id: string;
  name: string;
  sessionLabel: string | null;
  sessionCreatedAt: string | Date | null;
};

type SessionMilestonesProps = {
  projectId: string;
  trackId: string;
  isOwner: boolean;
};

export default function SessionMilestones({
  projectId,
  trackId,
  isOwner,
}: SessionMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMilestones = useCallback(async () => {
    const response = await fetch(
      `/api/projects/${projectId}/tracks/${trackId}/sessions`
    );

    if (!response.ok) {
      setError("Unable to load milestones.");
      return;
    }

    const payload = await response.json();
    setMilestones(payload?.milestones ?? []);
    setError(null);
  }, [projectId, trackId]);

  useEffect(() => {
    void loadMilestones();
  }, [loadMilestones]);

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError("Label is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response = await fetch(
      `/api/projects/${projectId}/tracks/${trackId}/sessions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() }),
      }
    );

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Unable to save milestone.");
      return;
    }

    setLabel("");
    void loadMilestones();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
          Session milestones
        </h2>
      </div>
      {isOwner ? (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="w-full max-w-sm rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
            placeholder="Session label"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save session"}
          </button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {milestones.length ? (
        <div className="grid gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="rounded-2xl border border-[color:var(--color-border)] bg-white/60 px-5 py-4"
            >
              <p className="text-sm font-semibold text-[color:var(--color-text)]">
                {milestone.sessionLabel}
              </p>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                {milestone.sessionCreatedAt
                  ? new Date(milestone.sessionCreatedAt).toLocaleDateString(
                      "en-US"
                    )
                  : ""}
                {milestone.name ? ` • ${milestone.name}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] px-5 py-6 text-sm text-[color:var(--color-text-muted)]">
          No session milestones saved yet.
        </div>
      )}
    </section>
  );
}
