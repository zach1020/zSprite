"use client";

import { Download, PackageOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSpriteSheetMeta } from "@/lib/export-sprites";
import type { ExportSettings, ProcessedFrame } from "@/types/zsprite";

type ExportPanelProps = {
  frames: ProcessedFrame[];
  settings: ExportSettings;
  isBusy: boolean;
  onChange: (partial: Partial<ExportSettings>) => void;
  onExportSheet: () => void;
  onExportZip: () => void;
};

export function ExportPanel({
  frames,
  settings,
  isBusy,
  onChange,
  onExportSheet,
  onExportZip,
}: ExportPanelProps) {
  const firstFrame = frames[0];
  const sheetMeta = firstFrame
    ? getSpriteSheetMeta(frames.length, firstFrame.width, firstFrame.height, settings.columns)
    : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={settings.format === "spritesheet" ? "default" : "secondary"}
          onClick={() => onChange({ format: "spritesheet" })}
        >
          Sprite Sheet
        </Button>
        <Button
          variant={settings.format === "zip" ? "default" : "secondary"}
          onClick={() => onChange({ format: "zip" })}
        >
          PNG ZIP
        </Button>
      </div>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Columns</span>
        <Input
          type="number"
          min={1}
          max={Math.max(1, frames.length || 1)}
          value={settings.columns}
          onChange={(event) => onChange({ columns: Math.max(1, Number.parseInt(event.target.value || "1", 10)) })}
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Filename Prefix</span>
        <Input
          value={settings.filenamePrefix}
          onChange={(event) => onChange({ filenamePrefix: event.target.value })}
        />
      </label>

      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-300">
        {sheetMeta ? (
          <>
            <div>Sprite sheet preview: {sheetMeta.width}×{sheetMeta.height}px</div>
            <div>Grid: {sheetMeta.columns} columns × {sheetMeta.rows} rows</div>
            <div>Frame size: {firstFrame.width}×{firstFrame.height}px</div>
          </>
        ) : (
          "Process frames to unlock export previews."
        )}
      </div>

      <div className="grid gap-3">
        <Button onClick={onExportSheet} disabled={!frames.length || isBusy}>
          <Download className="size-4" />
          Download Sprite Sheet PNG
        </Button>
        <Button variant="secondary" onClick={onExportZip} disabled={!frames.length || isBusy}>
          <PackageOpen className="size-4" />
          Download PNG ZIP
        </Button>
      </div>
    </div>
  );
}
