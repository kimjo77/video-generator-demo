export function encodeWav(pcm: Buffer, rate: number): Buffer {
  if (!Number.isInteger(rate) || rate < 8000 || rate > 48000)
    throw new Error('Narration has an invalid sample rate.');
  if (!pcm.length || pcm.length % 2 !== 0 || pcm.length > rate * 2 * 90)
    throw new Error('Narration generation: Gemini returned empty or oversized audio.');
  // Gemini generateContent TTS returns little-endian, signed 16-bit mono PCM.
  // Wrap it in WAV so ffprobe and FFmpeg can read its duration and sample rate.
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
