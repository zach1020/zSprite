import { ACCEPTED_VIDEO_EXTENSIONS } from "@/types/zsprite";

export function isSupportedVideoFile(file: File) {
  const lowerName = file.name.toLowerCase();
  const matchesExtension = ACCEPTED_VIDEO_EXTENSIONS.some((extension) => lowerName.endsWith(extension));

  if (matchesExtension) {
    return true;
  }

  return file.type.startsWith("video/");
}

export function createVideoElement(sourceUrl: string) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const onLoadedMetadata = () => {
      cleanup();
      resolve(video);
    };

    const onError = () => {
      cleanup();
      reject(new Error("Video failed to load."));
    };

    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.src = sourceUrl;
  });
}

export function seekVideo(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Video seek failed."));
    };

    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };

    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = time;
  });
}
