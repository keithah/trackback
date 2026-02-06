"use client";

import { useState } from "react";

type CommentComposerProps = {
  projectId: string;
  trackId: string;
  defaultVersionId?: string;
  onCommentPosted?: () => void;
};

function parseTimestamp(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const parts = trimmed.split(":");

  if (parts.length !== 2) {
    return null;
  }

  const minutes = Number(parts[0]);
  const seconds = Number(parts[1]);

  if (Number.isNaN(minutes) || Number.isNaN(seconds) || seconds >= 60) {
    return null;
  }

  return minutes * 60 + seconds;
}

export default function CommentComposer({
  projectId,
  trackId,
  defaultVersionId,
  onCommentPosted,
}: CommentComposerProps) {
  const [timestampInput, setTimestampInput] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const timestampSeconds = parseTimestamp(timestampInput);

    if (timestampSeconds === null) {
      setError("Enter a timestamp like 01:10.");
      return;
    }

    if (!body.trim()) {
      setError("Comment text is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response = await fetch(
      `/api/projects/${projectId}/tracks/${trackId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          timestampSeconds,
          versionId: defaultVersionId,
        }),
      }
    );

    if (!response.ok) {
      setError("Unable to post comment.");
      setIsSubmitting(false);
      return;
    }

    setBody("");
    setTimestampInput("");
    setIsSubmitting(false);
    onCommentPosted?.();
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
        Add comment
      </h2>
      <div className="grid gap-3">
        <label className="block text-sm font-medium text-[color:var(--color-text)]">
          Timestamp (mm:ss)
          <input
            type="text"
            value={timestampInput}
            onChange={(event) => setTimestampInput(event.target.value)}
            className="mt-2 w-full max-w-xs rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
            placeholder="01:10"
          />
        </label>
        <label className="block text-sm font-medium text-[color:var(--color-text)]">
          Comment
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
            placeholder="Add feedback or notes for this moment..."
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Posting..." : "Post comment"}
          </button>
        </div>
      </div>
    </section>
  );
}
