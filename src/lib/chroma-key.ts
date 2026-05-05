import { cloneImageData } from "@/lib/canvas";
import { chromaKeyDistance, getKeyColorRgb, reduceSpill } from "@/lib/color";
import { clamp } from "@/lib/utils";
import type { ChromaKeySettings, RGB } from "@/types/zsprite";

export function applyChromaKey(imageData: ImageData, settings: ChromaKeySettings) {
  const output = cloneImageData(imageData);

  if (!settings.enabled) {
    return output;
  }

  const { data } = output;
  const keyColor = getKeyColorRgb(settings);
  const tolerance = clamp(settings.tolerance, 0, 255);
  const softness = clamp(settings.softness, 0, 255);
  const spillSuppression = clamp(settings.spillSuppression, 0, 100) / 100;
  const fadeLimit = tolerance + softness;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];

    if (alpha === 0) {
      continue;
    }

    const rgb = {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    };

    const distance = chromaKeyDistance(rgb, keyColor);
    let nextAlpha = alpha;

    if (distance <= tolerance) {
      nextAlpha = 0;
    } else if (softness > 0 && distance <= fadeLimit) {
      const factor = (distance - tolerance) / softness;
      nextAlpha = Math.round(alpha * factor);
    }

    data[index + 3] = nextAlpha;

    if (spillSuppression > 0 && fadeLimit > 0) {
      const spillBlend = spillSuppression * Math.max(0, 1 - distance / fadeLimit);
      const reduced = reduceSpill(rgb, keyColor, spillBlend);
      data[index] = reduced.r;
      data[index + 1] = reduced.g;
      data[index + 2] = reduced.b;
    }
  }

  return output;
}

export function sampleBackgroundColor(imageData: ImageData): RGB {
  const { data, width, height } = imageData;
  const sampleSize = Math.max(1, Math.min(24, width, height, Math.max(4, Math.floor(Math.min(width, height) * 0.08))));
  const patches = [
    { x: 0, y: 0 },
    { x: width - sampleSize, y: 0 },
    { x: 0, y: height - sampleSize },
    { x: width - sampleSize, y: height - sampleSize },
  ];
  const samples: RGB[] = [];

  for (const patch of patches) {
    const startX = clamp(patch.x, 0, Math.max(0, width - sampleSize));
    const startY = clamp(patch.y, 0, Math.max(0, height - sampleSize));

    for (let y = startY; y < startY + sampleSize; y += 1) {
      for (let x = startX; x < startX + sampleSize; x += 1) {
        const index = (y * width + x) * 4;

        if (data[index + 3] === 0) {
          continue;
        }

        samples.push({
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
        });
      }
    }
  }

  if (!samples.length) {
    return { r: 0, g: 255, b: 0 };
  }

  const median = (channel: keyof RGB) => {
    const values = samples.map((sample) => sample[channel]).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  };

  return {
    r: median("r"),
    g: median("g"),
    b: median("b"),
  };
}
