# ZSprite

ZSprite is a local-first web app for turning short AI animation videos into game-ready 2D sprites.

It runs entirely in the browser for the MVP:

- Upload a short video
- Pick a seamless loop
- Extract frames at a chosen FPS
- Remove unwanted frames
- Apply chroma key background removal
- Auto-crop with a stable global bounding box
- Clean halos on alpha edges
- Export a sprite sheet PNG or a ZIP of transparent PNG frames
- Save API keys for your video services locally in the browser

The API key panel is a convenience vault only. The current MVP does not send those keys anywhere.

## Getting Started

Install dependencies and start the local app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Check

```bash
npm run lint
npm run build
```

## Notes

- This app is designed for personal/local use.
- Processing is client-side with the Canvas API and `HTMLVideoElement`.
- Export uses `JSZip` for frame bundles.
- Uploaded videos should stay fairly short for the best in-browser performance.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zustand
- lucide-react
- JSZip

## GitHub

`.gitignore` is set up for a normal Next.js repo and excludes local build artifacts, dependencies, env files, and the temporary scaffold directory used during setup.

If you plan to open source it, avoid committing real service keys or local test clips.
