import type { CreateGenerationResponse, GenerationJob, HealthResponse } from '@frame/shared';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function request<T>(path: string, init: RequestInit = {}, timeoutMs = 10_000): Promise<T> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  try {
    const response = await fetch(path, { ...init, signal });
    let data: unknown;
    try {
      data = await response.json();
    } catch (cause) {
      if (signal.aborted) throw cause;
      throw new ApiRequestError(
        `The backend returned an unreadable response (HTTP ${response.status}). Check the API connection and try again.`,
        response.status,
      );
    }
    if (!response.ok)
      throw new ApiRequestError(
        typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
          ? data.error
          : `Request failed (HTTP ${response.status}). Please try again.`,
        response.status,
      );
    return data as T;
  } catch (cause) {
    if (init.signal?.aborted) throw cause;
    if (timeout.aborted)
      throw new ApiRequestError(
        init.method === 'POST'
          ? 'The request timed out. Your video may still be processing. Wait before trying again.'
          : 'The backend took too long to respond. Check the connection and try again.',
        0,
      );
    if (cause instanceof ApiRequestError) throw cause;
    throw new Error('Cannot reach the backend. Check that the API is running on localhost:8000.', {
      cause,
    });
  }
}
export const api = {
  health: (signal?: AbortSignal) => request<HealthResponse>('/api/health', { signal }),
  create: (topic: string, signal?: AbortSignal) =>
    request<CreateGenerationResponse>(
      '/api/generations',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
        signal,
      },
      15_000,
    ),
  job: (id: string, signal?: AbortSignal) =>
    request<GenerationJob>(`/api/generations/${encodeURIComponent(id)}`, { signal }),
};
