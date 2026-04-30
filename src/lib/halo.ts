import { cloneImageData } from "@/lib/canvas";

export function erodeAlpha(imageData: ImageData, radius: number, alphaThreshold: number) {
  if (radius <= 0) {
    return cloneImageData(imageData);
  }

  const src = imageData.data;
  const output = new Uint8ClampedArray(src);
  const { width, height } = imageData;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;

      if (src[index + 3] <= alphaThreshold) {
        continue;
      }

      let nearTransparent = false;

      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nextX = x + dx;
          const nextY = y + dy;

          if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) {
            continue;
          }

          const nextIndex = (nextY * width + nextX) * 4;
          if (src[nextIndex + 3] <= alphaThreshold) {
            nearTransparent = true;
            break;
          }
        }

        if (nearTransparent) {
          break;
        }
      }

      if (nearTransparent) {
        output[index + 3] = 0;
      }
    }
  }

  return new ImageData(output, width, height);
}
