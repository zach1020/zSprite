import { cloneImageData, imageDataToObjectUrl } from "@/lib/canvas";
import { applyChromaKey } from "@/lib/chroma-key";
import { applyGlobalCrop } from "@/lib/crop";
import { extractFramesFromVideo, nextTick } from "@/lib/frames";
import { erodeAlpha } from "@/lib/halo";
import type {
  ChromaKeySettings,
  CropSettings,
  ExtractedFrame,
  HaloSettings,
  ProcessedFrame,
} from "@/types/zsprite";

export { extractFramesFromVideo };

export async function processFrames(
  rawFrames: ExtractedFrame[],
  chromaKey: ChromaKeySettings,
  cropSettings: CropSettings,
  haloSettings: HaloSettings,
  onProgress?: (progress: number) => void,
) {
  const includedFrames = rawFrames.filter((frame) => frame.included);

  if (!includedFrames.length) {
    onProgress?.(1);
    return [] as ProcessedFrame[];
  }

  const keyedFrames: Array<{ source: ExtractedFrame; imageData: ImageData }> = [];

  for (let index = 0; index < includedFrames.length; index += 1) {
    const source = includedFrames[index];
    const imageData = chromaKey.enabled
      ? applyChromaKey(source.imageData, chromaKey)
      : cloneImageData(source.imageData);

    keyedFrames.push({ source, imageData });
    onProgress?.(((index + 1) / includedFrames.length) * 0.4);

    if (index > 0 && index % 10 === 0) {
      await nextTick();
    }
  }

  const cropped = cropSettings.enabled
    ? applyGlobalCrop(
        keyedFrames.map((frame) => frame.imageData),
        cropSettings,
        haloSettings.alphaThreshold,
      ).frames
    : keyedFrames.map((frame) => frame.imageData);

  const processedFrames: ProcessedFrame[] = [];

  for (let index = 0; index < cropped.length; index += 1) {
    const sourceFrame = keyedFrames[index].source;
    const haloFrame = haloSettings.enabled
      ? erodeAlpha(cropped[index], haloSettings.erosionPixels, haloSettings.alphaThreshold)
      : cloneImageData(cropped[index]);
    const previewUrl = await imageDataToObjectUrl(haloFrame);

    processedFrames.push({
      id: sourceFrame.id,
      index: sourceFrame.index,
      time: sourceFrame.time,
      imageData: haloFrame,
      width: haloFrame.width,
      height: haloFrame.height,
      included: true,
      previewUrl,
    });

    onProgress?.(0.4 + ((index + 1) / cropped.length) * 0.6);

    if (index > 0 && index % 10 === 0) {
      await nextTick();
    }
  }

  return processedFrames;
}

export function revokeFrameUrls(
  frames: Array<{ thumbnailUrl?: string; previewUrl?: string }>,
  mode: "thumbnail" | "preview" | "both" = "both",
) {
  frames.forEach((frame) => {
    if ((mode === "thumbnail" || mode === "both") && frame.thumbnailUrl) {
      URL.revokeObjectURL(frame.thumbnailUrl);
    }

    if ((mode === "preview" || mode === "both") && frame.previewUrl) {
      URL.revokeObjectURL(frame.previewUrl);
    }
  });
}
