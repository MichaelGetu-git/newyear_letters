/**
 * Compresses a project video for the cards.
 *
 *   node scripts/build-video.mjs <input> <id>
 *
 * writes public/projects/<id>.mp4 at the same spec as the rest of the deck:
 * 1000px wide, h264, and no audio track at all, because the cards play muted
 * and looping so anything on that track is weight nobody can ever hear.
 *
 * Worth actually running. Phone footage arrives at 1080p and several megabits,
 * and the first clip dropped in here was 37MB — on its own, more than twenty
 * times the weight of every other asset on the page put together. It came out
 * at 1.9MB through this with no visible loss.
 *
 * Keep the full-resolution master outside public/ (media-src/ is gitignored)
 * so it is never deployed but never lost either.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

const [input, id] = process.argv.slice(2);
if (!input || !id) {
  console.error('usage: node scripts/build-video.mjs <input> <id>');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`no such file: ${input}`);
  process.exit(1);
}

const out = `public/projects/${id}.mp4`;
const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2);

execFileSync(
  ffmpeg,
  [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', input,
    '-vf', 'scale=1000:-2',
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '30', '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    // Puts the index at the front so the browser can start playing before the
    // whole file has arrived.
    '-movflags', '+faststart',
    '-an',
    out,
  ],
  { stdio: 'inherit' },
);

console.log(`  ${input}  ${mb(input)}MB  ->  ${out}  ${mb(out)}MB`);
