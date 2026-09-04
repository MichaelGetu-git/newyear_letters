/**
 * Normalises the partner logos into public/partners/.
 *
 *   npm run partner-logos
 *
 * Reads from D:/Telegram Desktop/Logos/Logos (override with LOGO_SRC) and maps
 * each file onto the slug it belongs to via PARTNERS below.
 *
 * The point of this is optical sizing. The hero lockup constrains logo HEIGHT,
 * and these twelve run from 1.01:1 (Talent Firm, essentially square) to 6.12:1
 * (Ethswitch, a long wordmark). Setting one CSS height across that range makes
 * the square marks look like postage stamps next to the wide ones, because a
 * square logo at the same height carries a fraction of the ink.
 *
 * So each logo is scaled with a partial correction for its aspect ratio, then
 * centred on a canvas of fixed height. A wide wordmark ends up short and long, a
 * square mark tall and narrow, and both read at the same weight on the line. The
 * page then sets a single CSS height on every one and the balance holds.
 */
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';

const SRC = process.env.LOGO_SRC || 'D:/Telegram Desktop/Logos/Logos';
const OUT = new URL('../public/partners/', import.meta.url).pathname.replace(/^\//, '');
mkdirSync(OUT, { recursive: true });

// slug -> source filename, plus any per-logo correction. The slugs are fixed
// once a QR is printed against them, so companies are assigned to existing
// slots rather than the slugs being renamed to match. See app/data/partners.ts.
//
// alphaBoost multiplies the alpha channel. Only needed where a source file
// carries part of the mark on a half-transparent layer, which survives the
// page's white knockout as a ghost rather than as artwork.
const PARTNERS = [
  ['partner-01', 'Safaricom Logo.png'],
  // "SWITCH" is drawn at 35-70% alpha in the supplied file while "ETH" is
  // solid, so without this the second half of the wordmark fades out entirely
  // at the size the hero renders it. The multiplier is deliberately modest:
  // enough to make the body opaque, not so much that it hardens the
  // anti-aliased edges into jaggies.
  ['partner-02', 'Ethswitch Logo.png', { alphaBoost: 3.6 }],
  ['partner-03', 'ALX Logo.png'],
  ['partner-04', 'Afripay Logo.png'],
  // Black wordmark sitting on a solid yellow dome. Knocking it out turns both
  // white and the word disappears into the shape, so this one keeps its own
  // colours; the yellow holds up well against the navy on its own.
  ['partner-05', 'Ride Logo.png'],
  ['partner-06', 'Zeleman Logo.png'],
  ['partner-07', 'Cactus Logo.png'],
  ['partner-08', 'Guzo Tech Logo.png'],
  ['partner-09', 'Noah Logo.png'],
  ['partner-10', 'Hosea Real Estate  Logo.png'],
  ['partner-11', 'Keste Damena Logo.png'],
  ['partner-12', 'Talent Firm logo.png'],
];

// Canvas height, at 2x for retina. Every export is this tall and the art is
// centred inside it, which is the trick that lets ONE CSS height drive all
// twelve while each still renders at its own size.
const H = 160;

// How hard to correct for aspect ratio. 0 would size purely by height (square
// marks look tiny), 0.5 would equalise area outright. Area-equality turns out
// to be too aggressive for long wordmarks: it dropped EthSwitch's art to 11px
// tall at the size the hero renders, which is balanced on paper and illegible
// in practice. 0.3 keeps square and wide marks reading at the same weight
// without starving the wide ones of height.
const K = 0.3;
const REF_ASPECT = 3; // a typical wordmark, and so the middle of the range
// The art fills most of its canvas. The canvas is what the page sets a height
// on, so leaving slack in it shrinks the logo against the Zemenay wordmark
// beside it: at 0.66 a typical partner mark rendered smaller than the wordmark
// it is paired with, which read as the partner being the junior name.
const BASE_H = Math.round(H * 0.8);
const MIN_H = Math.round(H * 0.62);
const MAX_H = Math.round(H * 0.97);

// Anti-aliased edges and any half-opaque layer survive the page's white
// knockout as grey rather than white, which on the navy reads as a smudge.
// Lifting the mid-range of the alpha channel keeps the soft edges soft while
// making the body of a stroke properly solid.
const ALPHA_GAMMA = 0.7;

for (const [slug, file, opts = {}] of PARTNERS) {
  const src = readFileSync(`${SRC}/${file}`);

  // Trim first: several of these ship with a wide transparent margin baked in,
  // and normalising before trimming would size the padding rather than the art.
  const trimmed = await sharp(src).trim({ threshold: 1 }).png().toBuffer();
  const { width: tw, height: th } = await sharp(trimmed).metadata();

  const aspect = tw / th;
  const h = Math.round(
    Math.min(MAX_H, Math.max(MIN_H, BASE_H * (REF_ASPECT / aspect) ** K)),
  );
  const w = Math.round(h * aspect);

  let art = await sharp(trimmed).resize(w, h, { fit: 'fill' }).png().toBuffer();

  // Applied AFTER the resize, which is the whole trick. These sources are up to
  // 3300px wide and come down by a factor of six, and downsampling averages a
  // thin stroke against its transparent neighbours, so alpha corrected on the
  // original is spent again on the way down. Fixing it at final size holds.
  {
    const { data, info } = await sharp(art).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const boost = opts.alphaBoost ?? 1;
    for (let p = 3; p < data.length; p += 4) {
      if (data[p] === 0) continue;
      const lifted = (data[p] / 255) ** ALPHA_GAMMA * 255 * boost;
      data[p] = Math.min(255, Math.round(lifted));
    }
    art = await sharp(data, { raw: info }).png().toBuffer();
  }

  await sharp({
    create: { width: w, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: art, left: 0, top: Math.round((H - h) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}${slug}.png`);

  console.log(
    `  ${slug}  ${file.trim().padEnd(28)} ${tw}x${th} -> ${w}x${h} on ${w}x${H}`,
  );
}
