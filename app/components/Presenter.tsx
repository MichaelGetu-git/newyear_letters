'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from './Reveal';

/**
 * The product manager's piece to camera. The clip is a transparent video, so it
 * is composited straight onto the page over the blue rather than sitting in a
 * black letterbox.
 *
 * Drop the files in as:
 *   public/media/pm-intro.webm   VP9 or AV1 with an alpha channel  (Chrome, Firefox, Edge)
 *   public/media/pm-intro.mov    HEVC with an alpha channel        (Safari)
 *   public/media/pm-poster.png   optional still, shown before play
 *
 * Safari will not play alpha WebM at all, and Chrome will not play HEVC, so
 * both sources are needed for the transparency to survive everywhere. Until the
 * files exist the element fails to load and the fallback panel below takes over,
 * which is why the failure is tracked in state rather than left to the browser's
 * default broken-media box.
 */

const SRC = '/media/pm-intro';

export function Presenter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [missing, setMissing] = useState(false);

  // A <video> that lists its candidates as <source> children does not reliably
  // fire `error` on itself when they all fail: the failures fire on the source
  // elements, which do not bubble. A capturing listener on the video sees them,
  // and NETWORK_NO_SOURCE is the state that means every candidate was rejected.
  // The timeout covers the case where the element settled before this ran.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const check = () => {
      if (v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) setMissing(true);
    };
    v.addEventListener('error', check, true);
    const timer = setTimeout(check, 1500);
    return () => {
      v.removeEventListener('error', check, true);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Attempt to play unmuted when in view
            v.muted = false;
            setMuted(false);
            v.play().catch(() => {
              // If the browser blocks unmuted autoplay (due to lack of interaction),
              // gracefully fall back to muted playback.
              v.muted = true;
              setMuted(true);
              v.play().catch(() => {});
            });
          } else {
            // Pause the video when it leaves the viewport to save resources
            v.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(v);
    return () => observer.disconnect();
  }, []);

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    // Autoplay only survives while the clip is muted, so the first unmute has
    // to come from this click and may need to kick playback off again.
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) void v.play().catch(() => {});
  }

  return (
    <section id="video" className="relative z-10 py-[clamp(4rem,12vh,8rem)]">
      {/* The adey abeba thrown out of focus, so a cutout figure has something with
          depth to stand against instead of flat colour. Same flower as the
          falling petals and the closing field, just far enough out of focus to
          read as light rather than as subject. */}
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
          <div className="relative mx-auto w-[min(46rem,100%)]">
            {/* Stage glow under the presenter's feet. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[12%] bottom-0 h-24 rounded-[50%] bg-[radial-gradient(ellipse,#3b82f65c_0%,transparent_70%)] blur-2xl"
            />

            {missing ? (
              <div className="glass flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
                <span aria-hidden className="text-3xl">
                  &#9654;
                </span>
                <p className="dg text-lg">
                  The clip is not in place yet
                </p>
                <p className="max-w-sm text-sm text-ink-3">
                  Add <code className="text-cyan">pm-intro.webm</code>,{' '}
                  <code className="text-cyan">pm-intro.mov</code>, or{' '}
                  <code className="text-cyan">pm-intro.mp4</code> to{' '}
                  <code className="text-cyan">public/media</code> and this panel
                  becomes the video.
                </p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="relative w-full"
                  loop
                  playsInline
                  preload="auto"
                  poster="/media/pm-poster.png"
                  onError={() => setMissing(true)}
                >
                  {/* HEVC first: Safari picks the first source it can decode,
                      and it cannot decode alpha WebM at all. */}
                  <source src={`${SRC}.mov`} type='video/quicktime; codecs="hvc1"' />
                  <source src={`${SRC}.webm`} type="video/webm" />
                  <source src={`${SRC}.mp4`} type="video/mp4" />
                </video>

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
