# Project conventions

- Build Frame as a local topic-to-MP4 prototype. Keep scope to three English scenes, one voice, vertical output, and a single workspace.
- Use strict TypeScript, React functional components/hooks, Vite, Express, and npm workspaces. Frontend lives in apps/web, backend in apps/server, API types in packages/shared.
- Frontend must run at http://localhost:3000, backend at http://localhost:8000. Fail if ports are occupied; never silently move ports. Use Vite's /api proxy.
- Style with styled-components only. Use the typed theme for colors, typography, spacing, radii, and breakpoints. Reuse shared Button, TextField, Card, StatusBadge, ProgressSteps, and EmptyState components before adding new primitives. Keep generator-specific components in its feature directory.
- Separate presentation, hooks, API clients, provider integrations, and rendering logic. Share contracts through @frame/shared; avoid unnecessary abstractions.
- Implement one feature at a time. Manually verify each feature before moving on and record results honestly in docs/verification.md and summarize current status in README.md. Run typecheck, lint, format:check, and build. Use Prettier for consistent formatting. Do not add unit tests, automated test suites, or a test framework.
- Keep credentials on the server. Never expose them through VITE_ variables, API responses, frontend bundles, logs, or documentation. Keep .env.example updated and generated media ignored.
- Use ImageGen references in docs/design as inspiration, not raster replacements for interactive controls. Reuse the established light creative-studio design. Do not add controls for unimplemented functionality.
- Show real generation stages and explicit failures; never silently replace live provider calls with mock success. Text/color scenes are allowed only when image search returns no matches, and must be identified.
- Use local files and an in-memory single-job store. No accounts, database, timeline, history, music, or AI-generated footage in this prototype.
- Preserve photo credits and disclose AI-generated narration. Local job state is lost when the backend restarts.
- Respect the trial's two-hour work cap; count setup, design, implementation, and verification. Stop when the budget ends and document unfinished or blocked work.
- Use Gemini for structured scripts and narration, and Pixabay for stock images. Keep model names configurable. Free-tier quotas are account-dependent; display quota errors and never automatically switch to a paid provider.
