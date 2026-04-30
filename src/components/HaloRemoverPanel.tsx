"use client";

import type { HaloSettings } from "@/types/zsprite";

type HaloRemoverPanelProps = {
  settings: HaloSettings;
  onChange: (partial: Partial<HaloSettings>) => void;
};

export function HaloRemoverPanel({ settings, onChange }: HaloRemoverPanelProps) {
  return (
    <div className="space-y-5">
      <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <span>Enable halo remover</span>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) => onChange({ enabled: event.target.checked })}
          className="size-4 accent-[color:var(--accent)]"
        />
      </label>

      <label className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>Edge Erosion</span>
          <span>{settings.erosionPixels}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={6}
          value={settings.erosionPixels}
          className="slider-track"
          onChange={(event) => onChange({ erosionPixels: Number.parseInt(event.target.value, 10) })}
        />
      </label>

      <label className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>Alpha Threshold</span>
          <span>{settings.alphaThreshold}</span>
        </div>
        <input
          type="range"
          min={0}
          max={255}
          value={settings.alphaThreshold}
          className="slider-track"
          onChange={(event) => onChange({ alphaThreshold: Number.parseInt(event.target.value, 10) })}
        />
      </label>

      <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-400">
        Removes colored edge artifacts left behind after chroma keying by shrinking the visible alpha mask at the boundary.
      </p>
    </div>
  );
}
