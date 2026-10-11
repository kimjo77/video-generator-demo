import { randomInt } from 'node:crypto';
import { spawn } from 'node:child_process';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SCENE_COUNT, type Scene } from '@frame/shared';
import { config } from './config.js';

export function runBinary(binary: string, args: string[], timeout = 180_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let errors = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeout);
    child.stdout.on('data', (chunk: Buffer) => {
      output = (output + chunk.toString()).slice(-65_536);
    });
    child.stderr.on('data', (chunk: Buffer) => {
      errors = (errors + chunk.toString()).slice(-8192);
    });
    child.on('error', () => {
      clearTimeout(timer);
      reject(new Error('Media tool could not start. Check the binary configuration.'));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(output);
      else {
        console.error(`[media] ${timedOut ? 'Timed out' : `Exit ${code}`}: ${errors}`);
        reject(
          new Error(
            timedOut
              ? 'Video rendering timed out. Try again with a shorter topic.'
              : 'Media processing failed. Check FFmpeg support and available disk space.',
          ),
        );
      }
    });
  });
}
const MAX_NARRATION_DURATION = 90;
const DURATION_TOLERANCE = 1;
const VIDEO = {
  width: 720,
  height: 1280,
  fps: 30,
  sourceScale: 4,
  motionScale: 2,
  zoomRange: 0.04,
};
const CAPTIONS = {
  panelTop: 980,
  panelHeight: 300,
  padding: 24,
  fontSize: 30,
  titleX: 32,
  titleY: 42,
  titleSize: 36,
  disclosureY: 1234,
};
async function mediaDuration(path: string): Promise<number> {
  const duration = Number(
    (
      await runBinary(
        config.ffprobe,
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'default=noprint_wrappers=1:nokey=1',
          path,
        ],
        10_000,
      )
    ).trim(),
  );
  if (!Number.isFinite(duration) || duration <= 0)
    throw new Error('Media has an invalid duration.');
  return duration;
}
export async function audioDuration(path: string): Promise<number> {
  const duration = await mediaDuration(path);
  if (duration > MAX_NARRATION_DURATION)
    throw new Error('Narration exceeds the 90-second scene limit.');
  return duration;
}
// Filter arguments are independent of the shell; escape FFmpeg's filter parser too.
function filterPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "'\\''");
}
export async function renderScene(
  dir: string,
  index: number,
  scene: Scene,
  hasImage: boolean,
  duration: number,
  videoTitle: string,
  zoomDirection: 'in' | 'out' = randomInt(2) === 0 ? 'in' : 'out',
): Promise<void> {
  const number = index + 1;
  const fontsDir = join(dir, 'fonts');
  await mkdir(fontsDir, { recursive: true });
  await copyFile(config.font, join(fontsDir, 'caption.ttf'));
  const subtitleFile = join(dir, `captions-${number}.ass`);
  const assText = (text: string) =>
    text
      .replace(/[\\{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const endTime = `0:${String(Math.floor(duration / 60)).padStart(2, '0')}:${(duration % 60).toFixed(2).padStart(5, '0')}`;
  const dialogue = (style: string, text: string) =>
    `Dialogue: 0,0:00:00.00,${endTime},${style},,0,0,0,,${text}`;
  await writeFile(
    subtitleFile,
    `[Script Info]
ScriptType: v4.00+
PlayResX: ${VIDEO.width}
PlayResY: ${VIDEO.height}
WrapStyle: 1
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,${config.fontFamily},${CAPTIONS.titleSize},&H00FFFFFF,&H00FFFFFF,&H90000000,&H90000000,-1,0,0,0,100,100,0,0,1,1.5,1,7,${CAPTIONS.titleX},${CAPTIONS.titleX},${CAPTIONS.titleY},1
Style: Caption,${config.fontFamily},${CAPTIONS.fontSize},&H00FFFFFF,&H00FFFFFF,&H60000000,&H00000000,0,0,0,0,100,100,0,0,1,1,0,7,${CAPTIONS.padding},${CAPTIONS.padding},${CAPTIONS.panelTop + CAPTIONS.padding},1
Style: Fallback,${config.fontFamily},18,&H00FFFFFF,&H00FFFFFF,&H60000000,&H00000000,0,0,0,0,100,100,0,0,1,1,0,7,${CAPTIONS.padding},${CAPTIONS.padding},${CAPTIONS.disclosureY},1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${dialogue('Title', assText(videoTitle))}
${dialogue('Caption', assText(scene.narration))}
${!hasImage ? dialogue('Fallback', 'TEXT SCENE - NO PHOTO MATCH') : ''}
`,
  );
  const base = hasImage
    ? ['-loop', '1', '-framerate', String(VIDEO.fps), '-i', join(dir, `image-${number}.jpg`)]
    : ['-f', 'lavfi', '-i', `color=c=0xddd0bc:s=${VIDEO.width}x${VIDEO.height}:r=${VIDEO.fps}`];
  const lastFrame = Math.max(1, Math.ceil(duration * VIDEO.fps) - 1);
  const progress = `min(on/${lastFrame},1)`;
  const eased = `(3*pow(${progress},2)-2*pow(${progress},3))`;
  const zoom =
    zoomDirection === 'in'
      ? `1+${VIDEO.zoomRange}*${eased}`
      : `${1 + VIDEO.zoomRange}-${VIDEO.zoomRange}*${eased}`;
  const filters = [
    ...(hasImage
      ? [
          `scale=${VIDEO.width * VIDEO.sourceScale}:${VIDEO.height * VIDEO.sourceScale}:force_original_aspect_ratio=increase:flags=lanczos`,
          `crop=${VIDEO.width * VIDEO.sourceScale}:${VIDEO.height * VIDEO.sourceScale}`,
          // Full chroma and oversampling reduce integer crop/chroma rounding jitter.
          'format=yuv444p',
          `zoompan=z='${zoom}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=${VIDEO.width * VIDEO.motionScale}x${VIDEO.height * VIDEO.motionScale}:fps=${VIDEO.fps}`,
          `scale=${VIDEO.width}:${VIDEO.height}:flags=lanczos`,
        ]
      : []),
    'setsar=1',
    `drawbox=x=0:y=${CAPTIONS.panelTop}:w=iw:h=${CAPTIONS.panelHeight}:color=black@0.65:t=fill`,
    `ass=filename='${filterPath(subtitleFile)}':fontsdir='${filterPath(fontsDir)}'`,
    'format=yuv420p',
  ];
  await runBinary(config.ffmpeg, [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    ...base,
    '-i',
    join(dir, `voice-${number}.wav`),
    '-vf',
    filters.join(','),
    '-af',
    'apad',
    '-t',
    duration.toFixed(3),
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-threads',
    '2',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ar',
    '44100',
    '-ac',
    '2',
    '-movflags',
    '+faststart',
    join(dir, `scene-${number}.mp4`),
  ]);
}
export async function combineScenes(dir: string, durations: readonly number[]): Promise<number> {
  if (
    durations.length !== SCENE_COUNT ||
    durations.some(
      (duration) =>
        !Number.isFinite(duration) || duration <= 0 || duration > MAX_NARRATION_DURATION,
    )
  )
    throw new Error('Invalid scene durations.');
  await writeFile(
    join(dir, 'concat.txt'),
    Array.from({ length: SCENE_COUNT }, (_, index) => index + 1)
      .map((i) => `file 'scene-${i}.mp4'`)
      .join('\n'),
  );
  await runBinary(config.ffmpeg, [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-f',
    'concat',
    '-safe',
    '1',
    '-i',
    join(dir, 'concat.txt'),
    '-c',
    'copy',
    '-movflags',
    '+faststart',
    join(dir, 'video.mp4'),
  ]);
  const duration = await mediaDuration(join(dir, 'video.mp4'));
  const expected = durations.reduce((sum, value) => sum + value, 0);
  if (Math.abs(duration - expected) > DURATION_TOLERANCE)
    throw new Error('Rendered video duration does not match narration.');
  return duration;
}
