"use client";

import { useState, type FormEvent } from "react";

type InviteModalProps = {
  projectId: string;
  triggerLabel?: string;
};

export default function InviteModal({
  projectId,
  triggerLabel = "Invite"
}: InviteModalProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setValue("");
    setError(null);
    setSuccess(null);
    setIsSubmitting(false);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    const normalized = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

    if (!normalized) {
      setError("Enter an email or username.");
      return;
    }

    const isEmail = normalized.includes("@");
    const payload = isEmail
      ? { email: normalized }
      : { username: normalized };

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? "Unable to send invite.");
        setIsSubmitting(false);
        return;
      }

      if (isEmail) {
        setSuccess(`Invite sent to ${normalized}.`);
      } else {
        setSuccess(`@${normalized} added to the project.`);
      }

      setIsSubmitting(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send invite."
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
          <div className="surface-card relative z-10 w-full max-w-xl px-8 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-muted)]">
                  Invite
                </p>
                <h2 className="font-display text-2xl font-semibold">
                  Bring collaborators in
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
                Email or username
                <input
                  type="text"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
                  placeholder="name@example.com or @producer"
                />
              </label>
              {success ? (
                <p className="text-sm text-emerald-600">{success}</p>
              ) : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Invites can be accepted through email or instantly for existing
                  users.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : "Send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
