import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatSeconds(value: number) {
  if (!Number.isFinite(value)) {
    return "0.00s";
  }

  return `${value.toFixed(2)}s`;
}

export function zeroPad(value: number, length: number) {
  return value.toString().padStart(length, "0");
}

export function parseOptionalNumber(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const nextValue = Number.parseInt(value, 10);
  return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : null;
}
