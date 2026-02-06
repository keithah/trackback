"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type TrackCreateModalProps = {
  projectId: string;
  defaultOpen?: boolean;
  triggerLabel?: string;
};

export default function TrackCreateModal({
  projectId,
  defaultOpen = false,
  triggerLabel = "Add track"
}: TrackCreateModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  const resetForm = () => {
    setName("");
    setNotes("");
    setUrl("");
    setError(null);
    setIsSubmitting(false);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Track name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          notes: notes.trim() || undefined,
          url: url.trim() || undefined
        })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Unable to create track.");
        setIsSubmitting(false);
        return;
      }

      const trackId = payload?.track?.id;

      if (!trackId) {
        setError("Track created but response was incomplete.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/projects/${projectId}/tracks/${trackId}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create track."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[color:var(--color-border)] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text)] transition duration-200 hover:border-[color:var(--color-accent)]"
      >
        {triggerLabel}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="surface-card relative z-10 w-full max-w-2xl px-8 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-muted)]">
                  Add track
                </p>
                <h2 className="font-display text-2xl font-semibold">
                  Name the next iteration
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)]"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <label className="block text-sm font-medium text-[color:var(--color-text)]">
                Track name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
                  placeholder="Lead vocal take 3"
                />
              </label>
              <label className="block text-sm font-medium text-[color:var(--color-text)]">
                Notes (optional)
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
                  placeholder="Capture the latest tweaks, references, or goals."
                />
              </label>
              <label className="block text-sm font-medium text-[color:var(--color-text)]">
                Audio link (optional)
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
                  placeholder="https://soundcloud.com/..."
                />
              </label>
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  You can edit status from the track page.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating..." : "Create track"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
