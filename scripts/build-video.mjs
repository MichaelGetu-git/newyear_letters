/**
 * Compresses a project video to fit a card.
 *
 *   node scripts/build-video.mjs <input> <id> [--wide]
 *
 * writes public/projects/<id>.mp4. Audio is always dropped: the cards play
 * muted and looping, so anything on that track is weight nobody can ever hear.
 *
 * Worth actually running. Footage arrives at 1080p and several megabits, and
 * the first clip dropped in here was 37MB on its own, more than twenty times
 * the weight of every other asset on the page put together.
 *
 * SHAPE is the part that matters, and the reason this script exists rather than
 * a one-line ffmpeg incantation. The cards are 4:5, and the video fills them
 * with object-cover, so feeding a 16:9 clip straight in throws away 55% of its
 * width — which for a promo cut with content out at the left and right edges
 * means whole phone mockups vanish off the sides. So by default the full frame
 * is scaled to the card's width and padded out to 4:5 in the clip's own
 * background colour, sampled from a real frame rather than guessed. Nothing is
 * cropped, and because the pad matches the backdrop the join is invisible.
 *
 * Pass --wide for a clip going in the first slot, which spans two columns and
 * crops to 16:9 on a wide screen.
 *
 * Keep the full-resolution master outside public/ (media-src/ is gitignored)
 * so it is never deployed but never lost either.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const args = process.argv.slice(2);
const wide = args.includes('--wide');
const [input, id] = args.filter((a) => !a.startsWith('--'));

if (!input || !id) {
  console.error('usage: node scripts/build-video.mjs <input> <id> [--wide]');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`no such file: ${input}`);
  process.exit(1);
}

const run = (a) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...a]);
const out = `public/projects/${id}.mp4`;
const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2);

// The encode itself. CRF 30 is well inside "no visible difference" for screen
// recordings and motion graphics, which is all these clips are.
const encode = ['-c:v', 'libx264', '-profile:v', 'high', '-crf', '30', '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  // Index at the front, so playback can start before the file has fully landed.
  '-movflags', '+faststart',
  '-an'];

let filter;
if (wide) {
  filter = 'scale=1000:-2';
} else {
  // Sample the backdrop from a frame a little way in, so the pad colour is the
  // clip's own rather than whatever an opening fade happens to be showing.
  const tmp = mkdtempSync(join(tmpdir(), 'zem-'));
  const probe = join(tmp, 'frame.png');
  run(['-ss', '00:00:05', '-i', input, '-frames:v', '1', probe]);
  const { data, info } = await sharp(probe).raw().toBuffer({ resolveWithObject: true });
  const corner = [data[0], data[1], data[2]];
  const bg = corner.map((c) => c.toString(16).padStart(2, '0')).join('');
  console.log(`  backdrop sampled as #${bg.toUpperCase()} (${info.width}x${info.height} frame)`);

  const W = 800;
  const H = 1000; // 4:5, the card's shape
  // Offset above centre: the card lays a dark scrim over its bottom third for
  // the title, and content sitting in it goes muddy.
  filter = `scale=${W}:-2,pad=${W}:${H}:0:210:0x${bg}`;
}

run(['-i', input, '-vf', filter, ...encode, out]);

console.log(`  ${input}  ${mb(input)}MB  ->  ${out}  ${mb(out)}MB  ${wide ? '16:9' : '4:5'}`);
