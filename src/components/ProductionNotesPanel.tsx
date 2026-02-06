"use client";

import { useEffect, useState } from "react";

type ProductionNotesPanelProps = {
  projectId: string;
  trackId: string;
  initialNotes: string | null;
};

export default function ProductionNotesPanel({
  projectId,
  trackId,
  initialNotes,
}: ProductionNotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(initialNotes ?? "");
  }, [initialNotes]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    const response = await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    });

    setIsGenerating(false);

    if (!response.ok) {
      setError("Unable to generate notes.");
      return;
    }

    const payload = await response.json();
    setNotes(payload?.notes ?? "");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const response = await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId, notes }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setError("Unable to save notes.");
      return;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
          Production notes
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generating..." : "Generate notes"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save notes"}
          </button>
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={6}
        className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
        placeholder="Generate notes from chat or write your own."
      />
    </section>
  );
}
