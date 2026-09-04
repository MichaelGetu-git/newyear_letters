'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from './Reveal';

/**
 * The product manager's piece to camera. Portrait 9:16, so it is sized by
 * height rather than width; at the section's full width it would stand over a
 * thousand pixels tall.
 *
 * It starts itself when it scrolls into view and stops when it leaves, and it
 * tries to come in with the sound on.
 *
 * That last part cannot be promised, and the fallback is not optional. Every
 * current browser blocks audible autoplay until the visitor has interacted with
 * the page: Chrome, Safari and Firefox all reject play() outright, or start the
 * clip and silently re-mute it. Since most people will land here from a QR code
 * and scroll straight down without clicking anything, the muted path is the one
 * that will usually run. So the sound is attempted, the refusal is caught, and
 * playback continues muted with the control below offering the sound — which
 * works, because the click on it is the very gesture the browser was waiting
 * for.
 */

const SRC = '/media/pm-intro.mp4';

export function Presenter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // play() resolves asynchronously, and scrolling away while it is still
    // pending rejects it with AbortError. Without this flag that rejection is
    // indistinguishable from the browser refusing the sound, so leaving the
    // section would restart the clip muted instead of stopping it.
    let wanted = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          wanted = false;
          v.pause();
          return;
        }

        // Try with sound first. If the browser refuses, fall back to muted
        // rather than leaving a stalled player on screen.
        wanted = true;
        v.muted = false;
        v.play().then(
          () => {
            if (!wanted) v.pause();
            else setMuted(v.muted);
          },
          () => {
            if (!wanted) return;
            v.muted = true;
            setMuted(true);
            void v.play().catch(() => {});
          },
        );
      },
      // Half of it on screen. Lower and the clip starts talking while it is
      // still a sliver at the bottom edge.
      { threshold: 0.5 },
    );

    observer.observe(v);
    return () => observer.disconnect();
  }, []);

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    // This click is a user gesture, so an unmute here is always allowed even
    // when the automatic attempt above was refused.
    if (!v.muted) void v.play().catch(() => {});
  }

  return (
    <section id="video" className="relative z-10 py-[clamp(4rem,12vh,8rem)]">
      {/* The adey abeba thrown out of focus, so the clip has something with
          depth behind it instead of flat colour. Same flower as the falling
          petals and the closing field, just far enough out of focus to read as
          light rather than as subject. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[34rem] -translate-y-1/2 opacity-30 [mask-image:radial-gradient(52%_52%_at_50%_50%,#000_0%,transparent_78%)]"
        style={{
          backgroundImage: 'url(/art/bloom-blur.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="shell text-center">
        <Reveal>
          <p className="overline">In their own words</p>
          <h2 className="mx-auto mt-3 max-w-2xl h2">
            Our product manager, without the slide deck
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-[clamp(2rem,6vh,3.5rem)]">
          <div className="relative mx-auto w-fit">
            {/* Glow behind the frame, so the portrait block does not sit on the
                background as a hard rectangle. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse,#3b82f64d_0%,transparent_70%)] blur-2xl"
            />

            {missing ? (
              <div className="glass flex aspect-[9/16] h-[min(70vh,34rem)] flex-col items-center justify-center gap-3 px-6 text-center">
                <span aria-hidden className="text-3xl">
                  &#9654;
                </span>
                <p className="dg text-lg">The clip is not in place yet</p>
                <p className="max-w-sm text-sm text-ink-3">
                  Add <code className="text-cyan">pm-intro.mp4</code> to{' '}
                  <code className="text-cyan">public/media</code> and this panel
                  becomes the video.
                </p>
              </div>
            ) : (
              <>
                {/* Height-constrained, width auto: the source is 9:16, so
                    letting it fill the section's width would make it taller
                    than any screen it is viewed on. */}
                <video
                  ref={videoRef}
                  src={SRC}
                  poster="/media/pm-poster.jpg"
                  className="relative h-[min(70vh,34rem)] w-auto rounded-2xl border border-white/12 shadow-[0_1.5rem_3rem_-1rem_rgba(0,0,0,0.5)]"
                  loop
                  playsInline
                  // "auto", not "metadata". This is the second section, so it
                  // is reached within seconds; with metadata only, the clip
                  // starts downloading at the moment play() is called and sits
                  // paused on a poster while it buffers, which is exactly when
                  // someone is looking at it.
                  preload="auto"
                  onError={() => setMissing(true)}
                />

                <button
                  type="button"
                  onClick={toggleSound}
                  className="glass mt-5 inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-white/40"
                >
                  <span aria-hidden>{muted ? '\u{1F507}' : '\u{1F50A}'}</span>
                  {muted ? 'Turn the sound on' : 'Mute'}
                </button>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
