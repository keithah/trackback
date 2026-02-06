"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

type VersionSummary = {
  id: string;
  name: string;
  audioUrl: string | null;
  audioDurationSeconds: number | null;
  audioSampleRate: number | null;
  audioBitrateKbps: number | null;
};

type VersionCompareProps = {
  left: VersionSummary;
  right: VersionSummary;
};

export default function VersionCompare({ left, right }: VersionCompareProps) {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const leftWave = useRef<WaveSurfer | null>(null);
  const rightWave = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) {
      return;
    }

    if (!left.audioUrl || !right.audioUrl) {
      return;
    }

    const leftPlayer = WaveSurfer.create({
      container: leftRef.current,
      waveColor: "#cfc6bd",
      progressColor: "#d1632f",
      cursorColor: "#d1632f",
      height: 70,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    });

    const rightPlayer = WaveSurfer.create({
      container: rightRef.current,
      waveColor: "#cfc6bd",
      progressColor: "#d1632f",
      cursorColor: "#d1632f",
      height: 70,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    });

    leftWave.current = leftPlayer;
    rightWave.current = rightPlayer;
    setIsReady(false);
    setIsPlaying(false);

    let readyCount = 0;
    const handleReady = () => {
      readyCount += 1;
      if (readyCount === 2) {
        setIsReady(true);
      }
    };

    leftPlayer.on("ready", handleReady);
    rightPlayer.on("ready", handleReady);

    const syncSeek = (source: WaveSurfer, target: WaveSurfer) => {
      source.on("interaction", () => {
        const progress = source.getCurrentTime() / source.getDuration();
        if (Number.isFinite(progress)) {
          target.seekTo(progress);
        }
      });
    };

    syncSeek(leftPlayer, rightPlayer);
    syncSeek(rightPlayer, leftPlayer);

    leftPlayer.on("finish", () => setIsPlaying(false));
    rightPlayer.on("finish", () => setIsPlaying(false));

    leftPlayer.load(left.audioUrl);
    rightPlayer.load(right.audioUrl);

    return () => {
      leftPlayer.destroy();
      rightPlayer.destroy();
      leftWave.current = null;
      rightWave.current = null;
    };
  }, [left, right]);

  const togglePlayback = () => {
    if (!leftWave.current || !rightWave.current || !isReady) {
      return;
    }

    if (isPlaying) {
      leftWave.current.pause();
      rightWave.current.pause();
      setIsPlaying(false);
    } else {
      leftWave.current.play();
      rightWave.current.play();
      setIsPlaying(true);
    }
  };

  if (!left.audioUrl || !right.audioUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] px-5 py-6 text-sm text-[color:var(--color-text-muted)]">
        Both versions need audio URLs for comparison.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Compare versions
          </h3>
          <p className="mt-1 text-sm text-[color:var(--color-text)]">
            {left.name} vs {right.name}
          </p>
        </div>
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!isReady}
          className="rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-[color:var(--color-accent-glow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPlaying ? "Pause both" : "Play both"}
        </button>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            {left.name}
          </p>
          <div ref={leftRef} className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 px-4 py-3" />
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            {right.name}
          </p>
          <div ref={rightRef} className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 px-4 py-3" />
        </div>
      </div>
    </div>
  );
}
