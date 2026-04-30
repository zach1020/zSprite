import { canvasToImageData, createCanvas } from "@/lib/canvas";
import { clamp } from "@/lib/utils";
import type { Bounds, CropSettings } from "@/types/zsprite";

const DEFAULT_ALPHA_THRESHOLD = 8;

export function getAlphaBounds(imageData: ImageData, alphaThreshold = DEFAULT_ALPHA_THRESHOLD) {
  let minX = imageData.width;
  let minY = imageData.height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < imageData.height; y += 1) {
    for (let x = 0; x < imageData.width; x += 1) {
      const index = (y * imageData.width + x) * 4;
      const alpha = imageData.data[index + 3];

      if (alpha > alphaThreshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        found = true;
      }
    }
  }

  if (!found) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

export function mergeBounds(boundsList: Bounds[]): Bounds {
  return {
    minX: Math.min(...boundsList.map((bounds) => bounds.minX)),
    minY: Math.min(...boundsList.map((bounds) => bounds.minY)),
    maxX: Math.max(...boundsList.map((bounds) => bounds.maxX)),
    maxY: Math.max(...boundsList.map((bounds) => bounds.maxY)),
  };
}

function resolveOutputDimensions(sourceWidth: number, sourceHeight: number, settings: CropSettings) {
  let targetWidth = settings.outputWidth ?? null;
  let targetHeight = settings.outputHeight ?? null;
  const aspectRatio = sourceWidth / Math.max(1, sourceHeight);

  if (settings.lockAspectRatio) {
    if (targetWidth && !targetHeight) {
      targetHeight = Math.max(1, Math.round(targetWidth / aspectRatio));
    }

    if (targetHeight && !targetWidth) {
      targetWidth = Math.max(1, Math.round(targetHeight * aspectRatio));
    }
  }

  return {
    width: Math.max(1, targetWidth ?? sourceWidth),
    height: Math.max(1, targetHeight ?? sourceHeight),
  };
}

export function applyGlobalCrop(
  frames: ImageData[],
  settings: CropSettings,
  alphaThreshold = DEFAULT_ALPHA_THRESHOLD,
) {
  if (!frames.length || !settings.enabled) {
    return {
      frames,
      bounds: null,
      outputWidth: frames[0]?.width ?? 0,
      outputHeight: frames[0]?.height ?? 0,
      scale: 1,
    };
  }

  const boundsList = frames
    .map((frame) => getAlphaBounds(frame, alphaThreshold))
    .filter((bounds): bounds is Bounds => bounds !== null);

  if (!boundsList.length) {
    return {
      frames,
      bounds: null,
      outputWidth: frames[0]?.width ?? 0,
      outputHeight: frames[0]?.height ?? 0,
      scale: 1,
    };
  }

  const bounds = mergeBounds(boundsList);
  const padding = clamp(settings.padding, 0, 256);
  const sourceWidth = bounds.maxX - bounds.minX + 1 + padding * 2;
  const sourceHeight = bounds.maxY - bounds.minY + 1 + padding * 2;
  const { width: outputWidth, height: outputHeight } = resolveOutputDimensions(
    sourceWidth,
    sourceHeight,
    settings,
  );
  const scale = settings.reduceToFit
    ? Math.min(1, outputWidth / sourceWidth, outputHeight / sourceHeight)
    : 1;
  const contentWidth = Math.max(1, Math.round(sourceWidth * scale));
  const contentHeight = Math.max(1, Math.round(sourceHeight * scale));
  const destX = Math.round((outputWidth - contentWidth) / 2);
  const destY =
    settings.alignment === "bottom-center"
      ? outputHeight - contentHeight
      : Math.round((outputHeight - contentHeight) / 2);

  const nextFrames = frames.map((frame) => {
    const contentCanvas = createCanvas(sourceWidth, sourceHeight);
    const contentContext = contentCanvas.getContext("2d");

    if (!contentContext) {
      throw new Error("Canvas rendering context is unavailable.");
    }

    contentContext.putImageData(frame, padding - bounds.minX, padding - bounds.minY);

    const outputCanvas = createCanvas(outputWidth, outputHeight);
    const outputContext = outputCanvas.getContext("2d");

    if (!outputContext) {
      throw new Error("Canvas rendering context is unavailable.");
    }

    outputContext.imageSmoothingEnabled = true;
    outputContext.clearRect(0, 0, outputWidth, outputHeight);
    outputContext.drawImage(contentCanvas, destX, destY, contentWidth, contentHeight);

    return canvasToImageData(outputCanvas);
  });

  return {
    frames: nextFrames,
    bounds,
    outputWidth,
    outputHeight,
    scale,
  };
}
