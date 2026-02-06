"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type TrackStatus = "DEMO" | "MIXING" | "MASTERED" | "RELEASED";

const statusOptions: { value: TrackStatus; label: string }[] = [
  { value: "DEMO", label: "Demo" },
  { value: "MIXING", label: "Mixing" },
  { value: "MASTERED", label: "Mastered" },
  { value: "RELEASED", label: "Released" }
];

type TrackStatusSelectProps = {
  projectId: string;
  trackId: string;
  status: TrackStatus;
  onUpdated?: (track: { status: TrackStatus }) => void;
};

export default function TrackStatusSelect({
  projectId,
  trackId,
  status,
  onUpdated
}: TrackStatusSelectProps) {
  const [currentStatus, setCurrentStatus] = useState<TrackStatus>(status);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value as TrackStatus;
    const previousStatus = currentStatus;
    setCurrentStatus(nextStatus);
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/tracks/${trackId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
        }
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setCurrentStatus(previousStatus);
        setError(payload?.error ?? "Unable to update status.");
        setIsUpdating(false);
        return;
      }

      const updatedStatus = payload?.track?.status ?? nextStatus;
      setCurrentStatus(updatedStatus);
      onUpdated?.({ status: updatedStatus });
      setIsUpdating(false);
    } catch (submitError) {
      setCurrentStatus(previousStatus);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to update status."
      );
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[color:var(--color-text)]">
        Track status
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={currentStatus}
          onChange={handleChange}
          disabled={isUpdating}
          className="rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
        >
          {statusOptions.map((statusOption) => (
            <option key={statusOption.value} value={statusOption.value}>
              {statusOption.label}
            </option>
          ))}
        </select>
        {isUpdating ? (
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            Updating...
          </span>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

type TrackDeleteButtonProps = {
  projectId: string;
  trackId: string;
};

export function TrackDeleteButton({
  projectId,
  trackId
}: TrackDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this track? This cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/tracks/${trackId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error ?? "Unable to delete track.");
        setIsDeleting(false);
        return;
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete track."
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isDeleting ? "Deleting..." : "Delete track"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
