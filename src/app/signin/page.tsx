"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center px-6 py-16">
      <div className="surface-card w-full max-w-xl px-8 py-10">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Trackback access
          </p>
          <h1 className="font-display text-3xl font-semibold">
            Sign in to continue the session
          </h1>
          <p className="text-sm leading-relaxed text-[color:var(--color-text-muted)]">
            Trackback keeps feedback, demos, and decisions aligned. Use your
            studio GitHub to unlock the workspace.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent)]"
          >
            Continue with GitHub
          </button>
          <div className="surface-muted flex items-center justify-between px-4 py-3 text-xs text-[color:var(--color-text-muted)]">
            <span>Private by default</span>
            <span>Invite-only collaboration</span>
          </div>
        </div>
        <p className="mt-6 text-xs text-[color:var(--color-text-muted)]">
          By signing in, you agree to keep session notes and audio drafts
          confidential.
        </p>
      </div>
    </section>
  );
}
