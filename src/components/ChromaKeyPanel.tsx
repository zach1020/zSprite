"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChromaKeyColor, ChromaKeySettings } from "@/types/zsprite";

const presets: ChromaKeyColor[] = ["green", "blue", "black", "custom"];

type ChromaKeyPanelProps = {
  settings: ChromaKeySettings;
  previewMode: "before" | "after";
  onChange: (partial: Partial<ChromaKeySettings>) => void;
  onPreviewModeChange: (value: "before" | "after") => void;
};

export function ChromaKeyPanel({
  settings,
  previewMode,
  onChange,
  onPreviewModeChange,
}: ChromaKeyPanelProps) {
  return (
    <div className="space-y-5">
      <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <span>Enable background removal</span>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) => onChange({ enabled: event.target.checked })}
          className="size-4 accent-[color:var(--accent)]"
        />
      </label>

      <div className="space-y-3">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Key Color</div>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset}
              variant={settings.keyColor === preset ? "default" : "secondary"}
              onClick={() => onChange({ keyColor: preset })}
            >
              {preset}
            </Button>
          ))}
        </div>
        {settings.keyColor === "custom" ? (
          <Input
            type="color"
            value={settings.customColor}
            onChange={(event) => onChange({ customColor: event.target.value })}
            className="h-12 cursor-pointer p-2"
          />
        ) : null}
      </div>

      <label className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>Tolerance</span>
          <span>{settings.tolerance}</span>
        </div>
        <input
          type="range"
          min={0}
          max={255}
          value={settings.tolerance}
          className="slider-track"
          onChange={(event) => onChange({ tolerance: Number.parseInt(event.target.value, 10) })}
        />
      </label>

      <label className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>Softness</span>
          <span>{settings.softness}</span>
        </div>
        <input
          type="range"
          min={0}
          max={255}
          value={settings.softness}
          className="slider-track"
          onChange={(event) => onChange({ softness: Number.parseInt(event.target.value, 10) })}
        />
      </label>

      <label className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>Spill Suppression</span>
          <span>{settings.spillSuppression}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.spillSuppression}
          className="slider-track"
          onChange={(event) => onChange({ spillSuppression: Number.parseInt(event.target.value, 10) })}
        />
      </label>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Preview</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={previewMode === "before" ? "default" : "secondary"}
            onClick={() => onPreviewModeChange("before")}
          >
            Before
          </Button>
          <Button
            variant={previewMode === "after" ? "default" : "secondary"}
            onClick={() => onPreviewModeChange("after")}
          >
            After
          </Button>
        </div>
        <p className="text-sm leading-6 text-slate-400">
          Removes colored edge artifacts left behind after chroma keying.
        </p>
      </div>
    </div>
  );
}
