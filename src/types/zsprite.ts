export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type ExtractedFrame = {
  id: string;
  index: number;
  time: number;
  imageData: ImageData;
  width: number;
  height: number;
  included: boolean;
  thumbnailUrl?: string;
};

export type ProcessedFrame = {
  id: string;
  index: number;
  time: number;
  imageData: ImageData;
  width: number;
  height: number;
  included: true;
  previewUrl: string;
};

export type ChromaKeyColor = "green" | "blue" | "black" | "custom";

export type ChromaKeySettings = {
  enabled: boolean;
  keyColor: ChromaKeyColor;
  customColor: string;
  tolerance: number;
  softness: number;
  spillSuppression: number;
};

export type CropSettings = {
  enabled: boolean;
  padding: number;
  outputWidth: number | null;
  outputHeight: number | null;
  lockAspectRatio: boolean;
  reduceToFit: boolean;
  alignment: "center" | "bottom-center";
};

export type HaloSettings = {
  enabled: boolean;
  erosionPixels: number;
  alphaThreshold: number;
};

export type ExportSettings = {
  format: "spritesheet" | "zip";
  columns: number;
  filenamePrefix: string;
};

export type WorkflowStep =
  | "upload"
  | "loop"
  | "frames"
  | "background"
  | "crop"
  | "halo"
  | "export";

export type ServiceApiKey = {
  id: string;
  name: string;
  apiKey: string;
};

export type StepDefinition = {
  id: WorkflowStep;
  label: string;
  description: string;
};

export const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

export const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: "upload",
    label: "Upload",
    description: "Bring in a short animation clip.",
  },
  {
    id: "loop",
    label: "Loop",
    description: "Pick the cleanest seamless segment.",
  },
  {
    id: "frames",
    label: "Frames",
    description: "Extract, preview, and remove bad frames.",
  },
  {
    id: "background",
    label: "Key",
    description: "Remove the background using chroma keying.",
  },
  {
    id: "crop",
    label: "Crop",
    description: "Lock consistent bounds across the whole loop.",
  },
  {
    id: "halo",
    label: "Halo",
    description: "Trim chroma edge artifacts on the alpha mask.",
  },
  {
    id: "export",
    label: "Export",
    description: "Download a sprite sheet or PNG ZIP.",
  },
];

export const DEFAULT_CHROMA_KEY_SETTINGS: ChromaKeySettings = {
  enabled: true,
  keyColor: "green",
  customColor: "#00ff00",
  tolerance: 78,
  softness: 42,
  spillSuppression: 28,
};

export const DEFAULT_CROP_SETTINGS: CropSettings = {
  enabled: true,
  padding: 20,
  outputWidth: null,
  outputHeight: null,
  lockAspectRatio: true,
  reduceToFit: true,
  alignment: "bottom-center",
};

export const DEFAULT_HALO_SETTINGS: HaloSettings = {
  enabled: false,
  erosionPixels: 1,
  alphaThreshold: 18,
};

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: "spritesheet",
  columns: 6,
  filenamePrefix: "zsprite",
};

export const DEFAULT_API_SERVICES: ServiceApiKey[] = [
  { id: "openai", name: "OpenAI", apiKey: "" },
  { id: "runway", name: "Runway", apiKey: "" },
  { id: "pika", name: "Pika", apiKey: "" },
  { id: "luma", name: "Luma", apiKey: "" },
  { id: "kling", name: "Kling", apiKey: "" },
];
