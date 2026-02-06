"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VersionUploadPanelProps = {
  projectId: string;
  trackId: string;
};

const allowedMimeTypes = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/aiff",
  "audio/x-aiff",
  "audio/flac",
  "audio/x-flac",
]);

const allowedExtensions = new Set([".wav", ".aif", ".aiff", ".flac"]);

function hasAllowedExtension(name: string) {
  const lower = name.toLowerCase();
  for (const ext of allowedExtensions) {
    if (lower.endsWith(ext)) {
      return true;
    }
  }
  return false;
}

export default function VersionUploadPanel({
  projectId,
  trackId,
}: VersionUploadPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"upload" | "external">("upload");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setNotes("");
    setExternalUrl("");
    setFile(null);
    setProgress(0);
    setError(null);
    setIsSubmitting(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Select a file to upload.");
      return;
    }

    if (file.type && !allowedMimeTypes.has(file.type) && !hasAllowedExtension(file.name)) {
      setError("Upload WAV, AIFF, or FLAC files only.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setProgress(0);

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append("file", file);
      formData.append("name", name.trim() || file.name);
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resetForm();
          router.refresh();
        } else {
          let message = "Unable to upload file.";
          try {
            const payload = JSON.parse(xhr.responseText ?? "{}");
            if (payload?.error) {
              message = payload.error;
            }
          } catch {
            // ignore JSON parse errors
          }
          setError(message);
          setIsSubmitting(false);
        }
        resolve();
      };

      xhr.onerror = () => {
        setError("Upload failed. Please try again.");
        setIsSubmitting(false);
        resolve();
      };

      xhr.open(
        "POST",
        `/api/projects/${projectId}/tracks/${trackId}/versions/upload`
      );
      xhr.send(formData);
    });
  };

  const handleExternal = async () => {
    if (!externalUrl.trim()) {
      setError("Add a valid URL.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response = await fetch(
      `/api/projects/${projectId}/tracks/${trackId}/versions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "External link",
          notes: notes.trim() || undefined,
          externalUrl: externalUrl.trim(),
        }),
      }
    );

    if (!response.ok) {
      setError("Unable to save external link.");
      setIsSubmitting(false);
      return;
    }

    resetForm();
    router.refresh();
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            Add a demo
          </h2>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Upload a file or link to an external demo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              mode === "upload"
                ? "border-[color:var(--color-accent)] text-[color:var(--color-text)]"
                : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("external")}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              mode === "external"
                ? "border-[color:var(--color-accent)] text-[color:var(--color-text)]"
                : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
            }`}
          >
            External link
          </button>
        </div>
      </div>
      <div className="grid gap-4">
        <label className="block text-sm font-medium text-[color:var(--color-text)]">
          Version name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
            placeholder={mode === "external" ? "SoundCloud link" : "Demo v3"}
          />
        </label>
        <label className="block text-sm font-medium text-[color:var(--color-text)]">
          Notes (optional)
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
            placeholder="Capture the latest tweaks, references, or goals."
          />
        </label>
        {mode === "upload" ? (
          <label className="block text-sm font-medium text-[color:var(--color-text)]">
            Audio file (WAV/AIFF/FLAC)
            <input
              type="file"
              accept=".wav,.aif,.aiff,.flac,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff,audio/flac,audio/x-flac"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm"
            />
          </label>
        ) : (
          <label className="block text-sm font-medium text-[color:var(--color-text)]">
            External URL
            <input
              type="url"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
              placeholder="https://soundcloud.com/..."
            />
          </label>
        )}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {mode === "upload" && isSubmitting ? (
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-border)]">
              <div
                className="h-2 rounded-full bg-[color:var(--color-accent)] transition"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Uploading... {progress}%
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={mode === "upload" ? handleUpload : handleExternal}
            disabled={isSubmitting}
            className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {mode === "upload" ? "Upload demo" : "Save link"}
          </button>
        </div>
      </div>
    </section>
  );
}
