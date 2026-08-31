/**
 * Turns the raw source artwork into the web assets under public/art. Run with
 * `npm run art`. The outputs are committed, so this only needs re-running when
 * a source image changes.
 *
 * Sources:
 *   public/media/left.png, right.png   the two fists, already cut out
 * and the illustration pack in ART_PACK:
 *   3.png  the woman standing in the adey abeba
 *   4.png  a drift of small blue flowers
 *   5.png  a close-up cluster of blooms
 *   6.png  a tall field of adey abeba, cut out against transparency
 *   7.png  a single adey abeba, cut out
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

// The commissioned illustration pack: cut-out flowers, fields and the figure.
const PACK = process.env.ART_PACK || 'D:/Telegram Desktop/Adeweb Developer Africa';
const OUT = new URL('../public/art/', import.meta.url).pathname.replace(/^\//, '');
mkdirSync(OUT, { recursive: true });

const log = (name, r) =>
  console.log(`  ${name.padEnd(20)} ${r.width}x${r.height}  ${(r.size / 1024).toFixed(0)}kb`);

/* ── 1. The two fists ───────────────────────────────────────────────────────
   The hero pair, composed from the two supplied cut-outs in public/media/.

   Those arrive as separate drawings with their own margins and their own
   widths, so they cannot simply be dropped into the page side by side: the
   knuckles would meet wherever the transparent padding happened to put them.
   They are trimmed to their real content, cropped through one shared vertical
   window so both fists sit at the same height, and then each is padded on its
   OUTER edge to a common half-width. Butting the two exported halves together
   therefore lands the knuckles exactly on the pair's centre line, which is
   where the hero fires the impact ring and the flower burst.

   Reading the sources out of public/ rather than a folder on one machine means
   `npm run art` reproduces the hero from the repository alone. */
async function fists() {
  const SCALE = 2; // export at 2x so the hero stays crisp on retina
  const IN = new URL('../public/media/', import.meta.url).pathname.replace(/^\//, '');

  // Anything fainter than this is cut-out fringing rather than drawing, and
  // including it would pad the trim with a halo of near-invisible pixels.
  const OPAQUE = 40;

  const load = async (name) => {
    const { data, info } = await sharp(`${IN}${name}.png`)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;

    // Label every connected blob of drawing, keep the biggest, erase the rest.
    // Cut-outs arrive with stray specks left behind by whoever masked them, and
    // those are worse than cosmetic here: the trim below measures the alpha
    // bounding box, so one stray pixel out near an edge silently pads the crop
    // and pushes the knuckles away from the seam. A fist is a single connected
    // shape, so nothing real is ever lost by dropping the smaller blobs.
    const solid = (p) => data[p * 4 + 3] > OPAQUE;
    const label = new Int32Array(w * h).fill(-1);
    let biggest = -1;
    let biggestArea = 0;
    let next = 0;

    for (let seed = 0; seed < w * h; seed++) {
      if (label[seed] !== -1 || !solid(seed)) continue;
      const id = next++;
      const stack = [seed];
      label[seed] = id;
      let area = 0;
      const visit = (q) => {
        if (label[q] !== -1 || !solid(q)) return;
        label[q] = id;
        stack.push(q);
      };
      while (stack.length) {
        const p = stack.pop();
        area++;
        const x = p % w;
        const y = (p / w) | 0;
        if (x > 0) visit(p - 1);
        if (x < w - 1) visit(p + 1);
        if (y > 0) visit(p - w);
        if (y < h - 1) visit(p + w);
      }
      if (area > biggestArea) {
        biggestArea = area;
        biggest = id;
      }
    }

    let cleared = 0;
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let p = 0; p < w * h; p++) {
      if (label[p] === -1) continue;
      if (label[p] !== biggest) {
        data[p * 4 + 3] = 0;
        cleared++;
        continue;
      }
      const x = p % w;
      const y = (p / w) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    if (cleared) console.log(`  (${name}: cleared ${cleared} stray px)`);

    return { name, data, w, h, x0, x1, y0, y1 };
  };

  const left = await load('left');
  const right = await load('right');

  // One vertical window for both, so their existing alignment is preserved
  // rather than each being trimmed to its own top edge and drifting apart.
  const top = Math.min(left.y0, right.y0);
  const bottom = Math.max(left.y1, right.y1);
  const height = bottom - top + 1;

  const leftW = left.x1 - left.x0 + 1;
  const rightW = right.x1 - right.x0 + 1;
  const halfW = Math.max(leftW, rightW);

  for (const [name, src, box, offset] of [
    // The left fist's knuckles are its right edge, so it is pushed flush right
    // against the seam; the right fist's are its left edge, so it sits flush
    // left. The padding goes on the far side in each case.
    ['fist-left', left, { left: left.x0, top, width: leftW, height }, halfW - leftW],
    ['fist-right', right, { left: right.x0, top, width: rightW, height }, 0],
  ]) {
    const cut = await sharp(src.data, { raw: { width: src.w, height: src.h, channels: 4 } })
      .extract(box)
      .png()
      .toBuffer();

    // Two passes, and it has to be two: sharp runs resize BEFORE composite
    // within a single pipeline, so chaining them here would enlarge the empty
    // canvas first and then paste the fist into it at its original size,
    // leaving the drawing sitting in one corner at half scale.
    const placed = await sharp({
      create: {
        width: halfW,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: cut, left: offset, top: 0 }])
      .png()
      .toBuffer();

    const r = await sharp(placed)
      .resize({ width: halfW * SCALE, kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toFile(`${OUT}${name}.png`);
    log(`${name}.png`, r);
  }
}

/* ── 2. The falling adey abeba ──────────────────────────────────────────────
   The cut-out flower, plus its blue twin for the halfway colour change. */
async function adey() {
  const SIZE = 320; // the sprite never renders above ~52px on the page

  const lit = await sharp(`${PACK}/7.png`)
    .trim({ threshold: 1 })
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  log('adey.png', await sharp(lit).toFile(`${OUT}adey.png`));

  // Brightness remapped onto a blue ramp rather than hue-rotated. The petal is
  // so saturated that rotating its hue lands on a green nobody would call
  // Zemenay blue; mapping luminance keeps the shading and guarantees the brand
  // colour. The top of the ramp stops well short of white, because at the
  // petals' resting opacity a pale highlight reads as a grey snowflake.
  const SHADOW = [0x00, 0x22, 0x5c];
  const MID = [0x00, 0x54, 0xcc];
  const HI = [0x5c, 0x9b, 0xff];
  const { data, info } = await sharp(lit).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    const [a, b, t] = l < 0.5 ? [SHADOW, MID, l * 2] : [MID, HI, (l - 0.5) * 2];
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(a[c] + (b[c] - a[c]) * t);
  }
  const blue = await sharp(data, { raw: info })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}adey-blue.png`);
  log('adey-blue.png', blue);
}

/* ── 3. The growing meadow band ─────────────────────────────────────────────
   A cut-out field for the foot of the page, assembled wide from one tall
   source. The whole point of the image is the ragged top edge where stems and
   heads break into open sky, so it must never be stretched flat. */
async function meadow() {
  const W = 1920;
  const H = 640;

  const src = await sharp(`${PACK}/6.png`).trim({ threshold: 1 }).toBuffer();
  const { width, height } = await sharp(src).metadata();

  // Drop the bottom third first. Those huge out-of-focus foreground blooms are
  // single smooth shapes, so wherever a tile boundary cuts one the seam is
  // impossible to miss; the fine-grained field above tiles without a join.
  const body = await sharp(src)
    .extract({ left: 0, top: 0, width, height: Math.round(height * 0.66) })
    .toBuffer();

  // Every copy is anchored to the bottom so the ground line stays solid. The
  // varying scales and the flips are what stop the broken top edge from
  // visibly repeating across the width.
  // [x on the band, scale, flip, where along the source this copy is cut from].
  // That last number is what stops the skyline repeating. Flipping and
  // rescaling one identical crop still puts the same tall flowers at the same
  // relative spot in every copy, which reads as a regular scalloped wave across
  // the width; taking a different window of the field each time gives each copy
  // a different skyline to contribute.
  // Cutting a narrower window makes each copy narrower too, so they are spaced
  // more tightly than the full-width version needed. The spacing has to leave
  // every neighbouring pair overlapping by more than FEATHER below, or the
  // cross-fade runs out before the next copy has arrived and the seam comes
  // back as a thin gap.
  const steps = [
    [0, 1.0, false, 0.0],
    [200, 0.86, true, 0.55],
    [400, 0.95, false, 0.2],
    [600, 0.82, true, 0.85],
    [800, 0.92, false, 0.35],
    [1000, 0.88, true, 0.05],
    [1200, 0.97, false, 0.7],
    [1400, 0.84, true, 0.45],
    [1600, 1.0, false, 0.15],
  ];
  const WINDOW = 0.72; // fraction of the source width each copy is cut from

  // How far in from each vertical edge a tile fades to nothing. Without this
  // the band shows rectangular blocks on a wide screen: the field is full of
  // semi-transparent out-of-focus background between the flowers, and wherever
  // two tiles overlap that haze stacks and doubles in density. The tile's own
  // bounding box then draws the join as a hard vertical line. Ramping the alpha
  // at the edges makes overlaps cross-fade instead of accumulate.
  // It has to be wide enough that no ramp ever fully clears before the next
  // tile's has begun, or the seam reappears as a gap rather than a ridge.
  const FEATHER = 150;

  const bodyW = width;
  const bodyH = Math.round(height * 0.66);
  const winW = Math.round(bodyW * WINDOW);

  const tiles = [];
  for (const [left, scale, flip, xFrac] of steps) {
    let t = sharp(body)
      .extract({
        left: Math.round((bodyW - winW) * xFrac),
        top: 0,
        width: winW,
        height: bodyH,
      })
      .resize({ height: Math.round(H * scale) });
    if (flip) t = t.flop();
    const buf = await t.png().toBuffer();
    const { width: tw, height: th } = await sharp(buf).metadata();

    // A mask whose alpha ramps in from each side, multiplied into the tile.
    // `dest-in` keeps the destination weighted by the mask's alpha, which is
    // exactly alpha = tile.alpha * ramp.
    // The band's own two ends keep hard edges. They sit outside the viewport
    // once the image is scaled to cover the width, and fading them would thin
    // the field to nothing exactly where the screen edge cuts it.
    const isFirst = left === steps[0][0];
    const isLast = left === steps[steps.length - 1][0];

    const ramp = Buffer.alloc(tw * th * 4);
    for (let x = 0; x < tw; x++) {
      const fromLeft = isFirst ? Infinity : x;
      const fromRight = isLast ? Infinity : tw - 1 - x;
      const a = Math.round(255 * Math.min(1, Math.min(fromLeft, fromRight) / FEATHER));
      for (let y = 0; y < th; y++) {
        const p = (y * tw + x) * 4;
        ramp[p] = ramp[p + 1] = ramp[p + 2] = 255;
        ramp[p + 3] = a;
      }
    }
    const input = await sharp(buf)
      .composite([{ input: ramp, raw: { width: tw, height: th, channels: 4 }, blend: 'dest-in' }])
      .png()
      .toBuffer();

    tiles.push({ input, left, top: H - th });
  }

  const r = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(tiles)
    .webp({ quality: 82, alphaQuality: 100, effort: 6 })
    .toFile(`${OUT}meadow-grow.webp`);
  log('meadow-grow.webp', r);
}

/* ── 4. The figure, the drift, and the blur ─────────────────────────────────
   WebP throughout. These are large-format artwork carrying alpha, and PNG
   cannot compress photographic colour: the meadow band alone came to 4.7MB as
   a PNG, more than the rest of the page put together. */
async function extras() {
  log(
    'woman.webp',
    await sharp(`${PACK}/3.png`)
      .trim({ threshold: 1 })
      .resize({ height: 1150 })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toFile(`${OUT}woman.webp`),
  );

  log(
    'blue-drift.webp',
    await sharp(`${PACK}/4.png`)
      .trim({ threshold: 1 })
      .resize({ width: 1400 })
      .webp({ quality: 88, alphaQuality: 100, effort: 6 })
      .toFile(`${OUT}blue-drift.webp`),
  );

  // The close-up cluster thrown well out of focus, for behind the presenter.
  // Flattened onto brand blue before blurring, so its transparent ground does
  // not bleed grey haloes into the petals.
  log(
    'bloom-blur.webp',
    await sharp(`${PACK}/5.png`)
      .trim({ threshold: 1 })
      .resize(1400, 1000, { fit: 'cover' })
      .flatten({ background: '#00307a' })
      .blur(28)
      .modulate({ saturation: 0.9 })
      .webp({ quality: 72 })
      .toFile(`${OUT}bloom-blur.webp`),
  );
}

await fists();
await adey();
await meadow();
await extras();
