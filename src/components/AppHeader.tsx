import { Download, PackageOpen, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  frameCount: number;
  canExport: boolean;
  onExportSheet: () => void;
  onExportZip: () => void;
  isBusy: boolean;
};

export function AppHeader({
  frameCount,
  canExport,
  onExportSheet,
  onExportZip,
  isBusy,
}: AppHeaderProps) {
  return (
    <header className="panel-surface relative overflow-hidden rounded-[1.8rem] px-6 py-5">
      <div className="absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top_left,rgba(84,245,197,0.2),transparent_60%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">
            <Sparkles className="size-3.5" />
            Creative Sprite Tool
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">ZSprite</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Turn AI animation videos into game-ready 2D sprites.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Ready Frames</div>
            <div className="mt-1 text-lg font-semibold text-white">{frameCount}</div>
          </div>
          <Button
            variant="outline"
            onClick={onExportSheet}
            disabled={!canExport || isBusy}
            className="min-w-40"
          >
            <Download className="size-4" />
            Export Sheet
          </Button>
          <Button
            variant="secondary"
            onClick={onExportZip}
            disabled={!canExport || isBusy}
            className="min-w-40"
          >
            <PackageOpen className="size-4" />
            Export ZIP
          </Button>
        </div>
      </div>
    </header>
  );
}
