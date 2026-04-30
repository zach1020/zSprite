"use client";

import { Pause, Play, Repeat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatSeconds } from "@/lib/utils";

type VideoLoopEditorProps = {
  duration: number;
  loopStart: number;
  loopEnd: number;
  currentTime: number;
  isLoopPreviewActive: boolean;
  isVideoPlaying: boolean;
  onLoopStartChange: (value: number) => void;
  onLoopEndChange: (value: number) => void;
  onSetStartToCurrent: () => void;
  onSetEndToCurrent: () => void;
  onTogglePlayback: () => void;
  onToggleLoopPreview: () => void;
};

export function VideoLoopEditor({
  duration,
  loopStart,
  loopEnd,
  currentTime,
  isLoopPreviewActive,
  isVideoPlaying,
  onLoopStartChange,
  onLoopEndChange,
  onSetStartToCurrent,
  onSetEndToCurrent,
  onTogglePlayback,
  onToggleLoopPreview,
}: VideoLoopEditorProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Button variant="secondary" onClick={onTogglePlayback}>
          {isVideoPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          {isVideoPlaying ? "Pause" : "Play"}
        </Button>
        <Button
          variant={isLoopPreviewActive ? "default" : "outline"}
          onClick={onToggleLoopPreview}
        >
          <Repeat className="size-4" />
          {isLoopPreviewActive ? "Stop Loop" : "Loop Preview"}
        </Button>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Current Time</div>
          <div className="mt-1 font-mono text-base text-white">{formatSeconds(currentTime)}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Loop Start</span>
          <Input
            type="number"
            min={0}
            max={Math.max(0, duration - 0.1)}
            step="0.01"
            value={loopStart.toFixed(2)}
            onChange={(event) => onLoopStartChange(Number.parseFloat(event.target.value))}
          />
          <Button variant="ghost" className="w-full justify-start px-0" onClick={onSetStartToCurrent}>
            Set start to current time
          </Button>
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Loop End</span>
          <Input
            type="number"
            min={0.1}
            max={duration}
            step="0.01"
            value={loopEnd.toFixed(2)}
            onChange={(event) => onLoopEndChange(Number.parseFloat(event.target.value))}
          />
          <Button variant="ghost" className="w-full justify-start px-0" onClick={onSetEndToCurrent}>
            Set end to current time
          </Button>
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
            <span>Loop Start Slider</span>
            <span>{formatSeconds(loopStart)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, duration - 0.1)}
            step="0.01"
            value={loopStart}
            className="slider-track"
            onChange={(event) => onLoopStartChange(Number.parseFloat(event.target.value))}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
            <span>Loop End Slider</span>
            <span>{formatSeconds(loopEnd)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={duration}
            step="0.01"
            value={loopEnd}
            className="slider-track"
            onChange={(event) => onLoopEndChange(Number.parseFloat(event.target.value))}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
        Loop length: <span className="font-mono text-white">{formatSeconds(loopEnd - loopStart)}</span>
      </div>
    </div>
  );
}
