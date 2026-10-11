import express from 'express';
import { TOPIC_MIN_LENGTH, TOPIC_MAX_LENGTH } from '@frame/shared';
import type { ErrorRequestHandler } from 'express';
import { join } from 'node:path';
import { z } from 'zod';
import { config, checkHealth } from './config.js';
import { createJob, getJob, isBusy } from './generation.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.get('/api/health', async (_req, res) => {
  res.json(await checkHealth());
});
const requestSchema = z
  .object({ topic: z.string().trim().min(TOPIC_MIN_LENGTH).max(TOPIC_MAX_LENGTH) })
  .strict();
app.post('/api/generations', async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Enter a topic between 3 and 180 characters.' });
    return;
  }
  if (isBusy()) {
    res
      .status(409)
      .json({ error: 'A video is already being generated. Please wait for it to finish.' });
    return;
  }
  const health = await checkHealth();
  if (health.status !== 'ready') {
    res.status(503).json({
      error: `Setup required: ${health.missing.join(', ')}. Configure the backend and restart it.`,
    });
    return;
  }
  // Check again after the async health check to keep concurrent submissions atomic.
  if (isBusy()) {
    res
      .status(409)
      .json({ error: 'A video is already being generated. Please wait for it to finish.' });
    return;
  }
  const job = createJob(parsed.data.topic);
  res.status(202).json({ id: job.id });
});
app.get('/api/generations/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    res
      .status(404)
      .json({ error: 'Video job not found. Local jobs reset when the backend restarts.' });
    return;
  }
  res.json(job);
});
app.get('/api/generations/:id/video', (req, res) => {
  const job = getJob(req.params.id);
  if (!job || job.status !== 'completed') {
    res.status(404).json({ error: 'This video is not available.' });
    return;
  }
  const path = join(config.outputDir, job.id, 'video.mp4');
  if (req.query.download === '1') res.download(path, `frame-${job.id.slice(0, 8)}.mp4`);
  else res.sendFile(path);
});
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});
const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (res.headersSent) return;
  const status =
    typeof error === 'object' && error && 'status' in error ? Number(error.status) : 500;
  res.status(status === 400 || status === 413 ? status : 500).json({
    error:
      status === 413
        ? 'Request is too large.'
        : status === 400
          ? 'Invalid JSON request.'
          : 'Unexpected server error. Please try again.',
  });
};
app.use(handleError);
const server = app.listen(config.port, '127.0.0.1', () => {
  console.log(`Frame API listening at http://localhost:${config.port}`);
  void checkHealth().then((health) => {
    if (health.missing.length) console.log(`Setup required: ${health.missing.join(', ')}`);
  });
});
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? 'Port 8000 is occupied. Stop the existing process before starting Frame.'
      : 'Backend failed to start.',
  );
  process.exit(1);
});
