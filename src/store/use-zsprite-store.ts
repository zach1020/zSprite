import { create } from "zustand";

import {
  DEFAULT_CHROMA_KEY_SETTINGS,
  DEFAULT_CROP_SETTINGS,
  DEFAULT_EXPORT_SETTINGS,
  DEFAULT_HALO_SETTINGS,
  type ChromaKeySettings,
  type CropSettings,
  type ExportSettings,
  type ExtractedFrame,
  type HaloSettings,
  type ProcessedFrame,
  type WorkflowStep,
} from "@/types/zsprite";

type ZSpriteState = {
  sourceVideoUrl: string | null;
  videoFile: File | null;
  duration: number;
  currentVideoTime: number;
  loopStart: number;
  loopEnd: number;
  extractionFps: number;
  previewFps: number;
  rawFrames: ExtractedFrame[];
  processedFrames: ProcessedFrame[];
  removedFrameIds: Set<string>;
  selectedFrameIds: Set<string>;
  chromaKey: ChromaKeySettings;
  cropSettings: CropSettings;
  haloSettings: HaloSettings;
  exportSettings: ExportSettings;
  loopPreviewEnabled: boolean;
  previewBeforeAfter: "before" | "after";
  activeStep: WorkflowStep;
  error: string | null;
  warning: string | null;
  isExtracting: boolean;
  extractionProgress: number;
  isProcessing: boolean;
  processingProgress: number;
  setVideo: (file: File, sourceVideoUrl: string, duration: number) => void;
  clearWorkspace: () => void;
  setCurrentVideoTime: (value: number) => void;
  setLoopStart: (value: number) => void;
  setLoopEnd: (value: number) => void;
  setExtractionFps: (value: number) => void;
  setPreviewFps: (value: number) => void;
  setRawFrames: (frames: ExtractedFrame[]) => void;
  setProcessedFrames: (frames: ProcessedFrame[]) => void;
  toggleFrameIncluded: (id: string) => void;
  toggleFrameSelected: (id: string) => void;
  clearSelectedFrames: () => void;
  removeSelectedFrames: () => void;
  restoreAllFrames: () => void;
  setChromaKey: (partial: Partial<ChromaKeySettings>) => void;
  setCropSettings: (partial: Partial<CropSettings>) => void;
  setHaloSettings: (partial: Partial<HaloSettings>) => void;
  setExportSettings: (partial: Partial<ExportSettings>) => void;
  setLoopPreviewEnabled: (value: boolean) => void;
  setPreviewBeforeAfter: (value: "before" | "after") => void;
  setActiveStep: (step: WorkflowStep) => void;
  setError: (value: string | null) => void;
  setWarning: (value: string | null) => void;
  setIsExtracting: (value: boolean) => void;
  setExtractionProgress: (value: number) => void;
  setIsProcessing: (value: boolean) => void;
  setProcessingProgress: (value: number) => void;
};

const initialState = {
  sourceVideoUrl: null,
  videoFile: null,
  duration: 0,
  currentVideoTime: 0,
  loopStart: 0,
  loopEnd: 3,
  extractionFps: 12,
  previewFps: 12,
  rawFrames: [] as ExtractedFrame[],
  processedFrames: [] as ProcessedFrame[],
  removedFrameIds: new Set<string>(),
  selectedFrameIds: new Set<string>(),
  chromaKey: DEFAULT_CHROMA_KEY_SETTINGS,
  cropSettings: DEFAULT_CROP_SETTINGS,
  haloSettings: DEFAULT_HALO_SETTINGS,
  exportSettings: DEFAULT_EXPORT_SETTINGS,
  loopPreviewEnabled: false,
  previewBeforeAfter: "after" as const,
  activeStep: "upload" as WorkflowStep,
  error: null as string | null,
  warning: null as string | null,
  isExtracting: false,
  extractionProgress: 0,
  isProcessing: false,
  processingProgress: 0,
};

export const useZSpriteStore = create<ZSpriteState>((set) => ({
  ...initialState,
  setVideo: (file, sourceVideoUrl, duration) =>
    set({
      videoFile: file,
      sourceVideoUrl,
      duration,
      currentVideoTime: 0,
      loopStart: 0,
      loopEnd: Math.min(duration, 3),
      rawFrames: [],
      processedFrames: [],
      removedFrameIds: new Set(),
      selectedFrameIds: new Set(),
      loopPreviewEnabled: false,
      activeStep: "loop",
      error: null,
      warning: null,
      extractionProgress: 0,
      processingProgress: 0,
    }),
  clearWorkspace: () =>
    set({
      ...initialState,
    }),
  setCurrentVideoTime: (value) =>
    set({
      currentVideoTime: value,
    }),
  setLoopStart: (value) =>
    set({
      loopStart: value,
    }),
  setLoopEnd: (value) =>
    set({
      loopEnd: value,
    }),
  setExtractionFps: (value) =>
    set({
      extractionFps: value,
    }),
  setPreviewFps: (value) =>
    set({
      previewFps: value,
    }),
  setRawFrames: (frames) =>
    set({
      rawFrames: frames,
      removedFrameIds: new Set(frames.filter((frame) => !frame.included).map((frame) => frame.id)),
      selectedFrameIds: new Set(),
      activeStep: "frames",
      error: null,
      warning: null,
      extractionProgress: 1,
    }),
  setProcessedFrames: (frames) =>
    set({
      processedFrames: frames,
      processingProgress: frames.length > 0 ? 1 : 0,
    }),
  toggleFrameIncluded: (id) =>
    set((state) => {
      const rawFrames = state.rawFrames.map((frame) =>
        frame.id === id ? { ...frame, included: !frame.included } : frame,
      );
      return {
        rawFrames,
        removedFrameIds: new Set(rawFrames.filter((frame) => !frame.included).map((frame) => frame.id)),
      };
    }),
  toggleFrameSelected: (id) =>
    set((state) => {
      const selectedFrameIds = new Set(state.selectedFrameIds);
      if (selectedFrameIds.has(id)) {
        selectedFrameIds.delete(id);
      } else {
        selectedFrameIds.add(id);
      }
      return {
        selectedFrameIds,
      };
    }),
  clearSelectedFrames: () =>
    set({
      selectedFrameIds: new Set(),
    }),
  removeSelectedFrames: () =>
    set((state) => {
      const rawFrames = state.rawFrames.map((frame) =>
        state.selectedFrameIds.has(frame.id) ? { ...frame, included: false } : frame,
      );
      return {
        rawFrames,
        removedFrameIds: new Set(rawFrames.filter((frame) => !frame.included).map((frame) => frame.id)),
        selectedFrameIds: new Set(),
      };
    }),
  restoreAllFrames: () =>
    set((state) => ({
      rawFrames: state.rawFrames.map((frame) => ({
        ...frame,
        included: true,
      })),
      removedFrameIds: new Set(),
      selectedFrameIds: new Set(),
    })),
  setChromaKey: (partial) =>
    set((state) => ({
      chromaKey: {
        ...state.chromaKey,
        ...partial,
      },
      activeStep: "background",
    })),
  setCropSettings: (partial) =>
    set((state) => ({
      cropSettings: {
        ...state.cropSettings,
        ...partial,
      },
      activeStep: "crop",
    })),
  setHaloSettings: (partial) =>
    set((state) => ({
      haloSettings: {
        ...state.haloSettings,
        ...partial,
      },
      activeStep: "halo",
    })),
  setExportSettings: (partial) =>
    set((state) => ({
      exportSettings: {
        ...state.exportSettings,
        ...partial,
      },
      activeStep: "export",
    })),
  setLoopPreviewEnabled: (value) =>
    set({
      loopPreviewEnabled: value,
    }),
  setPreviewBeforeAfter: (value) =>
    set({
      previewBeforeAfter: value,
    }),
  setActiveStep: (step) =>
    set({
      activeStep: step,
    }),
  setError: (value) =>
    set({
      error: value,
    }),
  setWarning: (value) =>
    set({
      warning: value,
    }),
  setIsExtracting: (value) =>
    set({
      isExtracting: value,
      extractionProgress: value ? 0 : 1,
    }),
  setExtractionProgress: (value) =>
    set({
      extractionProgress: value,
    }),
  setIsProcessing: (value) =>
    set({
      isProcessing: value,
      processingProgress: value ? 0 : 1,
    }),
  setProcessingProgress: (value) =>
    set({
      processingProgress: value,
    }),
}));
