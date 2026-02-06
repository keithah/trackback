"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type TrackStatus = "DEMO" | "MIXING" | "MASTERED" | "RELEASED";

const statusOptions: { value: TrackStatus; label: string }[] = [
  { value: "DEMO", label: "Demo" },
  { value: "MIXING", label: "Mixing" },
  { value: "MASTERED", label: "Mastered" },
  { value: "RELEASED", label: "Released" }
];

export default function ProjectCreateModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultTrackStatus, setDefaultTrackStatus] = useState<TrackStatus>(
    "DEMO"
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDefaultTrackStatus("DEMO");
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
      setError("Project name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          defaultTrackStatus
        })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Unable to create project.");
        setIsSubmitting(false);
        return;
      }

      const projectId = payload?.project?.id;

      if (!projectId) {
        setError("Project created but response was incomplete.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/projects/${projectId}?created=1`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create project."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[color:var(--color-accent)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)]"
      >
        Create project
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
                  New project
                </p>
                <h2 className="font-display text-2xl font-semibold">
                  Start a new collaboration
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
                Project name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
                  placeholder="Evening session drafts"
                />
              </label>
              <label className="block text-sm font-medium text-[color:var(--color-text)]">
                Description (optional)
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
                  placeholder="Give collaborators the quick context."
                />
              </label>
              <label className="block text-sm font-medium text-[color:var(--color-text)]">
                Default track status
                <select
                  value={defaultTrackStatus}
                  onChange={(event) =>
                    setDefaultTrackStatus(event.target.value as TrackStatus)
                  }
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  After creation, you can immediately add tracks.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating..." : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
