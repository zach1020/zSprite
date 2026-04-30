import { clamp } from "@/lib/utils";
import type { ChromaKeySettings, RGB } from "@/types/zsprite";

export const KEY_COLORS: Record<Exclude<ChromaKeySettings["keyColor"], "custom">, RGB> = {
  green: { r: 0, g: 255, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  black: { r: 0, g: 0, b: 0 },
};

export function hexToRgb(value: string): RGB {
  const sanitized = value.replace("#", "").trim();
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : sanitized.padEnd(6, "0").slice(0, 6);

  const intValue = Number.parseInt(normalized, 16);

  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255,
  };
}

export function getKeyColorRgb(settings: ChromaKeySettings) {
  if (settings.keyColor === "custom") {
    return hexToRgb(settings.customColor);
  }

  return KEY_COLORS[settings.keyColor];
}

export function colorDistance(a: RGB, b: RGB) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function dominantChannel(color: RGB): "r" | "g" | "b" {
  if (color.g >= color.r && color.g >= color.b) {
    return "g";
  }

  if (color.b >= color.r && color.b >= color.g) {
    return "b";
  }

  return "r";
}

export function reduceSpill(
  rgb: RGB,
  keyColor: RGB,
  strength: number,
): RGB {
  const amount = clamp(strength, 0, 1);
  const channel = dominantChannel(keyColor);

  if (channel === "g") {
    const target = (rgb.r + rgb.b) / 2;
    return {
      r: rgb.r,
      g: Math.round(rgb.g - (rgb.g - target) * amount),
      b: rgb.b,
    };
  }

  if (channel === "b") {
    const target = (rgb.r + rgb.g) / 2;
    return {
      r: rgb.r,
      g: rgb.g,
      b: Math.round(rgb.b - (rgb.b - target) * amount),
    };
  }

  const target = (rgb.g + rgb.b) / 2;
  return {
    r: Math.round(rgb.r - (rgb.r - target) * amount),
    g: rgb.g,
    b: rgb.b,
  };
}
