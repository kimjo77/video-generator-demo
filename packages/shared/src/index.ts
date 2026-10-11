export const SCENE_COUNT = 3;
export const TOPIC_MIN_LENGTH = 3;
export const TOPIC_MAX_LENGTH = 180;

export type GenerationStage = 'queued' | 'script' | 'images' | 'voice' | 'render' | 'complete';
export type GenerationStatus = 'queued' | 'running' | 'completed' | 'failed';
export interface SourceCredit {
  scene: number;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
}
export interface Scene {
  title: string;
  narration: string;
  imageQuery: string;
}
export interface GenerationResult {
  title: string;
  videoUrl: string;
  downloadUrl: string;
  duration: number;
  credits: SourceCredit[];
  fallbackScenes: number[];
  scenes: Scene[];
}
export interface GenerationJob {
  id: string;
  topic: string;
  status: GenerationStatus;
  stage: GenerationStage;
  createdAt: string;
  error?: string;
  result?: GenerationResult;
}
export interface HealthResponse {
  status: 'ready' | 'setup-required';
  checks: { gemini: boolean; pixabay: boolean; ffmpeg: boolean; ffprobe: boolean; font: boolean };
  missing: string[];
}
export interface CreateGenerationRequest {
  topic: string;
}
export interface CreateGenerationResponse {
  id: string;
}
export interface ApiError {
  error: string;
}
