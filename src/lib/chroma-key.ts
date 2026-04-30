import { cloneImageData } from "@/lib/canvas";
import { colorDistance, getKeyColorRgb, reduceSpill } from "@/lib/color";
import { clamp } from "@/lib/utils";
import type { ChromaKeySettings } from "@/types/zsprite";

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

    const distance = colorDistance(rgb, keyColor);
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
