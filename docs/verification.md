# Verification record

Historical results below describe checks performed during implementation. Generated files under `output/` and Downloads are local and are not included in Git. Local fixture diagnostics are not live provider generations.

## Feature checklist and manual verification

No unit tests, automated test suite, or test framework were added. Verification uses manual browser interactions, one-off local API requests, and media inspection.

| Feature                                       | Implementation | Verification                                                                                                 |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| Workspace, strict types, theme, project rules | Done           | Clean `npm ci` verified                                                                                      |
| Required ports, proxy, readiness checks       | Done           | Both ports, proxy, missing keys/binary, occupied-port errors checked                                         |
| Reusable UI and responsive workspace          | Done           | Desktop and 390px mobile inspected; input, suggestions, focus, and empty validation checked                  |
| Job creation, progress, duplicate prevention  | Done           | Temporary local provider fixtures used for manual workflow verification; concurrent API request returned 409 |
| Structured script and narration               | Done           | Live structured three-scene script and all three Gemini narration segments generated successfully            |
| Pixabay search, download, credits, 24h cache  | Done           | Live Pixabay API returned 200; real image download and contributor credits verified; 24h cache written       |
| Video rendering and fallback scenes           | Done           | Real local diagnostic MP4 rendered and visually inspected; H.264/AAC and 720×1280 confirmed                  |
| Preview, streaming, and download              | Done           | Diagnostic played in browser, download completed, and byte-range request returned 206                        |
| Live topic-to-MP4 demo                        | Done           | Live Gemini + Pixabay video generated: 26.561 seconds, three photos, no fallback scenes                      |

`output/renderer-check/video.mp4` is a six-second **renderer diagnostic**, with a test image, text/color scenes, and tones. Additional temporary provider-fixture outputs are under `output/manual-check`. These are explicitly not the final live AI demo and should not be described as such in a submission. Temporary fixture code lives outside the repository and is not shipped with the app.

### Live provider verification before the Gemini migration — October 12, 2026

The backend was restarted after the Pixabay key was configured. Health reports all prerequisites present. A browser submission for “Why do leaves change color in autumn?” displayed the explicit script-generation failure. A separate small OpenAI request identified HTTP 429, `credit_balance_exhausted` / `insufficient_quota`: the configured OpenAI account has no remaining API credits. No real narrated video was produced.

Pixabay returned HTTP 200 with three portrait-image results. The application’s actual adapter downloaded a photo and saved its contributor/source links under `output/pixabay-live-check/`; its search response was cached. The downloaded photo is credited to [Samueles on Pixabay](https://pixabay.com/photos/maple-autumn-leaves-foliage-2999706/). The browser failure state is recorded in `docs/screenshots/live-provider-blocked.jpg`.

### Gemini migration verification — October 12, 2026

The configured Gemini key is detected. Google returned 404 for `gemini-2.5-flash`, with an explanation that it is unavailable to new users; the default script model was updated to `gemini-3.8-flash`. The configured speech model returned real PCM audio, successfully wrapped in WAV and measured by ffprobe (5.411 seconds). Manual local fixtures additionally verified structured parsing, quota/safety failures, and WAV-to-MP4 rendering; these fixtures are diagnostics, not live narration.

### Revised motion and caption layout

The revised autumn demo is `output/autumn-smooth-revised/video.mp4`, also downloaded through the browser as `~/Downloads/frame-autumn-smooth.mp4`. The original remains in its original job directory. This revision reused all three saved photographs, narration WAV files, script, and credits; no provider requests were made. Runtime remains 26.561 seconds, at 720×1280, 30 fps, H.264/AAC (4,347,828 bytes).

Future generations use a centered 100–104% zoom with smoothstep easing, randomly choosing one direction per image scene. A 2880×5120 canvas, full-chroma processing, and 1440×2560 motion output downsampled to 720×1280 reduce crop-rounding jitter. There is no panning. The revised demo explicitly exercises zoom-in, zoom-out, zoom-in. Text/color fallback scenes stay still.

The overall title appears at (32, 42) in 36px text, with natural wrapping and no frame counter or top panel. The bottom panel starts at y=980, is 300px tall, and uses 24px padding with 30px captions. A manual layout diagnostic verified six caption lines plus the fallback disclosure; a separate diagnostic verified a long title wraps at word boundaries. Contact sheets in the revised output directory show all scenes and sampled progression for both zoom directions. Full FFmpeg decoding and browser playback/download were checked; downloaded bytes match the saved MP4 and narration inputs match the originals. Type-checking, linting, formatting, and production builds pass. No automated tests were added.

The temporary media-review server used port 8001 only for manual inspection; the application remains on frontend 3000 and backend 8000. The revised MP4 is delivered as a local file rather than registering a new in-memory generation job.

### Completed live demo

Topic: **Why do leaves change color in autumn?** The real Gemini/Pixabay generation completed successfully. The retained demo is `output/aedfec97-4f75-4373-a35d-ae0c4f6928a4/video.mp4` (26.561 seconds, 4,325,208 bytes, 720×1280 H.264/AAC). Its directory also retains the structured script, three downloaded photographs, three narrated WAV files, subtitles, and source credits. No fallback scene was used.

All video/audio frames decoded without errors. Captions and all three scenes were inspected in `frames.jpg`; scene durations follow the actual narration. Browser playback decoded at 720×1280 and reached the end without a media error, the streaming route returned HTTP 206 for a byte range, and the download route returned an MP4 attachment with a hash matching the saved video. The browser download also succeeded as `~/Downloads/frame-aedfec97.mp4`. The frontend production bundle was checked for configured credentials and contained none. Type-checking, linting, formatting, and production builds passed after the migration. No automated test suite was added.

Image relevance remains imperfect: the first search selected a peach branch with green leaves. Narration accuracy/pronunciation has not received an independent listening review; listen to the final demo before sharing. Google free-tier quotas and billing state must be checked in AI Studio; successful requests alone do not prove the project's billing tier. Completed workspace evidence is in `docs/screenshots/gemini-completed.jpg` and generation progress in `docs/screenshots/gemini-generating.jpg`.

To run again, keep the Gemini and Pixabay keys in root `.env`, start `npm run dev`, and submit a topic at localhost:3000. Each generation uses one script request plus three speech requests.

Screenshots from the manual layout checks are in `docs/screenshots/workspace-desktop.jpg` and `docs/screenshots/workspace-mobile.jpg`.

The implementation session, including image-generated references and verification, started at 02:43 on October 12, 2026 (Asia/Manila). The initial implementation and fixture verification were completed within the two-hour cap; the Gemini migration and live MP4 generation were also completed within the cap.

The application sends the entered topic and generated narration to Google Gemini; it sends scene search terms to Pixabay. Credentials stay on the backend. Generated factual claims are not independently fact-checked by this prototype.

## Cleanup verification

The cleanup preserves the revised demo and public API. No new provider requests were made. All fixture code was temporary and outside the repository; diagnostic media remains ignored under `output/`.

| Check                              | Observed result                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static/build checks                | Typecheck, ESLint, Prettier, and builds passed across all workspaces.                                                                                                                                                                                                                                                  |
| Compiled server                    | Started with Node's TypeScript loading disabled; backend and Vite proxy health returned 200/ready on ports 8000/3000. Shared runtime code resolves from compiled JavaScript.                                                                                                                                           |
| Trimmed input and duplicate clicks | Whitespace-only input showed validation without submission. Double-clicking a valid padded topic produced exactly one POST with trimmed text.                                                                                                                                                                          |
| Poll recovery                      | Temporary non-JSON 503 response was followed by successful completion; the reconnect error cleared.                                                                                                                                                                                                                    |
| Backend restart                    | Stopped/restarted the temporary API during polling. The UI showed missing-job guidance, cleared the transient error, stopped polling, and enabled retry.                                                                                                                                                               |
| Unavailable backend                | Reloading without the API showed setup guidance and disabled generation.                                                                                                                                                                                                                                               |
| Timeouts and cancellation          | API-client diagnostics verified 10-second health and 15-second submission timeouts, retained HTTP status for non-JSON 502/404 responses, offline messaging, and AbortError on caller cancellation. Browser submission timed out with a processing warning; diagnostic server recorded one POST and no automatic retry. |
| Duration validation                | A 91-second WAV was rejected. Three valid 31-second diagnostic scenes combined into a 93.024-second MP4. A deliberately mismatched expected total was rejected.                                                                                                                                                        |
| Provider split / WAV helper        | Local fixture returned three structured scenes, valid one-second WAV, retained Pixabay credits, and one search request for two identical queries. These are fixture results, not live provider output.                                                                                                                 |
| Fonts and layout                   | Custom DejaVu Serif file/family passed readiness and rendered matching ASS styles. Inspected long-title wrapping, six caption lines, and fallback disclosure for Serif and default Sans. Arial is configured but was not rendered on this Linux host.                                                                  |
| Saved-media rendering              | Re-rendered all original scenes with in/out/in zoom. The resulting 26.561-second MP4 is byte-identical to the approved revised MP4; both previous demos remain preserved.                                                                                                                                              |
| Browser media                      | Completed full playback without media error using the saved revised video through the temporary API; downloaded it and inspected all three contributor/source links.                                                                                                                                                   |
| Secrets                            | Production frontend assets contained none of the locally configured keys. Health responses expose prerequisite booleans and configuration names only.                                                                                                                                                                  |

Diagnostic directories: `output/cleanup-duration-check`, `output/cleanup-render-check`, `output/cleanup-layout-check`, and `output/cleanup-font-check`. These are not additional live-provider demos.

### Remaining verification limits

- No fresh live-provider generation was performed during cleanup; live evidence above is from the earlier successful generation.
- Node 22.12, macOS/Windows, and Arial rendering were not directly exercised. The local host uses Node 24; compiled-server verification disabled TypeScript source loading.
- Browser unmount during an active POST was not directly exercised; caller cancellation was checked with a one-off API-client diagnostic and hook cleanup was reviewed.
- Narration pronunciation/factual accuracy remains subject to human review. No automated test suite was added.
