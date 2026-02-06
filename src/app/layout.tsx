import "./globals.css";
import type { Metadata } from "next";

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
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
