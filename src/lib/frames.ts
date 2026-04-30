import { imageDataToObjectUrl } from "@/lib/canvas";
import { clamp } from "@/lib/utils";
import { createVideoElement, seekVideo } from "@/lib/video";
import type { ExtractedFrame } from "@/types/zsprite";

export function nextTick() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

export function estimateFrameCount(start: number, end: number, fps: number) {
  const safeFps = Math.max(1, fps);
  return Math.max(1, Math.floor((Math.max(0, end - start) * safeFps)) + 1);
}

export function drawVideoToImageData(video: HTMLVideoElement) {
  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    throw new Error("Video has no readable dimensions.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering context is unavailable.");
  }

  context.drawImage(video, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

export async function extractFramesFromVideo(
  sourceUrl: string,
  start: number,
  end: number,
  fps: number,
  onProgress?: (progress: number) => void,
) {
  const video = await createVideoElement(sourceUrl);
  const safeStart = clamp(start, 0, video.duration || end);
  const safeEnd = clamp(end, safeStart + 0.1, video.duration || end);
  const interval = 1 / Math.max(1, fps);
  const frameCount = estimateFrameCount(safeStart, safeEnd, fps);
  const frames: ExtractedFrame[] = [];

  for (let index = 0; index < frameCount; index += 1) {
    const time = Math.min(safeStart + index * interval, safeEnd);
    await seekVideo(video, time);
    const imageData = drawVideoToImageData(video);
    const thumbnailUrl = await imageDataToObjectUrl(imageData);

    frames.push({
      id: crypto.randomUUID(),
      index,
      time,
      imageData,
      width: imageData.width,
      height: imageData.height,
      included: true,
      thumbnailUrl,
    });

    onProgress?.((index + 1) / frameCount);

    if (index > 0 && index % 10 === 0) {
      await nextTick();
    }
  }

  video.pause();
  video.removeAttribute("src");
  video.load();

  return frames;
}
