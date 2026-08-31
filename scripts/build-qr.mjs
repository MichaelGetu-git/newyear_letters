/**
 * Writes one QR code per letter into qr/, plus a contact sheet to check them
 * against before anything goes to print.
 *
 * Eleven codes: the generic letter, and one per partner. Run with `npm run qr`,
 * or point it somewhere else with `SITE=https://... npm run qr`.
 *
 * Two files per letter:
 *   <slug>.svg   vector, for print. Use this one on anything physical.
 *   <slug>.png   1024px raster, for slides, email and messaging apps.
 *
 * The output is NOT committed: these are build artefacts derived entirely from
 * partners.ts and the site URL, and regenerating them takes a second.
 */
import QRCode from 'qrcode';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { PARTNERS } from '../app/data/partners.ts';

const SITE = (process.env.SITE || 'https://newyear-letters.vercel.app').replace(/\/$/, '');
const OUT = new URL('../qr/', import.meta.url).pathname.replace(/^\//, '');
mkdirSync(OUT, { recursive: true });

// Zemenay navy on white. Dark-on-light is not a style choice: virtually every
// scanner expects the dark modules to be the data, and inverting it makes a
// code that many phones simply will not read.
const COLOR = { dark: '#001a47ff', light: '#ffffffff' };

// Error correction M survives a scuff or a fold on a printed card while keeping
// the module count low enough that these stay readable when printed small. H
// would tolerate more damage but makes a denser code for no gain here, since
// nothing is being overprinted onto the middle of it.
const OPTIONS = { errorCorrectionLevel: 'M', margin: 2, color: COLOR };

const letters = [
  { slug: 'generic', label: 'Generic letter', url: `${SITE}/` },
  ...PARTNERS.map((p) => ({ slug: p.slug, label: p.name, url: `${SITE}/${p.slug}` })),
];

const tiles = [];
for (const { slug, label, url } of letters) {
  writeFileSync(`${OUT}${slug}.svg`, await QRCode.toString(url, { ...OPTIONS, type: 'svg' }));
  const png = await QRCode.toBuffer(url, { ...OPTIONS, width: 1024 });
  writeFileSync(`${OUT}${slug}.png`, png);
  tiles.push({ label, url, png });
  console.log(`  ${slug.padEnd(12)} ${url}`);
}

// Contact sheet: every code with its destination printed underneath, so the
// pairing can be checked by eye before ten different codes go onto ten
// different envelopes. Getting these crossed is the one mistake in this whole
// job that cannot be undone after posting.
const CELL = 300;
const CAPTION = 46;
const COLS = 4;
const rows = Math.ceil(tiles.length / COLS);
const label = (text, sub) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CELL}" height="${CAPTION}">
      <text x="${CELL / 2}" y="17" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#001a47">${text}</text>
      <text x="${CELL / 2}" y="35" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#5a6a8a">${sub}</text>
    </svg>`,
  );

const composite = [];
for (let i = 0; i < tiles.length; i++) {
  const x = (i % COLS) * CELL;
  const y = Math.floor(i / COLS) * (CELL + CAPTION);
  composite.push({
    input: await sharp(tiles[i].png).resize(CELL - 24, CELL - 24).toBuffer(),
    left: x + 12,
    top: y + 12,
  });
  composite.push({
    input: label(tiles[i].label, tiles[i].url.replace(/^https?:\/\//, '')),
    left: x,
    top: y + CELL - 10,
  });
}

await sharp({
  create: {
    width: COLS * CELL,
    height: rows * (CELL + CAPTION),
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite(composite)
  .png()
  .toFile(`${OUT}contact-sheet.png`);

console.log(`\n  ${tiles.length} codes + contact-sheet.png in qr/`);
