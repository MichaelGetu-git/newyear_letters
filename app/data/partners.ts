/**
 * The named versions of the letter, one per partner company.
 *
 * The generic letter at `/` is the one that goes out to everyone, and it stays
 * generic on purpose: it says "Zemenay ✕ You" and names nobody, so a single
 * link can be sent to any number of companies. These entries add a handful of
 * personalised versions alongside it at `/<slug>`, where the partner's own mark
 * replaces the word "You". Nothing else about the page changes.
 *
 * To add or change one:
 *   1. Drop the logo at `public/partners/<slug>.svg` (SVG preferred, PNG with
 *      transparency is fine).
 *   2. Add or edit the entry below.
 *   3. `npm run qr` regenerates the QR codes.
 *
 * A slug with no logo file falls back to the company name set in the same
 * tracked capitals the generic page uses for "You", so a missing file is a
 * plainer page rather than a broken one.
 */
export type Partner = {
  /** URL segment, and the logo filename. Lowercase, hyphens only. */
  slug: string;
  /** The company's name, used for the tab title and the image alt text. */
  name: string;
  /**
   * Logos are knocked out to pure white by default, which is what the original
   * announcement artwork does and the only treatment guaranteed to stay legible
   * on the deep navy. Set this when a mark genuinely needs its own colours and
   * has enough contrast to survive there.
   */
  keepColor?: boolean;
};

export const PARTNERS: Partner[] = Array.from({ length: 10 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return { slug: `partner-${n}`, name: `Partner ${n}` };
});

export function findPartner(slug: string): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug);
}
