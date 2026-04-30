"use client";

import { Input } from "@/components/ui/input";
import { parseOptionalNumber } from "@/lib/utils";
import type { CropSettings } from "@/types/zsprite";

type CropSizingPanelProps = {
  settings: CropSettings;
  onChange: (partial: Partial<CropSettings>) => void;
};

export function CropSizingPanel({ settings, onChange }: CropSizingPanelProps) {
  return (
    <div className="space-y-5">
      <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <span>Enable auto-crop</span>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) => onChange({ enabled: event.target.checked })}
          className="size-4 accent-[color:var(--accent)]"
        />
      </label>

      <label className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>Padding</span>
          <span>{settings.padding}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={96}
          value={settings.padding}
          className="slider-track"
          onChange={(event) => onChange({ padding: Number.parseInt(event.target.value, 10) })}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Output Width</span>
          <Input
            type="number"
            min={1}
            placeholder="Auto"
            value={settings.outputWidth ?? ""}
            onChange={(event) => onChange({ outputWidth: parseOptionalNumber(event.target.value) })}
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Output Height</span>
          <Input
            type="number"
            min={1}
            placeholder="Auto"
            value={settings.outputHeight ?? ""}
            onChange={(event) => onChange({ outputHeight: parseOptionalNumber(event.target.value) })}
          />
        </label>
      </div>

      <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <span>Lock aspect ratio</span>
        <input
          type="checkbox"
          checked={settings.lockAspectRatio}
          onChange={(event) => onChange({ lockAspectRatio: event.target.checked })}
          className="size-4 accent-[color:var(--accent)]"
        />
      </label>

      <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <span>Reduce-to-fit</span>
        <input
          type="checkbox"
          checked={settings.reduceToFit}
          onChange={(event) => onChange({ reduceToFit: event.target.checked })}
          className="size-4 accent-[color:var(--accent)]"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Alignment</span>
        <select
          className="h-11 w-full rounded-xl border border-[color:var(--border)] bg-white/6 px-3 text-sm text-white outline-none focus:border-[color:var(--accent)]"
          value={settings.alignment}
          onChange={(event) =>
            onChange({ alignment: event.target.value as CropSettings["alignment"] })
          }
        >
          <option value="center">Center</option>
          <option value="bottom-center">Bottom-center</option>
        </select>
      </label>

      <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-400">
        Auto-crop uses one global bounding box across all included frames so the sprite stays stable instead of jittering.
      </p>
    </div>
  );
}
