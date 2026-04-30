import JSZip from "jszip";

import { canvasToBlob, imageDataToCanvas } from "@/lib/canvas";
import { clamp, zeroPad } from "@/lib/utils";
import type { ProcessedFrame } from "@/types/zsprite";

export function getSpriteSheetMeta(
  totalFrames: number,
  frameWidth: number,
  frameHeight: number,
  columns: number,
) {
  const safeColumns = clamp(columns, 1, Math.max(1, totalFrames));
  const rows = Math.ceil(totalFrames / safeColumns);

  return {
    columns: safeColumns,
    rows,
    width: frameWidth * safeColumns,
    height: frameHeight * rows,
  };
}

export function buildSpriteSheetCanvas(frames: ProcessedFrame[], columns: number) {
  if (!frames.length) {
    throw new Error("No processed frames are available for export.");
  }

  const frameWidth = frames[0].width;
  const frameHeight = frames[0].height;
  const meta = getSpriteSheetMeta(frames.length, frameWidth, frameHeight, columns);
  const canvas = document.createElement("canvas");
  canvas.width = meta.width;
  canvas.height = meta.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering context is unavailable.");
  }

  frames.forEach((frame, index) => {
    const frameCanvas = imageDataToCanvas(frame.imageData);
    const column = index % meta.columns;
    const row = Math.floor(index / meta.columns);
    context.drawImage(frameCanvas, column * frameWidth, row * frameHeight);
  });

  return canvas;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadSpriteSheet(
  frames: ProcessedFrame[],
  columns: number,
  filenamePrefix: string,
) {
  const canvas = buildSpriteSheetCanvas(frames, columns);
  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, `${filenamePrefix || "zsprite"}_sheet.png`);
}

export async function downloadFramesZip(frames: ProcessedFrame[], filenamePrefix: string) {
  if (!frames.length) {
    throw new Error("No processed frames are available for export.");
  }

  const zip = new JSZip();
  const padLength = Math.max(3, String(frames.length - 1).length);

  for (const [index, frame] of frames.entries()) {
    const canvas = imageDataToCanvas(frame.imageData);
    const blob = await canvasToBlob(canvas);
    zip.file(`${filenamePrefix || "zsprite"}_${zeroPad(index, padLength)}.png`, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, `${filenamePrefix || "zsprite"}_frames.zip`);
}
