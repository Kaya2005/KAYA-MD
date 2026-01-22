

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

/**
 * Run FFmpeg on a buffer
 * @param {Buffer} buffer Input buffer
 * @param {Array} args FFmpeg arguments
 * @param {String} ext Input extension
 * @param {String} ext2 Output extension
 * @returns {Promise<Buffer>}
 */
export function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      const tempDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const tmp = path.join(tempDir, Date.now() + '.' + ext);
      const out = tmp + '.' + ext2;

      await fs.promises.writeFile(tmp, buffer);

      spawn('ffmpeg', ['-y', '-i', tmp, ...args, out])
        .on('error', reject)
        .on('close', async (code) => {
          try {
            await fs.promises.unlink(tmp);
            if (code !== 0) return reject(`FFmpeg exited with code ${code}`);
            const result = await fs.promises.readFile(out);
            await fs.promises.unlink(out);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Convert Audio to WhatsApp playable MP3
 */
export function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-ac', '2',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'mp3'
  ], ext, 'mp3');
}

/**
 * Convert Audio to WhatsApp PTT (Opus)
 */
export function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus');
}

/**
 * Convert Video buffer to WhatsApp playable MP4
 */
export function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4');
}