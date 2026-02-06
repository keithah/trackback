"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

type AudioPlayerProps = {
  audioUrl: string;
  durationSeconds?: number | null;
  sampleRate?: number | null;
  bitrateKbps?: number | null;
};

export default function AudioPlayer({
  audioUrl,
  durationSeconds,
  sampleRate,
  bitrateKbps,
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#d8cfc6",
      progressColor: "#d1632f",
      cursorColor: "#d1632f",
      height: 80,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    });

    waveSurferRef.current = waveSurfer;
    setIsReady(false);
    setIsPlaying(false);

    waveSurfer.on("ready", () => {
      setIsReady(true);
    });

    waveSurfer.on("play", () => setIsPlaying(true));
    waveSurfer.on("pause", () => setIsPlaying(false));
    waveSurfer.on("finish", () => setIsPlaying(false));

    waveSurfer.load(audioUrl);

    return () => {
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!waveSurferRef.current || !isReady) {
      return;
    }

    waveSurferRef.current.playPause();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!isReady}
          className="rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <div className="text-xs text-[color:var(--color-text-muted)]">
          {durationSeconds
            ? `${Math.floor(durationSeconds / 60)}:${Math.round(
                durationSeconds % 60
              )
                .toString()
                .padStart(2, "0")}`
            : "--:--"}
          {sampleRate ? ` • ${sampleRate} Hz` : ""}
          {bitrateKbps ? ` • ${bitrateKbps} kbps` : ""}
        </div>
      </div>
      <div
        ref={containerRef}
        className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 px-4 py-3"
      />
    </div>
  );
}
