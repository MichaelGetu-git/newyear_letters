/**
 * Builds the story cards the share button hands to Instagram, Snapchat and the
 * rest.
 *
 *   npm run share-cards
 *
 * writes public/share/<slug>.jpg at 1080x1920, one per partner plus a generic.
 *
 * Why an image and not just the link: a story is a picture. Instagram will not
 * take a bare URL as a post at all, and Snapchat turns one into a plain text
 * snap nobody looks at. Handing the OS share sheet a ready-made 9:16 card is
 * what makes "share this to your story" a single tap instead of a screenshot
 * and a crop.
 *
 * The card is built from the same pieces as the hero — the fist bump, the
 * wordmark, the partner's logo, the falling adey abeba — so what gets posted
 * looks like the page it links to.
 */
import sharp from 'sharp';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { PARTNERS } from '../app/data/partners.ts';

const OUT = new URL('../public/share/', import.meta.url).pathname.replace(/^\//, '');
const ART = new URL('../public/art/', import.meta.url).pathname.replace(/^\//, '');
const LOGOS = new URL('../public/partners/', import.meta.url).pathname.replace(/^\//, '');
const BRAND = new URL('../public/brand-zemenay.svg', import.meta.url).pathname.replace(/^\//, '');
mkdirSync(OUT, { recursive: true });

const SITE = (process.env.SITE || 'https://newyear-letters.vercel.app').replace(/\/$/, '');
const W = 1080;
const H = 1920;

// Ebrima carries Ethiopic on Windows; Arial is the safe Latin fallback. Both
// were checked against a render before being relied on here.
const LATIN = 'Arial, Helvetica, sans-serif';
const ETHIOPIC = 'Ebrima, Nyala, sans-serif';

/** Paints any artwork solid white, keeping its alpha. Matches the page. */
async function knockout(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let p = 0; p < data.length; p += 4) {
    if (data[p + 3] > 0) {
      data[p] = 255;
      data[p + 1] = 255;
      data[p + 2] = 255;
    }
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

const zemenayMark = await knockout(
  await sharp(Buffer.from(readFileSync(BRAND, 'utf8').replace(/currentColor/g, '#ffffff')))
    .resize({ height: 74 })
    .png()
    .toBuffer(),
);

const fistL = readFileSync(`${ART}fist-left.png`);
const fistR = readFileSync(`${ART}fist-right.png`);
const flower = readFileSync(`${ART}adey.png`);

// Scattered flowers, fixed rather than random so every card is reproducible.
// All kept out of the band from y 430 to 820, where the headline and the
// greeting sit: a petal landing on the type reads as a mistake, not decoration.
const PETALS = [
  [70, 300, 84, -18], [950, 250, 66, 24], [58, 560, 54, 40],
  [1012, 690, 72, -12], [60, 1180, 70, 15], [980, 1120, 58, -30],
  [300, 190, 46, 8], [760, 165, 52, -22],
];

const cards = [{ slug: 'generic', name: null, url: `${SITE}/` }, ...PARTNERS.map((p) => ({
  slug: p.slug, name: p.name, keepColor: p.keepColor, url: `${SITE}/${p.slug}`,
}))];

for (const card of cards) {
  const layers = [];

  for (const [x, y, size, rot] of PETALS) {
    layers.push({
      input: await sharp(flower).resize(size, size).rotate(rot, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      }).png().toBuffer(),
      left: x - Math.round(size / 2),
      top: y,
      blend: 'over',
    });
  }

  // The bump, filling most of the width low in the frame.
  const pairW = 940;
  const halfW = Math.round(pairW / 2);
  const half = (buf) => sharp(buf).resize({ width: halfW }).png().toBuffer();
  const left = await half(fistL);
  const right = await half(fistR);
  const pairTop = 1120;
  layers.push({ input: left, left: Math.round((W - pairW) / 2), top: pairTop });
  layers.push({ input: right, left: Math.round((W - pairW) / 2) + halfW, top: pairTop });

  // The lockup: wordmark, cross, and the partner's mark (or "YOU").
  const markGap = 46;
  const zw = (await sharp(zemenayMark).metadata()).width;
  let partnerArt = null;
  let pw = 0;
  if (card.name && existsSync(`${LOGOS}${card.slug}.png`)) {
    const raw = await sharp(readFileSync(`${LOGOS}${card.slug}.png`)).resize({ height: 88 }).png().toBuffer();
    partnerArt = card.keepColor ? raw : await knockout(raw);
    pw = (await sharp(partnerArt).metadata()).width;
  }
  const crossW = 34;
  const youW = card.name ? pw : 150;
  const lockW = zw + markGap + crossW + markGap + youW;
  let cursor = Math.round((W - lockW) / 2);
  const lockY = 950;

  layers.push({ input: zemenayMark, left: cursor, top: lockY });
  cursor += zw + markGap;
  layers.push({
    input: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${crossW}" height="74"><text x="${crossW / 2}" y="52" text-anchor="middle" font-family="${LATIN}" font-size="40" fill="#ffcd68">&#10005;</text></svg>`,
    ),
    left: cursor,
    top: lockY,
  });
  cursor += crossW + markGap;
  if (partnerArt) {
    layers.push({ input: partnerArt, left: cursor, top: lockY - 7 });
  } else {
    layers.push({
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${youW}" height="74"><text x="0" y="52" font-family="${LATIN}" font-size="42" font-weight="bold" letter-spacing="9" fill="#d6e4ff">YOU</text></svg>`,
      ),
      left: cursor,
      top: lockY,
    });
  }

  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <text x="${W / 2}" y="470" text-anchor="middle" font-family="${LATIN}" font-size="30" letter-spacing="11" fill="#60a5fa">MESKEREM 1 &#183; 2019 E.C.</text>
    <text x="${W / 2}" y="640" text-anchor="middle" font-family="${LATIN}" font-size="132" font-weight="bold" letter-spacing="2" fill="#ffffff">PARTNERSHIP</text>
    <text x="${W / 2}" y="790" text-anchor="middle" font-family="${ETHIOPIC}" font-size="76" fill="#ffcd68">መልካም አዲስ ዓመት</text>
    <text x="${W / 2}" y="1780" text-anchor="middle" font-family="${LATIN}" font-size="30" letter-spacing="3" fill="#93aee0">${card.url.replace(/^https?:\/\//, '')}</text>
  </svg>`;
  layers.push({ input: Buffer.from(text), left: 0, top: 0 });

  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#001a47"/>
        <stop offset="0.55" stop-color="#00265f"/>
        <stop offset="1" stop-color="#001536"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.32" r="0.62">
        <stop offset="0" stop-color="#005bdb" stop-opacity="0.42"/>
        <stop offset="1" stop-color="#005bdb" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
  </svg>`);

  await sharp(bg).composite(layers).jpeg({ quality: 88, mozjpeg: true }).toFile(`${OUT}${card.slug}.jpg`);
  console.log(`  ${card.slug.padEnd(12)} ${card.name ?? 'generic'}`);
}

console.log(`\n  ${cards.length} story cards in public/share/`);
