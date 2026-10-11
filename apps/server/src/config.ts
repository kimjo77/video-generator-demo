import { config as loadEnv } from 'dotenv';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { HealthResponse } from '@frame/shared';

loadEnv({ path: fileURLToPath(new URL('../../../.env', import.meta.url)), quiet: true });
const require = createRequire(import.meta.url);
const packagedFfmpeg = require('ffmpeg-static') as string | null;
const packagedFfprobe = require('ffprobe-static') as { path: string };
const detectedFont = [
  { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'DejaVu Sans' },
  { path: '/usr/share/fonts/TTF/DejaVuSans.ttf', family: 'DejaVu Sans' },
  { path: '/System/Library/Fonts/Supplemental/Arial.ttf', family: 'Arial' },
  { path: 'C:/Windows/Fonts/arial.ttf', family: 'Arial' },
].find((font) => existsSync(font.path));
const font = process.env.FONT_PATH?.trim() || detectedFont?.path || '';
const knownFamily = /(?:^|[/\\])DejaVuSans\.ttf$/i.test(font)
  ? 'DejaVu Sans'
  : /(?:^|[/\\])Arial\.ttf$/i.test(font)
    ? 'Arial'
    : '';
const fontFamily =
  process.env.FONT_FAMILY?.trim() ||
  knownFamily ||
  (!process.env.FONT_PATH?.trim() ? detectedFont?.family : '') ||
  '';
export const config = {
  port: 8000,
  geminiKey: process.env.GEMINI_API_KEY?.trim() || '',
  pixabayKey: process.env.PIXABAY_API_KEY?.trim() || '',
  textModel: process.env.GEMINI_TEXT_MODEL?.trim() || 'gemini-3.8-flash',
  speechModel: process.env.GEMINI_SPEECH_MODEL?.trim() || 'gemini-2.5-flash-preview-tts',
  voice: process.env.GEMINI_VOICE?.trim() || 'Kore',
  ffmpeg: process.env.FFMPEG_PATH || packagedFfmpeg || 'ffmpeg',
  ffprobe: process.env.FFPROBE_PATH || packagedFfprobe.path,
  font,
  fontFamily,
  outputDir: fileURLToPath(new URL('../../../output/', import.meta.url)),
};
const execFileAsync = promisify(execFile);
async function binaryAvailable(binary: string, rendering = false): Promise<boolean> {
  try {
    await execFileAsync(binary, ['-version'], { timeout: 5000 });
    if (rendering) {
      const [filters, encoders] = await Promise.all([
        execFileAsync(binary, ['-hide_banner', '-filters'], { timeout: 5000 }),
        execFileAsync(binary, ['-hide_banner', '-encoders'], { timeout: 5000 }),
      ]);
      return (
        /\bass\s+V->V/.test(filters.stdout) &&
        /\blibx264\b/.test(encoders.stdout) &&
        /\baac\b/.test(encoders.stdout)
      );
    }
    return true;
  } catch {
    return false;
  }
}
export async function checkHealth(): Promise<HealthResponse> {
  const [ffmpeg, ffprobe] = await Promise.all([
    binaryAvailable(config.ffmpeg, true),
    binaryAvailable(config.ffprobe),
  ]);
  const checks = {
    gemini: Boolean(config.geminiKey),
    pixabay: Boolean(config.pixabayKey),
    ffmpeg,
    ffprobe,
    font: Boolean(
      config.font &&
      existsSync(config.font) &&
      config.fontFamily &&
      !/[\r\n,]/.test(config.fontFamily),
    ),
  };
  const labels = {
    gemini: 'GEMINI_API_KEY',
    pixabay: 'PIXABAY_API_KEY',
    ffmpeg: 'FFmpeg',
    ffprobe: 'ffprobe',
    font: 'FONT_PATH and FONT_FAMILY (a TrueType font and its family)',
  };
  const missing = (Object.keys(checks) as Array<keyof typeof checks>)
    .filter((key) => !checks[key])
    .map((key) => labels[key]);
  return { status: missing.length ? 'setup-required' : 'ready', checks, missing };
}
