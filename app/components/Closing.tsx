import Image from 'next/image';
import { Reveal } from './Reveal';
import { ZemenayLogo } from './ZemenayLogo';

/**
 * Where to find us, standing in the adey abeba.
 *
 * The page has spent its whole length warming from navy toward green, and this
 * is where it arrives: a cut-out field growing up off the bottom edge, with the
 * flowers left their own yellow. Earlier drafts pushed the meadow through the
 * brand blues to stop it fighting the page, but by the time you reach it the
 * background has already met it halfway, so the photograph can be itself.
 */

const CONTACT = [
  { label: 'Email', value: 'zemenaytechsolutions@gmail.com', href: 'mailto:zemenaytechsolutions@gmail.com' },
  { label: 'Site', value: 'zemenaytech.com', href: 'https://zemenaytech.com' },
  { label: 'Where', value: 'Humera Plaza, 3rd floor, Urael, Addis Ababa' },
];

// Where each landed flower comes to rest, as
// [left %, top %, size px, rotation, seconds after the band is first seen].
// The delays run out to half a minute so the field fills in while you read the
// contact details rather than arriving all at once.
const SETTLED: [number, number, number, number, number][] = [
  [7, 14, 26, -18, 0.6],
  [22, 4, 20, 24, 4],
  [39, 22, 30, -8, 9],
  [54, 9, 24, 15, 14],
  [67, 27, 18, -25, 19],
  [82, 12, 26, 10, 25],
  [30, 34, 22, -32, 31],
];

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/zemenaytech/' },
  { label: 'Instagram', href: 'https://www.instagram.com/zemenaytech' },
  { label: 'X', href: 'https://x.com/Zemenaytech' },
];

export function Closing() {
  return (
    <footer className="relative z-10 overflow-hidden pt-[clamp(4rem,12vh,8rem)]">
      <div className="shell pb-[clamp(2.5rem,6vh,4rem)]">
        <Reveal className="max-w-2xl">
          <p className="overline">Say hello</p>
          <h2 className="mt-3 h2">
            Whatever the next year needs, we are one message away
          </h2>
          <p className="mt-4 font-[family-name:var(--font-ethiopic)] text-[clamp(1.05rem,3.5vw,1.35rem)] font-semibold text-gold">
            መልካም አዲስ ዓመት
          </p>
        </Reveal>

        <Reveal delay={100}>
          <dl className="mt-[clamp(2rem,6vh,3rem)] grid grid-cols-1 gap-6 sm:grid-cols-3">
            {CONTACT.map((c) => (
              <div key={c.label}>
                <dt className="overline text-ink-3">{c.label}</dt>
                <dd className="mt-1.5 text-[0.98rem] break-words">
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith('http') ? '_blank' : undefined}
                      rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="text-ink hover:text-gold"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className="text-ink-2">{c.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-[clamp(2.5rem,7vh,4rem)] flex flex-col gap-6 border-t border-white/12 pt-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <ZemenayLogo className="h-6 w-auto text-ink" />
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-3">
                Your complete solution to recruit, hire and pay remote employees
                anywhere in the world.
              </p>
            </div>

            <nav className="flex gap-5">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="overline text-ink-2 hover:text-gold"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>

          <p className="mt-8 text-xs text-ink-3">
            &copy; {new Date().getFullYear()} Zemenay. Sent with thanks to
            everyone we worked with this year.
          </p>
        </Reveal>
      </div>

      {/* The adey abeba field closes the page off. The band is a cut-out, not a
          rectangle of photograph: heads and stems break raggedly into the green
          above them, so the field grows out of the page instead of being a
          picture pasted across the bottom with a ruled edge.
          It was assembled wide from one tall source by flipping and rescaling
          copies, and the source's huge out-of-focus foreground blooms were
          cropped off first, because a tile boundary cutting through one of
          those smooth shapes leaves a seam you cannot miss. */}
      <Reveal>
        <div aria-hidden className="relative">
          {/* She stands behind the band so the front row of flowers crosses her
              skirt, which is what puts her in the field rather than in front of
              a picture of one. Hidden on narrow screens, where she would sit on
              top of the copy rather than beside it.
              The wrapper is shell-width on purpose: pinned to the viewport edge
              she ends up marooned out in the margin on a wide monitor, far from
              anything else on the page. Aligning her to the same column the text
              uses puts her at the end of a line the eye is already following. */}
          <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
            <div className="shell relative h-full">
              <Image
                src="/art/woman.webp"
                alt=""
                width={660}
                height={1150}
                // Sized to rise only a little above the field. Taller and she
                // reaches into the footer copy, where she painted straight over
                // the social links.
                className="absolute right-0 bottom-[2rem] h-[clamp(12rem,20vw,18rem)] w-auto"
              />
            </div>
          </div>

          <div className="relative z-10 h-[clamp(8rem,20vw,15rem)] w-full">
            <Image
              src="/art/meadow-grow.webp"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-bottom"
            />

            {/* Flowers coming to rest. Everything above has petals falling past
                the bottom of the screen forever; here they finally land, one at
                a time over the half-minute or so someone spends at the foot of
                the page, so the motif closes instead of looping. They sit in
                the open green above the field, where a new arrival reads as
                landing rather than as a sprite dropped on a photograph. */}
            {SETTLED.map(([left, top, size, rot, delay], i) => (
              <span
                key={i}
                className="settle-petal absolute"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: size,
                  height: size,
                  ['--settle-rot' as string]: `${rot}deg`,
                  ['--settle-delay' as string]: `${delay}s`,
                }}
              >
                <Image
                  src="/art/adey.png"
                  alt=""
                  width={320}
                  height={320}
                  className="h-full w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                />
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
