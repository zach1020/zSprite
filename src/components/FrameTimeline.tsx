/* eslint-disable @next/next/no-img-element */
"use client";

import { Eye, EyeOff, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExtractedFrame } from "@/types/zsprite";

type FrameTimelineProps = {
  frames: ExtractedFrame[];
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleIncluded: (id: string) => void;
};

export function FrameTimeline({
  frames,
  selectedIds,
  onToggleSelected,
  onToggleIncluded,
}: FrameTimelineProps) {
  return (
    <div className="panel-surface rounded-[1.8rem] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.26em] text-slate-500">Frame Timeline</div>
          <p className="mt-1 text-sm text-slate-300">
            Click a frame to select it. Use the eye control to include or remove it from processing.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
          <MousePointerClick className="size-4" />
          {selectedIds.size} selected
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {frames.map((frame) => {
          const isSelected = selectedIds.has(frame.id);

          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => onToggleSelected(frame.id)}
              className={cn(
                "group relative min-w-34 overflow-hidden rounded-[1.25rem] border bg-slate-950/80 text-left transition",
                frame.included ? "border-white/10 hover:border-white/25" : "border-white/6 opacity-55",
                isSelected ? "glow-ring border-[color:var(--accent)]" : "",
              )}
            >
              <div className="checkerboard flex aspect-square items-center justify-center">
                {frame.thumbnailUrl ? (
                  <img src={frame.thumbnailUrl} alt={`Frame ${frame.index}`} className="h-full w-full object-contain" />
                ) : null}
              </div>
              <div className="absolute left-2 top-2 rounded-lg bg-slate-950/80 px-2 py-1 text-[11px] font-mono text-slate-200">
                #{frame.index}
              </div>
              <div className="absolute right-2 top-2">
                <Button
                  type="button"
                  size="icon"
                  variant={frame.included ? "secondary" : "outline"}
                  className="size-9 rounded-xl bg-slate-950/70"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleIncluded(frame.id);
                  }}
                >
                  {frame.included ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between border-t border-white/8 px-3 py-2 text-xs text-slate-400">
                <span>{frame.time.toFixed(2)}s</span>
                <span>{frame.included ? "Included" : "Removed"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
