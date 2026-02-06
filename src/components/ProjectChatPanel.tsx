"use client";

import { useCallback, useEffect, useState } from "react";

type ChatMessage = {
  id: string;
  body: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

type ProjectChatPanelProps = {
  projectId: string;
};

export default function ProjectChatPanel({ projectId }: ProjectChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMessages = useCallback(async () => {
    const response = await fetch(`/api/projects/${projectId}/chat`);

    if (!response.ok) {
      setError("Unable to load chat history.");
      return;
    }

    const payload = await response.json();
    setMessages(payload?.messages ?? []);
    setError(null);
  }, [projectId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleSubmit = async () => {
    if (!body.trim()) {
      setError("Message is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response = await fetch(`/api/projects/${projectId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Unable to send message.");
      return;
    }

    setBody("");
    void loadMessages();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
          Project chat
        </h2>
      </div>
      <div className="space-y-3">
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[color:var(--color-text)]">
                  {message.user.name || message.user.email || "Unknown"}
                </p>
                <span className="text-xs text-[color:var(--color-text-muted)]">
                  {new Date(message.createdAt).toLocaleString("en-US")}
                </span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--color-text)]">
                {message.body}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] px-5 py-6 text-sm text-[color:var(--color-text-muted)]">
            No messages yet. Start the conversation.
          </div>
        )}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] shadow-sm focus:border-[color:var(--color-accent)] focus:outline-none"
          placeholder="Share updates or questions with collaborators..."
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
        </div>
      </div>
    </section>
  );
}
