import Image from 'next/image';
import type { Partner } from '../data/partners';
import { findLogo } from '../data/logo';

/**
 * The opening. PARTNERSHIP comes out of the screen at the viewer, then two
 * fists slide in from opposite edges, pull back, and bump. On contact the
 * knuckles throw a handful of adey abeba, which is where every flower falling
 * down the rest of the page comes from.
 *
 * All of it is CSS keyframes over server-rendered markup, so it plays on the
 * first painted frame instead of waiting for hydration.
 *
 * The generic letter names nobody: the lockup reads "Zemenay ✕ You", so one
 * link can go to every company on the list. A partner version passes `partner`
 * and their mark takes the place of the word.
 */

// One shared clock, so the burst, the ring and the note stay in step if the
// pacing of the opening is ever retuned.
const T = {
  headline: 0.15,
  fists: 0.8,
  fistsDur: 1.5,
  // 86% is the frame the knuckles meet in the bump keyframes.
  get impact() {
    return this.fists + this.fistsDur * 0.86;
  },
  get note() {
    return this.impact + 0.25;
  },
};

// Where each thrown flower ends up: [dx, dy, rotation, size in px, extra delay].
// Fixed rather than random, because the spray wants to stay balanced across the
// contact point and a seeded scatter is more machinery than nine values earn.
const BURST: [string, string, string, number, number][] = [
  ['-13rem', '-4.5rem', '-190deg', 30, 0],
  ['-9rem', '-8rem', '150deg', 22, 0.04],
  ['-5rem', '-9.5rem', '-120deg', 17, 0.09],
  ['-14rem', '2rem', '210deg', 20, 0.02],
  ['0rem', '-11rem', '170deg', 26, 0.06],
  ['5.5rem', '-9rem', '-160deg', 18, 0.09],
  ['9.5rem', '-7.5rem', '140deg', 24, 0.03],
  ['13.5rem', '-3.5rem', '-200deg', 29, 0],
  ['14rem', '2.5rem', '190deg', 19, 0.05],
];

export function Hero({ partner }: { partner?: Partner }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-[clamp(2.5rem,8vh,5rem)]">
      <div
        className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center"
        style={{ perspective: '1000px' }}
      >
        <p
          className="overline"
          style={{ animation: `rise 0.7s ease-out ${T.headline}s both` }}
        >
          Meskerem 1 &middot; 2019 E.C.
        </p>

        <h1
          className="mt-3 font-[family-name:var(--font-hero)] text-[clamp(2.5rem,11vw,7rem)] leading-[0.95] font-normal"
          style={{
            transformStyle: 'preserve-3d',
            animation: `arrive 1.35s cubic-bezier(0.16, 1, 0.3, 1) ${T.headline}s both`,
          }}
        >
          PARTNERSHIP
        </h1>

        {/* The greeting itself, at display size. It is the line that makes this
            read as coming from Addis rather than from anywhere, so it carries
            real weight instead of sitting below as a footnote. */}
        <p
          lang="am"
          className="mt-4 font-[family-name:var(--font-ethiopic)] text-[clamp(1.55rem,6.2vw,3.2rem)] leading-tight font-semibold text-gold"
          style={{ animation: `rise 0.9s ease-out ${T.headline + 0.6}s both` }}
        >
          መልካም አዲስ ዓመት
        </p>

        {/* The lockup. On the generic letter the second party is the word
            "You", which is what lets one link go to every company on the list.
            A partner version swaps in their own mark at the same optical size,
            so the line reads as the two companies side by side. */}
        <p
          className="dg mt-4 flex items-center gap-[clamp(0.75rem,3vw,1.5rem)] text-[clamp(0.72rem,2.2vw,0.95rem)] tracking-[0.28em] text-ink-2 uppercase"
          style={{ animation: `rise 0.8s ease-out ${T.headline + 0.9}s both` }}
        >
          <span>Zemenay</span>
          <span aria-hidden className="text-gold">
            &#10005;
          </span>
          {partner ? <PartnerMark partner={partner} /> : <span>You</span>}
        </p>
      </div>

      {/* The bump. The build step trims both drawings and pads each on its
          outer edge to a common half-width, so butting the two halves together
          lands the knuckles exactly on this container's centre line, which is
          where the ring and the flower burst below are anchored. */}
      <div className="pointer-events-none relative mt-[clamp(1rem,3vh,2.5rem)] flex w-[var(--pair)] shrink-0 justify-center">
        <Image
          src="/art/fist-left.png"
          alt="Two fists meeting in a bump"
          width={968}
          height={722}
          loading="eager"
          fetchPriority="high"
          className="w-1/2"
          style={{ animation: `bump-left ${T.fistsDur}s cubic-bezier(0.33, 0.9, 0.4, 1) ${T.fists}s both` }}
        />
        <Image
          src="/art/fist-right.png"
          alt=""
          width={968}
          height={722}
          loading="eager"
          fetchPriority="high"
          className="w-1/2"
          style={{ animation: `bump-right ${T.fistsDur}s cubic-bezier(0.33, 0.9, 0.4, 1) ${T.fists}s both` }}
        />

        {/* Everything below fires on the contact point rather than the box
            centre: the knuckles meet high in the artwork, with the forearms
            filling the lower half. */}
        <span
          aria-hidden
          className="absolute top-[30%] left-1/2 aspect-square w-[42%] rounded-full border border-gold"
          style={{ animation: `impact 1.1s ease-out ${T.impact}s both` }}
        />
        <span
          aria-hidden
          className="absolute top-[30%] left-1/2 aspect-square w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffcd6866_0%,transparent_70%)] blur-xl"
          // fade-in touches opacity only. `rise` would animate transform and
          // clobber the centring translate this element needs to keep.
          style={{ animation: `fade-in 1.2s ease-out ${T.impact}s both, glow-pulse 4.5s ease-in-out ${T.impact + 1.2}s infinite` }}
        />

        {/* The flowers the handshake throws. */}
        {BURST.map(([dx, dy, rot, size, lag], i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-[30%] left-1/2"
            style={{
              width: size,
              height: size,
              ['--dx' as string]: dx,
              ['--dy' as string]: dy,
              ['--rot' as string]: rot,
              animation: `burst 1.3s cubic-bezier(0.14, 0.8, 0.3, 1) ${T.impact + lag}s both`,
            }}
          >
            <Image src="/art/adey.png" alt="" width={256} height={256} className="h-full w-full" />
          </span>
        ))}
      </div>

      {/* The note, landing after the hands have met. */}
      <div
        className="relative z-10 mt-[clamp(1.25rem,3.5vh,2.25rem)] max-w-lg text-center"
        style={{ animation: `rise 0.9s ease-out ${T.note}s both` }}
      >
        <p className="text-[clamp(1rem,3.3vw,1.18rem)] leading-relaxed text-ink-2">
          Whatever we built this year, we did not build it alone. Here is to the
          next one, side by side.
        </p>
        <p className="overline mt-3 text-ink-3">From everyone at Zemenay</p>
      </div>
    </section>
  );
}

/**
 * A partner's logo in the hero lockup, standing where "You" does on the generic
 * letter.
 *
 * The file is looked up on disk at build time rather than guessed at, so a
 * partner whose logo has not been supplied yet falls back to their name set in
 * the same tracked capitals. That keeps a half-filled partner list shipping a
 * plainer page instead of a broken image, which matters because these links go
 * out one at a time as each logo arrives.
 */
function PartnerMark({ partner }: { partner: Partner }) {
  const logo = findLogo(partner.slug);

  if (!logo) {
    return <span>{partner.name}</span>;
  }

  return (
    // A plain <img>: the source is an arbitrary partner-supplied file, and
    // next/image would need dangerouslyAllowSVG turned on for the whole site to
    // handle the SVGs most brand kits ship. The height is fixed and the width
    // is auto, so there is no layout shift to protect against either.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={partner.name}
      // Knocked out to pure white unless the mark asks to keep its colours.
      // brightness(0) crushes any artwork to black whatever it started as, and
      // invert(1) lifts that to white, so every logo lands at the same weight
      // against the navy no matter what it looked like going in.
      // Taller than the tracked capitals beside it on purpose: a logo lockup
      // needs roughly twice the cap height of set type to carry the same weight
      // on the line, or it reads as a footnote next to ZEMENAY.
      className={`h-[clamp(1.3rem,4vw,2rem)] w-auto ${
        partner.keepColor ? '' : 'brightness-0 invert'
      }`}
    />
  );
}
