"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertTriangle, RefreshCcw, Upload } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { AnimationPreview } from "@/components/AnimationPreview";
import { ApiKeysPanel } from "@/components/ApiKeysPanel";
import { AppHeader } from "@/components/AppHeader";
import { ChromaKeyPanel } from "@/components/ChromaKeyPanel";
import { CropSizingPanel } from "@/components/CropSizingPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { FrameTimeline } from "@/components/FrameTimeline";
import { HaloRemoverPanel } from "@/components/HaloRemoverPanel";
import { StepSidebar } from "@/components/StepSidebar";
import { UploadDropzone } from "@/components/UploadDropzone";
import { VideoLoopEditor } from "@/components/VideoLoopEditor";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { downloadFramesZip, downloadSpriteSheet } from "@/lib/export-sprites";
import { estimateFrameCount } from "@/lib/frames";
import { extractFramesFromVideo, processFrames, revokeFrameUrls } from "@/lib/process-frames";
import { clamp, formatSeconds } from "@/lib/utils";
import { createVideoElement, isSupportedVideoFile } from "@/lib/video";
import { useZSpriteStore } from "@/store/use-zsprite-store";
import { STEP_DEFINITIONS } from "@/types/zsprite";

const MIN_LOOP_LENGTH = 0.1;

export function ZSpriteStudio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const latestRawFramesRef = useRef(
    useZSpriteStore.getState().rawFrames,
  );
  const latestProcessedFramesRef = useRef(
    useZSpriteStore.getState().processedFrames,
  );
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const {
    sourceVideoUrl,
    duration,
    currentVideoTime,
    loopStart,
    loopEnd,
    extractionFps,
    previewFps,
    rawFrames,
    processedFrames,
    selectedFrameIds,
    chromaKey,
    cropSettings,
    haloSettings,
    exportSettings,
    loopPreviewEnabled,
    previewBeforeAfter,
    activeStep,
    error,
    warning,
    isExtracting,
    extractionProgress,
    isProcessing,
    processingProgress,
    setVideo,
    clearWorkspace,
    setCurrentVideoTime,
    setLoopStart,
    setLoopEnd,
    setExtractionFps,
    setPreviewFps,
    setRawFrames,
    setProcessedFrames,
    toggleFrameIncluded,
    toggleFrameSelected,
    clearSelectedFrames,
    removeSelectedFrames,
    restoreAllFrames,
    setChromaKey,
    setCropSettings,
    setHaloSettings,
    setExportSettings,
    setLoopPreviewEnabled,
    setPreviewBeforeAfter,
    setActiveStep,
    setError,
    setWarning,
    setIsExtracting,
    setExtractionProgress,
    setIsProcessing,
    setProcessingProgress,
  } = useZSpriteStore(
    useShallow((state) => ({
      sourceVideoUrl: state.sourceVideoUrl,
      duration: state.duration,
      currentVideoTime: state.currentVideoTime,
      loopStart: state.loopStart,
      loopEnd: state.loopEnd,
      extractionFps: state.extractionFps,
      previewFps: state.previewFps,
      rawFrames: state.rawFrames,
      processedFrames: state.processedFrames,
      selectedFrameIds: state.selectedFrameIds,
      chromaKey: state.chromaKey,
      cropSettings: state.cropSettings,
      haloSettings: state.haloSettings,
      exportSettings: state.exportSettings,
      loopPreviewEnabled: state.loopPreviewEnabled,
      previewBeforeAfter: state.previewBeforeAfter,
      activeStep: state.activeStep,
      error: state.error,
      warning: state.warning,
      isExtracting: state.isExtracting,
      extractionProgress: state.extractionProgress,
      isProcessing: state.isProcessing,
      processingProgress: state.processingProgress,
      setVideo: state.setVideo,
      clearWorkspace: state.clearWorkspace,
      setCurrentVideoTime: state.setCurrentVideoTime,
      setLoopStart: state.setLoopStart,
      setLoopEnd: state.setLoopEnd,
      setExtractionFps: state.setExtractionFps,
      setPreviewFps: state.setPreviewFps,
      setRawFrames: state.setRawFrames,
      setProcessedFrames: state.setProcessedFrames,
      toggleFrameIncluded: state.toggleFrameIncluded,
      toggleFrameSelected: state.toggleFrameSelected,
      clearSelectedFrames: state.clearSelectedFrames,
      removeSelectedFrames: state.removeSelectedFrames,
      restoreAllFrames: state.restoreAllFrames,
      setChromaKey: state.setChromaKey,
      setCropSettings: state.setCropSettings,
      setHaloSettings: state.setHaloSettings,
      setExportSettings: state.setExportSettings,
      setLoopPreviewEnabled: state.setLoopPreviewEnabled,
      setPreviewBeforeAfter: state.setPreviewBeforeAfter,
      setActiveStep: state.setActiveStep,
      setError: state.setError,
      setWarning: state.setWarning,
      setIsExtracting: state.setIsExtracting,
      setExtractionProgress: state.setExtractionProgress,
      setIsProcessing: state.setIsProcessing,
      setProcessingProgress: state.setProcessingProgress,
    })),
  );

  const deferredRawFrames = useDeferredValue(rawFrames);
  const includedRawFrames = useMemo(
    () => rawFrames.filter((frame) => frame.included),
    [rawFrames],
  );
  const previewFrames = useMemo(() => {
    if (previewBeforeAfter === "before") {
      return includedRawFrames
        .filter((frame) => frame.thumbnailUrl)
        .map((frame) => ({
          id: frame.id,
          time: frame.time,
          width: frame.width,
          height: frame.height,
          url: frame.thumbnailUrl ?? "",
        }));
    }

    return processedFrames.map((frame) => ({
      id: frame.id,
      time: frame.time,
      width: frame.width,
      height: frame.height,
      url: frame.previewUrl,
    }));
  }, [includedRawFrames, previewBeforeAfter, processedFrames]);
  const estimatedFrames = useMemo(
    () => estimateFrameCount(loopStart, loopEnd, extractionFps),
    [extractionFps, loopEnd, loopStart],
  );
  const canExport = processedFrames.length > 0;
  const showVideoPreview = Boolean(sourceVideoUrl) && (activeStep === "loop" || previewFrames.length === 0);

  useEffect(() => {
    latestRawFramesRef.current = rawFrames;
  }, [rawFrames]);

  useEffect(() => {
    latestProcessedFramesRef.current = processedFrames;
  }, [processedFrames]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      revokeFrameUrls(latestRawFramesRef.current, "thumbnail");
      revokeFrameUrls(latestProcessedFramesRef.current, "preview");
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleTimeUpdate = () => {
      setCurrentVideoTime(video.currentTime);

      if (loopPreviewEnabled && video.currentTime >= loopEnd) {
        video.currentTime = loopStart;
        void video.play().catch(() => {
          setError("Loop preview playback was blocked by the browser.");
        });
      }
    };

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handlePause);
    };
  }, [loopEnd, loopPreviewEnabled, loopStart, setCurrentVideoTime, setError]);

  useEffect(() => {
    if (!rawFrames.length) {
      return;
    }

    let cancelled = false;

    setIsProcessing(true);
    setProcessingProgress(0);

    void (async () => {
      try {
        const nextFrames = await processFrames(
          rawFrames,
          chromaKey,
          cropSettings,
          haloSettings,
          (progress) => {
            if (!cancelled) {
              setProcessingProgress(progress);
            }
          },
        );

        if (cancelled) {
          revokeFrameUrls(nextFrames, "preview");
          return;
        }

        revokeFrameUrls(latestProcessedFramesRef.current, "preview");
        latestProcessedFramesRef.current = nextFrames;

        startTransition(() => {
          setProcessedFrames(nextFrames);
          setError(null);
        });
      } catch (processingError) {
        if (!cancelled) {
          setError(
            processingError instanceof Error
              ? processingError.message
              : "Frame processing failed.",
          );
          setProcessedFrames([]);
        }
      } finally {
        if (!cancelled) {
          setIsProcessing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    chromaKey,
    cropSettings,
    haloSettings,
    rawFrames,
    setError,
    setIsProcessing,
    setProcessedFrames,
    setProcessingProgress,
  ]);

  const updateLoopStart = (value: number) => {
    const safeValue = clamp(value, 0, Math.max(0, duration - MIN_LOOP_LENGTH));
    const nextStart = Math.min(safeValue, Math.max(0, loopEnd - MIN_LOOP_LENGTH));
    setLoopStart(nextStart);
  };

  const updateLoopEnd = (value: number) => {
    const safeValue = clamp(value, MIN_LOOP_LENGTH, Math.max(MIN_LOOP_LENGTH, duration));
    const nextEnd = Math.max(safeValue, loopStart + MIN_LOOP_LENGTH);
    setLoopEnd(Math.min(nextEnd, duration));
  };

  const handleFileUpload = async (file: File) => {
    if (!isSupportedVideoFile(file)) {
      setError("Unsupported video format. Use .mp4, .webm, or a browser-supported .mov.");
      return;
    }

    const nextUrl = URL.createObjectURL(file);

    try {
      const metadataVideo = await createVideoElement(nextUrl);
      const nextDuration = metadataVideo.duration;

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      revokeFrameUrls(rawFrames, "thumbnail");
      revokeFrameUrls(processedFrames, "preview");
      latestProcessedFramesRef.current = [];

      objectUrlRef.current = nextUrl;
      metadataVideo.pause();
      metadataVideo.removeAttribute("src");
      metadataVideo.load();

      startTransition(() => {
        setVideo(file, nextUrl, nextDuration);
        setError(null);
        setWarning(null);
      });
    } catch {
      URL.revokeObjectURL(nextUrl);
      setError("Video failed to load in this browser.");
    }
  };

  const handleClearWorkspace = () => {
    revokeFrameUrls(rawFrames, "thumbnail");
    revokeFrameUrls(processedFrames, "preview");
    latestProcessedFramesRef.current = [];

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    clearWorkspace();
  };

  const handleToggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      if (loopPreviewEnabled && (video.currentTime < loopStart || video.currentTime > loopEnd)) {
        video.currentTime = loopStart;
      }

      void video.play().catch(() => {
        setError("Video playback was blocked by the browser.");
      });
      return;
    }

    video.pause();
  };

  const handleToggleLoopPreview = () => {
    const video = videoRef.current;
    const nextValue = !loopPreviewEnabled;
    setLoopPreviewEnabled(nextValue);

    if (!video) {
      return;
    }

    if (nextValue) {
      video.currentTime = loopStart;
      void video.play().catch(() => {
        setError("Loop preview playback was blocked by the browser.");
      });
      return;
    }

    video.pause();
  };

  const handleExtractFrames = async () => {
    if (!sourceVideoUrl) {
      setError("Upload a video before extracting frames.");
      return;
    }

    if (loopEnd - loopStart < MIN_LOOP_LENGTH) {
      setError("Loop range is too short. Keep at least 0.1 seconds.");
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    setError(null);
    setWarning(
      estimatedFrames > 300
        ? `This selection will extract about ${estimatedFrames} frames. Long runs may take a while in-browser.`
        : null,
    );

    try {
      const nextFrames = await extractFramesFromVideo(
        sourceVideoUrl,
        loopStart,
        loopEnd,
        extractionFps,
        setExtractionProgress,
      );

      if (!nextFrames.length) {
        throw new Error("No frames were extracted from the selected loop.");
      }

      revokeFrameUrls(rawFrames, "thumbnail");
      revokeFrameUrls(processedFrames, "preview");
      latestProcessedFramesRef.current = [];

      startTransition(() => {
        setRawFrames(nextFrames);
        setProcessedFrames([]);
        setActiveStep("frames");
      });
    } catch (extractionError) {
      setError(
        extractionError instanceof Error
          ? extractionError.message
          : "Frame extraction failed.",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRemoveSelectedFrames = () => {
    if (!selectedFrameIds.size) {
      setError("Select one or more frames before removing them.");
      return;
    }

    removeSelectedFrames();
    setError(null);
  };

  const handleExportSheet = async () => {
    if (!processedFrames.length) {
      setError("Process at least one included frame before exporting.");
      return;
    }

    try {
      await downloadSpriteSheet(
        processedFrames,
        exportSettings.columns,
        exportSettings.filenamePrefix,
      );
      setError(null);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Sprite sheet export failed.");
    }
  };

  const handleExportZip = async () => {
    if (!processedFrames.length) {
      setError("Process at least one included frame before exporting.");
      return;
    }

    try {
      await downloadFramesZip(processedFrames, exportSettings.filenamePrefix);
      setError(null);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "ZIP export failed.");
    }
  };

  const sidebarSteps = STEP_DEFINITIONS.map((step) => {
    const disabled =
      (step.id !== "upload" && !sourceVideoUrl) ||
      ((step.id === "background" || step.id === "crop" || step.id === "halo" || step.id === "export") &&
        rawFrames.length === 0);

    const complete =
      (step.id === "upload" && Boolean(sourceVideoUrl)) ||
      (step.id === "loop" && loopEnd - loopStart >= MIN_LOOP_LENGTH) ||
      (step.id === "frames" && rawFrames.length > 0) ||
      (step.id === "background" && chromaKey.enabled) ||
      (step.id === "crop" && cropSettings.enabled) ||
      (step.id === "halo" && haloSettings.enabled) ||
      (step.id === "export" && processedFrames.length > 0);

    return {
      ...step,
      disabled,
      complete,
    };
  });

  const panelConfig = (() => {
    switch (activeStep) {
      case "upload":
        return {
          title: "Upload",
          description: "Bring in a local animation clip and replace it whenever you need.",
          content: (
            <div className="space-y-4">
              <UploadDropzone onFileSelect={handleFileUpload} compact />
              {sourceVideoUrl ? (
                <Button variant="outline" className="w-full" onClick={handleClearWorkspace}>
                  <RefreshCcw className="size-4" />
                  Clear Current Video
                </Button>
              ) : null}
            </div>
          ),
        };
      case "loop":
        return {
          title: "Loop Selection",
          description: "Set clean start and end points, then test the loop before extraction.",
          content: (
            <VideoLoopEditor
              duration={duration}
              loopStart={loopStart}
              loopEnd={loopEnd}
              currentTime={currentVideoTime}
              isLoopPreviewActive={loopPreviewEnabled}
              isVideoPlaying={isVideoPlaying}
              onLoopStartChange={updateLoopStart}
              onLoopEndChange={updateLoopEnd}
              onSetStartToCurrent={() => updateLoopStart(currentVideoTime)}
              onSetEndToCurrent={() => updateLoopEnd(currentVideoTime)}
              onTogglePlayback={handleToggleVideoPlayback}
              onToggleLoopPreview={handleToggleLoopPreview}
            />
          ),
        };
      case "frames":
        return {
          title: "Frame Extraction",
          description: "Extract a loop at your chosen FPS, then remove duplicate or bad frames.",
          content: (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Extraction FPS</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={extractionFps}
                    className="h-11 w-full rounded-xl border border-[color:var(--border)] bg-white/6 px-3 text-sm text-white outline-none focus:border-[color:var(--accent)]"
                    onChange={(event) =>
                      setExtractionFps(Math.max(1, Number.parseInt(event.target.value || "1", 10)))
                    }
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Preview FPS</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={previewFps}
                    className="h-11 w-full rounded-xl border border-[color:var(--border)] bg-white/6 px-3 text-sm text-white outline-none focus:border-[color:var(--accent)]"
                    onChange={(event) =>
                      setPreviewFps(Math.max(1, Number.parseInt(event.target.value || "1", 10)))
                    }
                  />
                </label>
              </div>

              <Button className="w-full" onClick={handleExtractFrames} disabled={isExtracting || !sourceVideoUrl}>
                <Upload className="size-4" />
                {isExtracting ? "Extracting Frames..." : "Extract Frames"}
              </Button>

              {isExtracting ? <Progress value={extractionProgress} /> : null}

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                Estimated frames: <span className="font-mono text-white">{estimatedFrames}</span>
              </div>

              <div className="grid gap-3">
                <Button variant="secondary" onClick={handleRemoveSelectedFrames} disabled={!selectedFrameIds.size}>
                  Remove Selected Frames
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    restoreAllFrames();
                    clearSelectedFrames();
                  }}
                  disabled={!rawFrames.length}
                >
                  Restore All Frames
                </Button>
              </div>
            </div>
          ),
        };
      case "background":
        return {
          title: "Background Removal",
          description: "Key out common studio colors and compare before/after output.",
          content: (
            <ChromaKeyPanel
              settings={chromaKey}
              previewMode={previewBeforeAfter}
              onChange={setChromaKey}
              onPreviewModeChange={setPreviewBeforeAfter}
            />
          ),
        };
      case "crop":
        return {
          title: "Crop and Size",
          description: "Generate a stable sprite box across the whole animation.",
          content: <CropSizingPanel settings={cropSettings} onChange={setCropSettings} />,
        };
      case "halo":
        return {
          title: "Halo Cleanup",
          description: "Erode edge pixels when chroma residue is still visible.",
          content: <HaloRemoverPanel settings={haloSettings} onChange={setHaloSettings} />,
        };
      case "export":
        return {
          title: "Export",
          description: "Download a sprite sheet PNG or a ZIP of transparent frame PNGs.",
          content: (
            <ExportPanel
              frames={processedFrames}
              settings={exportSettings}
              isBusy={isProcessing}
              onChange={setExportSettings}
              onExportSheet={handleExportSheet}
              onExportZip={handleExportZip}
            />
          ),
        };
      default:
        return {
          title: "Upload",
          description: "Bring in a clip to begin.",
          content: <UploadDropzone onFileSelect={handleFileUpload} compact />,
        };
    }
  })();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <AppHeader
          frameCount={processedFrames.length}
          canExport={canExport}
          onExportSheet={handleExportSheet}
          onExportZip={handleExportZip}
          isBusy={isExtracting || isProcessing}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_390px]">
          <section className="flex min-h-[43rem] flex-col gap-6">
            {!sourceVideoUrl ? (
              <UploadDropzone onFileSelect={handleFileUpload} />
            ) : showVideoPreview ? (
              <div className="panel-surface flex min-h-[29rem] flex-col overflow-hidden rounded-[1.8rem]">
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.26em] text-slate-500">Source Video</div>
                    <div className="mt-1 text-sm text-slate-300">
                      Select a loop, then extract frames for processing.
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
                    {formatSeconds(duration)}
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-center p-5">
                  <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/80">
                    <video
                      ref={videoRef}
                      src={sourceVideoUrl}
                      className="h-full w-full object-contain"
                      playsInline
                      muted
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-5 py-4 text-sm text-slate-400">
                  <div>Current time: {formatSeconds(currentVideoTime)}</div>
                  <div>Loop: {formatSeconds(loopStart)} to {formatSeconds(loopEnd)}</div>
                  <div>Estimated extraction: {estimatedFrames} frames</div>
                </div>
              </div>
            ) : previewFrames.length > 0 ? (
              <AnimationPreview
                frames={previewFrames}
                fps={previewFps}
                title={previewBeforeAfter === "before" ? "Raw Frame Preview" : "Processed Sprite Preview"}
                subtitle={
                  previewBeforeAfter === "before"
                    ? "Source frames before chroma, crop, and halo cleanup."
                    : "Final animation preview after the processing pipeline."
                }
                isBusy={isProcessing}
              />
            ) : (
              <AnimationPreview
                frames={[]}
                fps={previewFps}
                title="Processed Sprite Preview"
                subtitle="Extract frames to start the sprite pipeline."
              />
            )}

            {error ? (
              <div className="rounded-[1.5rem] border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-5 py-4 text-sm text-rose-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                  <div>{error}</div>
                </div>
              </div>
            ) : null}

            {warning ? (
              <div className="rounded-[1.5rem] border border-[color:var(--warning)]/35 bg-[color:var(--warning)]/10 px-5 py-4 text-sm text-amber-100">
                {warning}
              </div>
            ) : null}

            {isProcessing ? <Progress value={processingProgress} /> : null}

            <FrameTimeline
              frames={deferredRawFrames}
              selectedIds={selectedFrameIds}
              onToggleSelected={toggleFrameSelected}
              onToggleIncluded={toggleFrameIncluded}
            />
          </section>

          <StepSidebar
            steps={sidebarSteps}
            activeStep={activeStep}
            onStepChange={setActiveStep}
            panelTitle={panelConfig.title}
            panelDescription={panelConfig.description}
            panelContent={panelConfig.content}
            apiKeysPanel={<ApiKeysPanel />}
          />
        </div>
      </div>
    </div>
  );
}
