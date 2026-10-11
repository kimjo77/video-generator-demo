import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { GenerationJob, SourceCredit } from '@frame/shared';
import { config } from './config.js';
import { createScript, createSpeech } from './providers/gemini.js';
import { fetchSceneImage } from './providers/pixabay.js';
import { audioDuration, combineScenes, renderScene } from './render.js';

const jobs = new Map<string, GenerationJob>();
let busy = false;
export function isBusy() {
  return busy;
}
export function getJob(id: string) {
  return jobs.get(id);
}
export function createJob(topic: string): GenerationJob {
  if (busy) throw new Error('A video is already being generated. Please wait for it to finish.');
  const job: GenerationJob = {
    id: randomUUID(),
    topic,
    status: 'queued',
    stage: 'queued',
    createdAt: new Date().toISOString(),
  };
  jobs.set(job.id, job);
  busy = true;
  void generate(job).finally(() => {
    busy = false;
  });
  return job;
}
async function generate(job: GenerationJob) {
  try {
    const dir = join(config.outputDir, job.id);
    await mkdir(dir, { recursive: true });
    job.status = 'running';
    job.stage = 'script';
    const script = await createScript(job.topic);
    await writeFile(join(dir, 'script.json'), JSON.stringify(script, null, 2));
    const credits: SourceCredit[] = [];
    const fallbackScenes: number[] = [];
    job.stage = 'images';
    for (const [index, scene] of script.scenes.entries()) {
      const credit = await fetchSceneImage(
        scene.imageQuery,
        join(dir, `image-${index + 1}.jpg`),
        index + 1,
      );
      if (credit) credits.push(credit);
      else fallbackScenes.push(index + 1);
    }
    job.stage = 'voice';
    const durations: number[] = [];
    for (const [index, scene] of script.scenes.entries()) {
      const voicePath = join(dir, `voice-${index + 1}.wav`);
      await createSpeech(scene.narration, voicePath);
      durations.push(await audioDuration(voicePath));
    }
    job.stage = 'render';
    for (const [index, scene] of script.scenes.entries()) {
      await renderScene(
        dir,
        index,
        scene,
        !fallbackScenes.includes(index + 1),
        durations[index]!,
        script.title,
      );
    }
    const duration = await combineScenes(dir, durations);
    job.result = {
      title: script.title,
      videoUrl: `/api/generations/${job.id}/video`,
      downloadUrl: `/api/generations/${job.id}/video?download=1`,
      duration,
      credits,
      fallbackScenes,
      scenes: script.scenes,
    };
    await writeFile(join(dir, 'result.json'), JSON.stringify(job.result, null, 2));
    job.status = 'completed';
    job.stage = 'complete';
  } catch (error) {
    job.status = 'failed';
    job.error =
      error instanceof Error ? error.message : 'Video generation failed. Please try again.';
  }
}
