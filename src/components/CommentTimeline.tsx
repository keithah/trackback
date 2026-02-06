"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CommentItem = {
  id: string;
  body: string;
  timestampSeconds: number;
  createdAt: string | Date;
  versionId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

type CommentTimelineProps = {
  projectId: string;
  trackId: string;
  refreshToken?: number;
};

function formatTimestamp(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function CommentTimeline({
  projectId,
  trackId,
  refreshToken,
}: CommentTimelineProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/tracks/${trackId}/comments`
      );

      if (!response.ok) {
        setError("Unable to load comments.");
        return;
      }

      const payload = await response.json();
      const items = Array.isArray(payload?.comments) ? payload.comments : [];
      setComments(items);
      setUpdatedAt(new Date());
      setError(null);
    } catch {
      setError("Unable to load comments.");
    }
  }, [projectId, trackId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments, refreshToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchComments();
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchComments]);

  const list = useMemo(() => comments, [comments]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
          Timeline
        </h2>
        {updatedAt ? (
          <span className="text-xs text-[color:var(--color-text-muted)]">
            Updated {updatedAt.toLocaleTimeString("en-US")}
          </span>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {list.length ? (
        <div className="space-y-3">
          {list.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-[color:var(--color-border)] bg-white/60 px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[color:var(--color-text)]">
                    {comment.user.name || comment.user.email || "Unknown"}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">
                    {formatTimestamp(comment.timestampSeconds)}
                    {comment.createdAt
                      ? ` • ${new Date(comment.createdAt).toLocaleString("en-US")}`
                      : ""}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-[color:var(--color-text)]">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] px-5 py-6 text-sm text-[color:var(--color-text-muted)]">
          No comments yet. Add the first note at a timestamp.
        </div>
      )}
    </section>
  );
}
