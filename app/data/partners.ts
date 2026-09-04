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
  /**
   * URL segment, and the logo filename. Lowercase, hyphens only.
   *
   * TREAT THIS AS PERMANENT once codes have been printed. The slug is what the
   * QR encodes, so renaming one silently breaks every card already posted with
   * it, and there is no fixing that after the fact.
   *
   * This is why the slugs are numbered rather than named after companies: the
   * `name` and the logo can be filled in or swapped at any point without
   * touching the URL, so codes can go to print before the partner list is
   * final. Assign a slug to a company and leave it assigned.
   */
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

export const PARTNERS: Partner[] = [
  { slug: 'partner-01', name: 'Safaricom' },
  { slug: 'partner-02', name: 'EthSwitch' },
  { slug: 'partner-03', name: 'ALX' },
  { slug: 'partner-04', name: 'Arifpay' },
  // Its wordmark is black type sitting on a solid yellow dome, so the white
  // knockout would turn both white and swallow the word. The yellow reads
  // perfectly well against the navy on its own.
  { slug: 'partner-05', name: 'Ride', keepColor: true },
  { slug: 'partner-06', name: 'Zeleman' },
  { slug: 'partner-07', name: 'Cactus' },
  { slug: 'partner-08', name: 'Guzo Tech' },
  { slug: 'partner-09', name: 'Noah Real Estate' },
  { slug: 'partner-10', name: 'Hosea Real Estate' },
  { slug: 'partner-11', name: 'Keste Damena' },
  { slug: 'partner-12', name: 'The Talent Firm' },
];

export function findPartner(slug: string): Partner | undefined {
  return PARTNERS.find((p) => p.slug === slug);
}
