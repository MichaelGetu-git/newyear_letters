/**
 * Writes ten stand-in partner marks to public/partners/.
 *
 * These exist so the personalised letters can be laid out and reviewed before
 * the real logos arrive. They are deliberately unbranded and read "PARTNER 01"
 * rather than borrowing a plausible company name, because a page that looks
 * like a finished announcement for a company Zemenay has not partnered with is
 * exactly the thing you do not want loose on a public URL.
 *
 * Each carries a different geometric mark so the ten versions are told apart at
 * a glance. Everything is drawn in currentColor-ish white; the page knocks the
 * artwork out to pure white anyway, so only the silhouette matters.
 *
 * Run with `npm run logos`. Delete a file and drop the real logo in its place
 * under the same name to swap one in.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../public/partners/', import.meta.url).pathname.replace(/^\//, '');
mkdirSync(OUT, { recursive: true });

// A different mark per slot, drawn inside a 40x40 box on a 0-40 grid.
const MARKS = [
  '<circle cx="20" cy="20" r="15" fill="none" stroke="#fff" stroke-width="4"/>',
  '<path d="M20 4 L36 33 H4 Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>',
  '<rect x="6" y="6" width="28" height="28" rx="4" fill="none" stroke="#fff" stroke-width="4"/>',
  '<path d="M20 3 L34 11 V29 L20 37 L6 29 V11 Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>',
  '<path d="M20 5 L27 20 L20 35 L13 20 Z" fill="#fff"/>',
  '<circle cx="14" cy="20" r="9" fill="none" stroke="#fff" stroke-width="4"/><circle cx="26" cy="20" r="9" fill="none" stroke="#fff" stroke-width="4"/>',
  '<path d="M6 34 L20 6 L34 34" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M12 26 H28" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
  '<rect x="6" y="6" width="12" height="12" fill="#fff"/><rect x="22" y="6" width="12" height="12" fill="#fff"/><rect x="6" y="22" width="12" height="12" fill="#fff"/>',
  '<path d="M20 4 A16 16 0 0 1 20 36 A8 8 0 0 1 20 20 A8 8 0 0 0 20 4" fill="#fff"/>',
  '<path d="M8 20 Q20 4 32 20 Q20 36 8 20 Z" fill="none" stroke="#fff" stroke-width="4"/>',
  '<path d="M20 6 L34 20 L20 34 L6 20 Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><circle cx="20" cy="20" r="4" fill="#fff"/>',
  '<path d="M10 8 V32 M20 14 V32 M30 6 V32" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
];

for (let i = 0; i < MARKS.length; i++) {
  const n = String(i + 1).padStart(2, '0');
  // 220x40 lockup: mark on the left, wordmark on the right, baseline aligned.
  // The letter-spacing matches the hero's tracked capitals so the stand-in sits
  // at the same optical weight a real logo will.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 40" width="220" height="40" role="img" aria-label="Partner ${n}">
  <g>${MARKS[i]}</g>
  <text x="52" y="27" fill="#fff" font-family="Inter, Helvetica, Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="2.4">PARTNER ${n}</text>
</svg>
`;
  writeFileSync(`${OUT}partner-${n}.svg`, svg);
  console.log(`  partner-${n}.svg`);
}
