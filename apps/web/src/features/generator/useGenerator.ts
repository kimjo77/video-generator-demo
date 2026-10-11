import { useCallback, useEffect, useRef, useState } from 'react';
import {
  TOPIC_MIN_LENGTH,
  TOPIC_MAX_LENGTH,
  type GenerationJob,
  type HealthResponse,
} from '@frame/shared';
import { api, ApiRequestError } from '../../lib/api';
export function useGenerator() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const healthController = useRef<AbortController | null>(null);
  const submissionController = useRef<AbortController | null>(null);
  const busy = submitting || job?.status === 'running' || job?.status === 'queued';
  const refreshHealth = useCallback(async () => {
    healthController.current?.abort();
    const controller = new AbortController();
    healthController.current = controller;
    setHealthLoading(true);
    try {
      const next = await api.health(controller.signal);
      if (controller.signal.aborted) return;
      setHealth(next);
      setError('');
    } catch {
      if (controller.signal.aborted) return;
      setHealth(null);
      setError('Cannot reach the backend. Start the API on localhost:8000, then check again.');
    } finally {
      if (!controller.signal.aborted) setHealthLoading(false);
    }
  }, []);
  useEffect(() => {
    void refreshHealth();
    return () => {
      healthController.current?.abort();
      submissionController.current?.abort();
    };
  }, [refreshHealth]);
  const id = job?.id;
  const active = job?.status === 'running' || job?.status === 'queued';
  useEffect(() => {
    if (!id || !active) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const next = await api.job(id!, controller.signal);
        if (controller.signal.aborted) return;
        setJob(next);
        setError('');
        if (next.status === 'running' || next.status === 'queued')
          timer = setTimeout(() => {
            void poll();
          }, 1500);
      } catch (caught) {
        if (controller.signal.aborted) return;
        if (caught instanceof ApiRequestError && caught.status === 404) {
          setError('');
          setJob((previous) =>
            previous ? { ...previous, status: 'failed', error: caught.message } : previous,
          );
          return;
        }
        setError('Connection interrupted. Reconnecting to your video job…');
        timer = setTimeout(() => {
          void poll();
        }, 3000);
      }
    }
    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [id, active]);
  async function generate(topic: string) {
    if (submittingRef.current || busy) return;
    const trimmedTopic = topic.trim();
    if (trimmedTopic.length < TOPIC_MIN_LENGTH || trimmedTopic.length > TOPIC_MAX_LENGTH) {
      setError(`Enter a topic between ${TOPIC_MIN_LENGTH} and ${TOPIC_MAX_LENGTH} characters.`);
      return;
    }
    const controller = new AbortController();
    submissionController.current = controller;
    submittingRef.current = true;
    setSubmitting(true);
    setJob(null);
    setError('');
    try {
      const result = await api.create(trimmedTopic, controller.signal);
      if (controller.signal.aborted) return;
      setJob({
        id: result.id,
        topic: trimmedTopic,
        status: 'queued',
        stage: 'queued',
        createdAt: new Date().toISOString(),
      });
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(
        caught instanceof Error ? caught.message : 'Could not start generation. Please try again.',
      );
    } finally {
      submittingRef.current = false;
      if (!controller.signal.aborted) setSubmitting(false);
    }
  }
  return { health, healthLoading, job, busy, error, generate, refreshHealth };
}
