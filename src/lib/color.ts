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

export function rgbToHex(rgb: RGB) {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToHsv(rgb: RGB) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;

  if (delta > 0) {
    if (max === r) {
      hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      hue = 60 * ((b - r) / delta + 2);
    } else {
      hue = 60 * ((r - g) / delta + 4);
    }
  }

  return {
    h: hue < 0 ? hue + 360 : hue,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
}

function luminance(rgb: RGB) {
  return rgb.r * 0.2126 + rgb.g * 0.7152 + rgb.b * 0.0722;
}

export function chromaKeyDistance(rgb: RGB, keyColor: RGB) {
  if (luminance(keyColor) < 18) {
    return luminance(rgb);
  }

  const rgbDistance = colorDistance(rgb, keyColor);
  const hsv = rgbToHsv(rgb);
  const keyHsv = rgbToHsv(keyColor);
  const hueDistance = Math.min(Math.abs(hsv.h - keyHsv.h), 360 - Math.abs(hsv.h - keyHsv.h));
  const chromaDistance =
    (hueDistance / 180) * 255 +
    Math.abs(hsv.s - keyHsv.s) * 120 +
    Math.abs(hsv.v - keyHsv.v) * 45;

  return Math.min(rgbDistance, chromaDistance);
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
