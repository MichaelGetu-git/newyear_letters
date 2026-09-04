'use client';

import { useEffect, useRef, useState } from 'react';
import type { Partner } from '../data/partners';

/**
 * Shares the letter, ideally as a ready-made story.
 *
 * There is no way to post to an Instagram or Snapchat story from a web page
 * directly — neither has a public web endpoint for it, only native SDKs — so
 * this goes through the OS share sheet, which on any phone lists both apps
 * alongside WhatsApp, Telegram and the rest. Handing that sheet the 9:16 card
 * from public/share/ is what makes it one tap: Instagram will not accept a bare
 * URL as a post at all, and Snapchat turns one into a text snap nobody looks at,
 * but an image both will take straight to a story.
 *
 * Three levels, best first:
 *   1. share the story card as a file, with the link in the text
 *   2. share just the link, where files are not supported (most desktops)
 *   3. copy the link, where there is no share sheet at all (Firefox, Chrome
 *      on Windows)
 *
 * The card is fetched on mount rather than on click. Safari drops the user
 * gesture across an await, so a handler that fetches before calling share()
 * gets refused as though it fired on its own; having the file ready means the
 * click reaches share() immediately.
 */
export function ShareButton({ partner }: { partner?: Partner }) {
  const fileRef = useRef<File | null>(null);
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const slug = partner?.slug ?? 'generic';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/share/${slug}.jpg`);
        if (!res.ok) return;
        const blob = await res.blob();
        if (cancelled) return;
        const file = new File([blob], `zemenay-${slug}.jpg`, { type: 'image/jpeg' });
        // canShare with files is the only reliable test. Plenty of browsers
        // expose navigator.share but reject any payload containing files.
        if (navigator.canShare?.({ files: [file] })) fileRef.current = file;
      } catch {
        // No card, no problem: the link-only paths below still work.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function share() {
    const url = window.location.href;
    const title = partner ? `Zemenay ✕ ${partner.name}` : 'Zemenay — Melkam Addis Amet';
    const text = 'መልካም አዲስ ዓመት — here is to the next year, side by side.';

    try {
      if (fileRef.current) {
        await navigator.share({ files: [fileRef.current], title, text });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (err) {
      // A cancelled sheet throws AbortError. That is the visitor changing their
      // mind, not a failure, and must not fall through to copying the link.
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
      setTimeout(() => setState('idle'), 2400);
    } catch {
      setState('failed');
      setTimeout(() => setState('idle'), 2400);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="glass inline-flex cursor-pointer items-center gap-2.5 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-gold/50 hover:text-gold"
    >
      <span aria-hidden>
        {state === 'copied' ? '✓' : state === 'failed' ? '⚠' : '↗'}
      </span>
      {state === 'copied'
        ? 'Link copied'
        : state === 'failed'
          ? 'Could not copy'
          : 'Share this'}
    </button>
  );
}
