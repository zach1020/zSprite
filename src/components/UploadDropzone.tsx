"use client";

import { FileVideo, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ACCEPTED_VIDEO_EXTENSIONS } from "@/types/zsprite";

type UploadDropzoneProps = {
  onFileSelect: (file: File) => void;
  compact?: boolean;
};

export function UploadDropzone({ onFileSelect, compact = false }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-[1.75rem] border border-dashed border-white/15 bg-[radial-gradient(circle_at_top_left,rgba(84,245,197,0.12),transparent_40%),rgba(255,255,255,0.04)] transition",
        compact ? "p-5" : "p-8 sm:p-12",
        isDragging ? "border-[color:var(--accent)] bg-white/8" : "hover:border-white/30 hover:bg-white/6",
      ].join(" ")}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
          onFileSelect(file);
        }
      }}
    >
      <div className="absolute inset-0 grid-backdrop opacity-70" />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="flex size-18 items-center justify-center rounded-3xl border border-white/10 bg-white/8 text-[color:var(--accent)] shadow-[0_0_40px_rgba(84,245,197,0.18)]">
          {compact ? <FileVideo className="size-8" /> : <UploadCloud className="size-9" />}
        </div>
        <div className="space-y-3">
          <h2 className={compact ? "text-xl font-semibold text-white" : "text-2xl font-semibold text-white sm:text-3xl"}>
            Upload a short character animation video to start building a sprite sheet.
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Drag and drop a clip or choose a file. Processing stays in this browser so you can work locally without a backend.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => inputRef.current?.click()} size={compact ? "default" : "lg"}>
            <UploadCloud className="size-4" />
            Choose Video
          </Button>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            Accepted: {ACCEPTED_VIDEO_EXTENSIONS.join("  ")}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelect(file);
          }
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
