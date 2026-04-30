export function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function cloneImageData(imageData: ImageData) {
  return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
}

export function imageDataToCanvas(imageData: ImageData) {
  const canvas = createCanvas(imageData.width, imageData.height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering context is unavailable.");
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}

export function canvasToImageData(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering context is unavailable.");
  }

  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png") {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode canvas output."));
        return;
      }

      resolve(blob);
    }, type);
  });
}

export async function imageDataToObjectUrl(imageData: ImageData) {
  const blob = await canvasToBlob(imageDataToCanvas(imageData));
  return URL.createObjectURL(blob);
}
