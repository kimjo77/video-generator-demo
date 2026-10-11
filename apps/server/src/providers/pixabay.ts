import { z } from 'zod';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import type { SourceCredit } from '@frame/shared';
import { config } from '../config.js';

const photoSchema = z.object({
  hits: z.array(
    z.object({
      id: z.number().int(),
      pageURL: z.url(),
      user: z.string(),
      user_id: z.number().int(),
      largeImageURL: z.url(),
    }),
  ),
});
const cacheSchema = z.object({ createdAt: z.number(), data: photoSchema });
async function searchPhotos(query: string): Promise<z.infer<typeof photoSchema>> {
  const params = new URLSearchParams({
    q: query.slice(0, 100),
    image_type: 'photo',
    orientation: 'vertical',
    per_page: '3',
    safesearch: 'true',
    min_width: '720',
    min_height: '1280',
  });
  // Pixabay requires search responses to be cached for 24 hours. Never persist the key.
  const cacheDir = join(config.outputDir, 'image-cache');
  const cacheFile = join(
    cacheDir,
    `${createHash('sha256').update(params.toString()).digest('hex')}.json`,
  );
  try {
    const cached = cacheSchema.parse(JSON.parse(await readFile(cacheFile, 'utf8')));
    if (Date.now() - cached.createdAt < 24 * 60 * 60 * 1000) return cached.data;
  } catch {
    /* A missing or invalid cache is fetched again. */
  }
  params.set('key', config.pixabayKey);
  const response = await fetch(`https://pixabay.com/api/?${params}`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error('Pixabay request failed');
  const data = photoSchema.parse(await response.json());
  await mkdir(cacheDir, { recursive: true });
  await writeFile(cacheFile, JSON.stringify({ createdAt: Date.now(), data }));
  return data;
}
async function downloadPhoto(source: string): Promise<Buffer> {
  let url = new URL(source);
  for (let redirects = 0; redirects <= 3; redirects++) {
    if (url.protocol !== 'https:' || !['pixabay.com', 'cdn.pixabay.com'].includes(url.hostname))
      throw new Error('Unexpected media URL');
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: 'manual' });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('Invalid media redirect');
      url = new URL(location, url);
      continue;
    }
    if (
      !response.ok ||
      !response.headers.get('content-type')?.startsWith('image/') ||
      !response.body
    )
      throw new Error('Image download failed');
    if (Number(response.headers.get('content-length')) > 20_000_000) {
      await response.body.cancel();
      throw new Error('Image too large');
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 20_000_000) {
        await reader.cancel();
        throw new Error('Image too large');
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }
  throw new Error('Too many media redirects');
}
export async function fetchSceneImage(
  query: string,
  destination: string,
  scene: number,
): Promise<SourceCredit | null> {
  try {
    const photo = (await searchPhotos(query)).hits[0];
    if (!photo) return null;
    await writeFile(destination, await downloadPhoto(photo.largeImageURL));
    return {
      scene,
      photographer: photo.user,
      photographerUrl: `https://pixabay.com/users/${encodeURIComponent(photo.user)}-${photo.user_id}/`,
      photoUrl: photo.pageURL,
    };
  } catch {
    throw new Error(
      'Scene image retrieval failed. Check Pixabay credentials and provider availability.',
    );
  }
}
