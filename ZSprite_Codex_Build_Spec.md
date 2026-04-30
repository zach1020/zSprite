# ZSprite — Codex Build Spec

## Project Summary

Build **ZSprite**, a web app for converting AI-generated character animation videos into game-ready 2D sprites. The app should let users upload a short video, select a seamless loop, extract and edit frames, remove backgrounds with chroma keying, auto-crop and size the character consistently, clean up edge artifacts, preview the animation, and export either a sprite sheet or individual PNG frames in a ZIP.

The target user is an indie game developer or artist who generates character animations with AI video tools and wants to convert those animations into usable 2D game assets quickly.

## Working Product Name

**ZSprite**

Avoid using the original product name or branding in the UI or codebase.

---

## Core User Flow

1. User opens the ZSprite web app.
2. User uploads a short character animation video.
3. App loads the video into a timeline/preview view.
4. User selects the start and end points for the best loop.
5. App extracts frames from the selected segment.
6. User previews the animation at a chosen FPS.
7. User removes bad or duplicate frames.
8. User applies chroma key background removal.
9. User runs auto-crop and sizing.
10. User optionally applies halo/edge cleanup.
11. User previews the finished sprite animation.
12. User exports either:
    - a single sprite sheet PNG, or
    - a ZIP containing individual transparent PNG frames.

---

## Recommended Tech Stack

Use a modern browser-first architecture so most processing happens client-side.

### Frontend

- **Next.js** with App Router
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for interface primitives
- **lucide-react** for icons

### Client-Side Processing

- **HTMLVideoElement** for loading and seeking video
- **Canvas API** for frame extraction, pixel processing, cropping, compositing, and sprite sheet generation
- **JSZip** for exporting frame ZIP files
- Optional: **ffmpeg.wasm** only if native video frame extraction becomes too limited

Start with Canvas/HTMLVideoElement before reaching for ffmpeg.wasm. The MVP should not require a backend.

### State Management

Use React state or Zustand. Zustand is recommended once the app has many controls.

Suggested store sections:

```ts
type ZSpriteState = {
  sourceVideoUrl: string | null;
  videoFile: File | null;
  duration: number;
  loopStart: number;
  loopEnd: number;
  extractionFps: number;
  previewFps: number;
  rawFrames: ExtractedFrame[];
  activeFrames: ExtractedFrame[];
  removedFrameIds: Set<string>;
  chromaKey: ChromaKeySettings;
  cropSettings: CropSettings;
  haloSettings: HaloSettings;
  exportSettings: ExportSettings;
};
```

---

## Data Models

```ts
export type ExtractedFrame = {
  id: string;
  index: number;
  time: number;
  imageData: ImageData;
  width: number;
  height: number;
  included: boolean;
  processedBlobUrl?: string;
};

export type ChromaKeyColor = 'green' | 'blue' | 'black' | 'custom';

export type ChromaKeySettings = {
  enabled: boolean;
  keyColor: ChromaKeyColor;
  customColor: string; // hex
  tolerance: number; // 0-255
  softness: number; // 0-255
  spillSuppression: number; // 0-100
};

export type CropSettings = {
  enabled: boolean;
  padding: number;
  outputWidth: number | null;
  outputHeight: number | null;
  lockAspectRatio: boolean;
  reduceToFit: boolean;
  alignment: 'center' | 'bottom-center';
};

export type HaloSettings = {
  enabled: boolean;
  erosionPixels: number; // number of edge pixels to remove
  alphaThreshold: number; // 0-255
};

export type ExportSettings = {
  format: 'spritesheet' | 'zip';
  columns: number;
  filenamePrefix: string;
};
```

---

## Application Pages

### `/`

Single-page workflow. Use a left-to-right or top-to-bottom stepper interface.

Suggested sections:

1. Upload
2. Loop Selection
3. Frame Extraction
4. Background Removal
5. Crop & Size
6. Halo Cleanup
7. Export

---

## UI Requirements

### General Layout

Create a polished creative-tool interface, not a generic form.

Recommended layout:

- Header: app name, short tagline, export button when frames exist
- Main workspace: large preview canvas/video panel
- Right sidebar: controls for the current step
- Bottom strip: frame timeline/thumbnails

### Header

Display:

- `ZSprite`
- Tagline: `Turn AI animation videos into game-ready 2D sprites.`

### Empty State

When no video is uploaded, show a drag-and-drop upload panel.

Accepted formats:

- `.mp4`
- `.webm`
- `.mov` if browser supports it

Show copy:

> Upload a short character animation video to start building a sprite sheet.

### Timeline / Loop Selection UI

Users need to select loop start and end times precisely.

Required controls:

- Video preview
- Play/pause button
- Current time display
- Loop start input
- Loop end input
- “Set start to current time” button
- “Set end to current time” button
- Range slider if practical
- Loop preview button

Implementation note:

When loop preview is active, the video should play from `loopStart` to `loopEnd`, then jump back to `loopStart`.

### Frame Extraction UI

Required controls:

- Extraction FPS selector/input
- “Extract frames” button
- Preview FPS selector/input
- Play/pause extracted animation preview
- Thumbnail strip of extracted frames
- Toggle/remove button per frame
- “Remove selected frames” or “Restore all frames”

Frame thumbnails should visually indicate whether a frame is included or removed.

### Chroma Key UI

Required controls:

- Enable/disable background removal
- Preset key colors:
  - Green
  - Blue
  - Black
  - Custom
- Tolerance slider
- Softness slider
- Spill suppression slider
- Preview before/after toggle

### Auto-Crop & Sizing UI

Required controls:

- Enable auto-crop
- Padding slider
- Output width input
- Output height input
- Lock aspect ratio toggle
- Alignment selector:
  - Center
  - Bottom-center
- Reduce-to-fit toggle

Important behavior:

Auto-crop should calculate a consistent bounding box across all included frames, not a different crop per frame. This prevents sprite jitter.

### Halo Remover UI

Required controls:

- Enable halo remover
- Edge erosion pixels slider
- Alpha threshold slider
- Preview before/after toggle

Explain in UI copy:

> Removes colored edge artifacts left behind after chroma keying.

### Export UI

Required export modes:

1. Sprite sheet PNG
2. ZIP of individual PNG frames

Sprite sheet settings:

- Columns input
- Preview sprite sheet dimensions
- Download button

ZIP settings:

- Filename prefix input
- Download ZIP button

---

## Core Processing Pipeline

The processing pipeline should be deterministic and composable.

Recommended order:

1. Extract raw frames from video segment.
2. Apply frame inclusion/exclusion.
3. Apply chroma key to each included frame.
4. Calculate global character bounds across all included frames.
5. Generate consistently sized cropped frames.
6. Apply reduce-to-fit if any frame exceeds target output bounds.
7. Apply halo remover.
8. Generate preview/export assets.

---

## Feature 1: Video Upload

### Requirements

- User can upload one video file.
- App creates a local object URL.
- App loads metadata and stores duration.
- App sets default loop start to `0`.
- App sets default loop end to `min(duration, 3)`.

### Acceptance Criteria

- Uploading a valid video shows it in the preview player.
- Duration is displayed correctly.
- Invalid files show a clear error.

---

## Feature 2: Loop Selection

### Requirements

- User can set precise loop start/end times.
- User can preview only the selected loop.
- Loop start must be less than loop end.
- Minimum loop length should be 0.1 seconds.

### Acceptance Criteria

- Loop preview repeats between selected boundaries.
- Invalid loop ranges are prevented or clearly marked.

---

## Feature 3: Frame Extraction

### Requirements

Extract frames from the selected loop range at the selected extraction FPS.

Pseudo-code:

```ts
async function extractFrames(video: HTMLVideoElement, start: number, end: number, fps: number) {
  const frames: ExtractedFrame[] = [];
  const interval = 1 / fps;
  let index = 0;

  for (let t = start; t <= end; t += interval) {
    await seekVideo(video, t);
    const imageData = drawVideoToImageData(video);
    frames.push({
      id: crypto.randomUUID(),
      index,
      time: t,
      imageData,
      width: imageData.width,
      height: imageData.height,
      included: true,
    });
    index++;
  }

  return frames;
}
```

Video seeking helper:

```ts
function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };

    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}
```

### Acceptance Criteria

- User can extract frames from selected loop.
- Extracted frames appear in a thumbnail strip.
- User can preview extracted animation at a custom FPS.
- User can remove and restore frames.

---

## Feature 4: Chroma Keying

### Requirements

Implement chroma keying using pixel-level Canvas ImageData processing.

For each pixel:

1. Compare RGB distance from selected key color.
2. If distance is below tolerance, set alpha to 0.
3. If within tolerance + softness, partially reduce alpha.
4. Apply spill suppression to pixels near the edge if enabled.

Suggested key colors:

```ts
const KEY_COLORS = {
  green: { r: 0, g: 255, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  black: { r: 0, g: 0, b: 0 },
};
```

Distance function:

```ts
function colorDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}
```

Alpha logic:

```ts
if (distance <= tolerance) {
  alpha = 0;
} else if (distance <= tolerance + softness) {
  const factor = (distance - tolerance) / softness;
  alpha = originalAlpha * factor;
}
```

### Acceptance Criteria

- Green, blue, and black backgrounds can be removed.
- Tolerance and softness visibly affect output.
- Transparent pixels export correctly as PNG alpha.

---

## Feature 5: Intelligent Auto-Crop & Sizing

### Requirements

The app should detect the visible character area across all frames after background removal.

Important: calculate one global bounding box from all included frames.

Per-frame bounding box:

```ts
function getAlphaBounds(imageData: ImageData, alphaThreshold: number) {
  let minX = imageData.width;
  let minY = imageData.height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  const data = imageData.data;

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const i = (y * imageData.width + x) * 4;
      const alpha = data[i + 3];

      if (alpha > alphaThreshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        found = true;
      }
    }
  }

  if (!found) return null;

  return { minX, minY, maxX, maxY };
}
```

Global bounds:

```ts
function mergeBounds(boundsList: Bounds[]): Bounds {
  return {
    minX: Math.min(...boundsList.map(b => b.minX)),
    minY: Math.min(...boundsList.map(b => b.minY)),
    maxX: Math.max(...boundsList.map(b => b.maxX)),
    maxY: Math.max(...boundsList.map(b => b.maxY)),
  };
}
```

### Reduce-to-Fit Behavior

The reduce feature should ensure every frame remains fully contained inside the final output dimensions.

If the global bounds plus padding exceed the desired output size, scale the character down uniformly until it fits.

Pseudo-code:

```ts
const scaleX = targetWidth / sourceBoundsWidth;
const scaleY = targetHeight / sourceBoundsHeight;
const scale = Math.min(1, scaleX, scaleY);
```

### Alignment

For character sprites, bottom-center alignment is often best.

- Center: place character in the middle of the output frame.
- Bottom-center: center horizontally and align lower bound near bottom padding.

### Acceptance Criteria

- Cropped frames have identical dimensions.
- Animation does not jitter because of per-frame crop changes.
- Reduce-to-fit prevents clipping.
- Transparent padding is preserved.

---

## Feature 6: Halo Remover

### Requirements

The halo remover removes edge pixels from the visible alpha mask to reduce chroma-key artifacts.

Simple MVP approach:

1. Identify visible pixels where alpha is above threshold.
2. Identify pixels adjacent to transparent pixels.
3. Reduce alpha or remove pixels within `erosionPixels` distance from transparent regions.

MVP implementation can use morphological erosion on the alpha channel.

Pseudo-code:

```ts
function erodeAlpha(imageData: ImageData, radius: number, alphaThreshold: number): ImageData {
  const src = imageData.data;
  const output = new Uint8ClampedArray(src);
  const { width, height } = imageData;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (src[i + 3] <= alphaThreshold) continue;

      let nearTransparent = false;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

          const ni = (ny * width + nx) * 4;
          if (src[ni + 3] <= alphaThreshold) {
            nearTransparent = true;
            break;
          }
        }
        if (nearTransparent) break;
      }

      if (nearTransparent) {
        output[i + 3] = 0;
      }
    }
  }

  return new ImageData(output, width, height);
}
```

### Acceptance Criteria

- User can remove 1+ pixels around sprite edges.
- Increasing erosion value makes the sprite edge visibly shrink.
- Export reflects halo cleanup.

---

## Feature 7: Sprite Sheet Export

### Requirements

Generate a PNG sprite sheet from processed included frames.

Inputs:

- processed frames
- frame width
- frame height
- columns

Pseudo-code:

```ts
function buildSpriteSheet(frames: HTMLCanvasElement[], columns: number) {
  const frameWidth = frames[0].width;
  const frameHeight = frames[0].height;
  const rows = Math.ceil(frames.length / columns);

  const canvas = document.createElement('canvas');
  canvas.width = frameWidth * columns;
  canvas.height = frameHeight * rows;

  const ctx = canvas.getContext('2d')!;

  frames.forEach((frame, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    ctx.drawImage(frame, col * frameWidth, row * frameHeight);
  });

  return canvas;
}
```

### Acceptance Criteria

- Downloaded sprite sheet is a PNG.
- Frames are ordered left-to-right, top-to-bottom.
- Transparent backgrounds are preserved.
- Exported sheet dimensions are shown before download.

---

## Feature 8: ZIP Export

### Requirements

Use JSZip to export individual processed PNG frames.

Filenames:

```txt
zsprite_000.png
zsprite_001.png
zsprite_002.png
```

Allow custom prefix.

### Acceptance Criteria

- Downloaded ZIP contains one PNG per included processed frame.
- Files are zero-padded and ordered correctly.
- Transparent backgrounds are preserved.

---

## Suggested Component Structure

```txt
src/
  app/
    page.tsx
    layout.tsx
  components/
    AppHeader.tsx
    UploadDropzone.tsx
    VideoLoopEditor.tsx
    FrameTimeline.tsx
    AnimationPreview.tsx
    ChromaKeyPanel.tsx
    CropSizingPanel.tsx
    HaloRemoverPanel.tsx
    ExportPanel.tsx
    StepSidebar.tsx
  lib/
    video.ts
    frames.ts
    chromaKey.ts
    crop.ts
    halo.ts
    exportSprites.ts
    canvas.ts
    color.ts
  store/
    useZSpriteStore.ts
  types/
    zsprite.ts
```

---

## Suggested Implementation Phases for Codex

### Phase 1 — Project Shell

- Create Next.js TypeScript app.
- Add Tailwind and shadcn/ui.
- Build one-page layout with upload panel, preview area, sidebar, and frame strip placeholder.

### Phase 2 — Upload and Loop Selection

- Implement video upload.
- Show preview player.
- Read metadata and duration.
- Add loop start/end controls.
- Add loop preview playback.

### Phase 3 — Frame Extraction

- Extract frames from selected loop using Canvas.
- Add thumbnail timeline.
- Add animation preview at selected FPS.
- Allow removing/restoring frames.

### Phase 4 — Chroma Key

- Implement green/blue/black/custom chroma key.
- Add tolerance, softness, and spill controls.
- Render preview frames with transparency checkerboard background.

### Phase 5 — Auto-Crop and Sizing

- Detect alpha bounds.
- Calculate global bounds across included frames.
- Crop all frames to consistent size.
- Add padding, target dimensions, reduce-to-fit, and alignment.

### Phase 6 — Halo Remover

- Implement alpha erosion.
- Add erosion pixel control.
- Preview cleanup.

### Phase 7 — Export

- Export sprite sheet PNG.
- Export ZIP of PNG frames.
- Add export preview metadata.

### Phase 8 — Polish

- Add error states.
- Add loading states for frame extraction and processing.
- Add keyboard shortcuts if useful.
- Improve mobile/tablet behavior, though desktop is primary.

---

## Processing Performance Notes

- Keep uploaded videos short for MVP.
- Warn user if extracting more than 300 frames.
- Use `requestAnimationFrame` or chunked async processing for long operations so UI does not freeze.
- Revoke old object URLs to avoid memory leaks.
- Cache processed frames and only recompute when relevant settings change.

Potential helper:

```ts
function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
```

Use it inside large loops every 10-20 frames.

---

## Error Handling

Show user-friendly errors for:

- Unsupported video format
- Video failed to load
- Invalid loop range
- No frames extracted
- No included frames selected
- Export attempted before processing
- Browser memory/performance limitations

---

## Visual Design Direction

ZSprite should feel like a small pro creative tool.

Suggested style:

- Dark UI
- Subtle grid/checkerboard backgrounds for transparency preview
- Rounded panels
- Clear step indicators
- Accent color: electric violet, cyan, or lime
- Frame thumbnails with hover controls
- Before/after preview toggles

Do not overload the UI with too many controls at once. Put advanced settings behind collapsible sections if necessary.

---

## MVP Acceptance Checklist

The MVP is complete when:

- [ ] User can upload a video.
- [ ] User can choose loop start and end.
- [ ] User can preview the loop.
- [ ] User can extract frames at a selected FPS.
- [ ] User can remove unwanted frames.
- [ ] User can preview the frame animation.
- [ ] User can remove green, blue, or black backgrounds.
- [ ] User can auto-crop the visible character consistently across frames.
- [ ] User can reduce-to-fit to avoid clipping.
- [ ] User can remove edge halo artifacts.
- [ ] User can export a sprite sheet PNG.
- [ ] User can export individual PNG frames as a ZIP.

---

## Stretch Features

Add later after MVP:

- Onion-skin preview
- Drag-to-reorder frames
- Duplicate frame removal
- Automatic loop scoring
- Pixel-art downscaling modes
- Nearest-neighbor scaling toggle
- Outline/shadow generator
- Normal map generation
- Godot/Unity/Aseprite export presets
- JSON metadata export
- GIF preview export
- WebM/APNG export
- Batch processing
- AI-assisted background cleanup

---

## Developer Notes for Codex

Prefer small, testable utility functions in `src/lib`. Keep pixel-processing code separate from React components. React components should call clean processing functions rather than owning the algorithmic logic directly.

Prioritize correctness over fancy UI in the first pass. The most important product quality is that the exported frames are consistently sized, transparent, and usable in a 2D game engine.

Use TypeScript strictly. Avoid `any` unless absolutely necessary.

