/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/utils";

type PreviewFrame = {
  id: string;
  time: number;
  width: number;
  height: number;
  url: string;
};

type AnimationPreviewProps = {
  frames: PreviewFrame[];
  fps: number;
  title: string;
  subtitle: string;
  isBusy?: boolean;
};

export function AnimationPreview({ frames, fps, title, subtitle, isBusy = false }: AnimationPreviewProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const advanceFrame = useEffectEvent(() => {
    setFrameIndex((current) => {
      if (!frames.length) {
        return 0;
      }

      return (current + 1) % frames.length;
    });
  });

  useEffect(() => {
    if (!isPlaying || frames.length < 2) {
      return;
    }

    const interval = window.setInterval(advanceFrame, 1000 / Math.max(1, fps));
    return () => window.clearInterval(interval);
  }, [fps, frames.length, isPlaying]);

  const activeFrame = frames[frames.length ? frameIndex % frames.length : 0];

  return (
    <div className="panel-surface flex h-full min-h-[29rem] flex-col overflow-hidden rounded-[1.8rem]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div>
          <div className="text-xs uppercase tracking-[0.26em] text-slate-500">{title}</div>
          <div className="mt-1 text-sm text-slate-300">{subtitle}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            {frames.length} frames
          </div>
          <Button variant="secondary" onClick={() => setIsPlaying((current) => !current)} disabled={frames.length < 2}>
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-5">
        <div className="checkerboard relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/70">
          {activeFrame ? (
            <img
              src={activeFrame.url}
              alt={`Frame ${frameIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-center text-sm leading-6 text-slate-400">
              Extract frames to preview your sprite loop here.
            </div>
          )}
          {isBusy ? (
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
              Rebuilding processed frames...
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-5 py-4 text-sm text-slate-400">
        <div>
          Frame {Math.min(frameIndex + 1, frames.length || 1)} / {Math.max(frames.length, 1)}
        </div>
        <div className="font-mono">
          {activeFrame ? `${activeFrame.width}×${activeFrame.height}` : "--"}
        </div>
        <div className="font-mono">{activeFrame ? formatSeconds(activeFrame.time) : "--"}</div>
      </div>
    </div>
  );
}
