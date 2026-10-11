# Frame — a little idea, a moving story

A local creative studio that turns a topic into a narrated, three-scene vertical MP4 using Gemini, Pixabay photographs, and FFmpeg. Built with React, strict TypeScript, Express, Vite, and styled-components.

## Quick start

Requires **Node.js 22.12 or later**, npm, provider internet access, a Gemini API key, and a Pixabay API key.

```sh
npm ci
cp .env.example .env
```

Set the backend keys in the root `.env`:

```dotenv
GEMINI_API_KEY=your-gemini-key
PIXABAY_API_KEY=your-pixabay-key
```

Create keys through [Google AI Studio](https://aistudio.google.com/apikey) and [Pixabay API documentation](https://pixabay.com/api/docs/). Keep keys out of chat, source code, and frontend environment variables.

```sh
npm run dev
```

Open **http://localhost:3000**. The API runs at **http://localhost:8000**; readiness is available at `/api/health`. Both services bind to loopback, and occupied ports produce errors. Vite proxies `/api` to the backend. Restart the backend after editing `.env`.

## Configuration

| Variable                      | Default / purpose                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`              | Required backend credential                                                                     |
| `PIXABAY_API_KEY`             | Required backend credential                                                                     |
| `GEMINI_TEXT_MODEL`           | `gemini-3.8-flash`                                                                              |
| `GEMINI_SPEECH_MODEL`         | `gemini-2.5-flash-preview-tts`                                                                  |
| `GEMINI_VOICE`                | `Kore`                                                                                          |
| `FFMPEG_PATH`, `FFPROBE_PATH` | Optional overrides for npm-packaged binaries                                                    |
| `FONT_PATH`                   | Optional TrueType font path; common DejaVu Sans/Arial paths are detected                        |
| `FONT_FAMILY`                 | Font's internal family name; required for custom font paths not recognized as DejaVu Sans/Arial |

FFmpeg must support ASS subtitles, libx264, and AAC. Health checks verify those capabilities, ffprobe, font configuration, and credential presence. They do not verify provider access, account funding, or quotas. Custom font families must match the font file and contain no commas or line breaks.

Use a Gemini project on the free tier to avoid paid API usage. [Google's model pricing and limits](https://ai.google.dev/gemini-api/docs/pricing) depend on model, account, and region; this application does not enforce the project's billing tier. Free-tier content may be used to improve Google products. Each video uses one script request and three speech requests. Quota errors are explicit; there is no automatic provider retry or paid fallback.

## Commands and architecture

| Command                                   | Purpose                             |
| ----------------------------------------- | ----------------------------------- |
| `npm run dev`                             | Start both services                 |
| `npm run dev:web`                         | Start frontend on 3000              |
| `npm run dev:server`                      | Start backend on 8000               |
| `npm run typecheck`                       | Check all workspaces                |
| `npm run lint`                            | Check ESLint rules                  |
| `npm run format:check` / `npm run format` | Check / apply Prettier formatting   |
| `npm run build:shared`                    | Build shared runtime constants      |
| `npm run build`                           | Build backend and frontend          |
| `npm run start:server`                    | Run compiled backend after building |

- `apps/web`: React workspace, reusable controls, generator hook/API client, typed theme.
- `apps/server`: configuration, job orchestration, separate Gemini/Pixabay adapters, WAV encoding, and FFmpeg rendering.
- `packages/shared`: API contracts and shared input/scene-count limits.

Shared code is built before the documented dev commands and before backend/frontend production builds. Restart development services after changing shared constants so the compiled shared module is refreshed.

The frontend production bundle is in `apps/web/dist`; deploying it is outside this local prototype. Development conventions are in [AGENTS.md](AGENTS.md). [Design references](docs/design/README.md) contain ImageGen mockups and prompts; interactive controls are real React components.

## Generation and API

1. Validate a trimmed topic of 3–180 characters and create one local job. Concurrent jobs are rejected.
2. Gemini returns a structured title and three English scenes with narration and photo queries.
3. Download portrait Pixabay images, retaining source/contributor credits. Search responses are cached for 24 hours without credentials. Only a successful search with no matches uses a labeled text/color scene.
4. Generate PCM narration, wrap it in WAV, and measure each segment with ffprobe. Narration must be positive and no longer than 90 seconds per scene.
5. Render 720×1280, 30 fps H.264/AAC scenes. Each image has a centered, gently eased 100–104% zoom in one randomly selected direction. Fallback backgrounds stay still. The overall title wraps naturally above a compact caption panel. Actual narration determines duration; 20–30 seconds is the target.
6. Combine scenes, validate final duration against their sum within one second, and expose playback/download with credits and AI narration disclosure.

| Endpoint                                    | Behavior                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `GET /api/health`                           | Readiness, prerequisite booleans, missing configuration                         |
| `POST /api/generations`                     | Accept `{ "topic": "Why do leaves change color?" }`; return `202 { "id": "…" }` |
| `GET /api/generations/:id`                  | Status, stage, error, and completed result                                      |
| `GET /api/generations/:id/video`            | Completed MP4 with byte-range support                                           |
| `GET /api/generations/:id/video?download=1` | MP4 attachment                                                                  |

Stages: `queued`, `script`, `images`, `voice`, `render`, `complete`. Status: `queued`, `running`, `completed`, `failed`. Invalid input returns 400, concurrent generation 409, missing prerequisites 503, and unknown/unavailable jobs 404. Error bodies contain `error`.

Frontend health/poll requests time out after 10 seconds; submission after 15 seconds. Polling reconnects after transient failures and stops on completion or a missing job. A timed-out submission may already have reached the backend; it is never automatically resubmitted.

## Demo and verification

The current local deliverable is **`output/autumn-smooth-revised/video.mp4`**, also downloaded as `~/Downloads/frame-autumn-smooth.mp4`: “Why Leaves Change Color in Autumn,” 26.561 seconds. Its result metadata retains the three photographer/source links. The original is preserved under `output/aedfec97-4f75-4373-a35d-ae0c4f6928a4/`.

**Generated media is ignored by Git and is not included in a fresh clone.** Run a generation to create a new MP4, or supply the demo separately for handover. Re-rendered local artifacts are not registered as API jobs. Screenshots and design references remain in documentation.

[Verification record](docs/verification.md) separates live provider results, local diagnostics, and unverified checks. No unit tests, automated suite, or test framework are included. Manual verification covers the browser, local API requests, and media inspection; run typecheck, lint, formatting, and builds before handover.

## Limitations

Job state is in memory and disappears on backend restart; output files remain under `output/<job-id>/`. There is no history, recovery, automatic file cleanup, account system, database, editor, music, or AI-generated footage. Delete unwanted local output manually.

Image relevance is imperfect: the demo's first photograph is a peach branch with green leaves. Generated claims are not independently fact-checked; narration pronunciation has not had an independent listening review. Review media before sharing. Topics and narration go to Google; photo queries go to Pixabay. Credentials remain on the backend.

Next improvements: sentence-timed captions, image ranking, narration preview, job recovery, and output cleanup.
