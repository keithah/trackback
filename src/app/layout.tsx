import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Work_Sans } from "next/font/google";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

const bodyFont = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Trackback",
  description: "Music collaboration workspace"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen text-[color:var(--color-text)] antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="mx-auto w-full max-w-6xl px-6 pt-8">
            <div className="surface-card flex flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-text-muted)]">
                  Trackback
                </p>
                <p className="font-display text-lg font-semibold">
                  Session Workspace
                </p>
              </div>
              <div className="hidden items-center gap-3 text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)] sm:flex">
                <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1">
                  Projects
                </span>
                <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1">
                  Tracks
                </span>
                <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1">
                  Invites
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6 text-xs text-[color:var(--color-text-muted)]">
            Built for clear feedback, calm sessions, and trusted history.
          </footer>
        </div>
      </body>
    </html>
  );
}
