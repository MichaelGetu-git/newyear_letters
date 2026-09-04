'use client';

import { useEffect, useRef, useState } from 'react';
import type { Partner } from '../data/partners';

/**
 * Shares the letter, with Instagram first.
 *
 * No web page can post to an Instagram or Snapchat story directly — neither has
 * a public web endpoint for it, only native SDKs — so the two of them go through
 * the OS share sheet, which lists both on any phone. What makes that worth doing
 * is handing the sheet the ready-made 9:16 card from public/share/ rather than a
 * link: Instagram will not accept a bare URL as a post at all, and Snapchat
 * turns one into a text snap nobody looks at, but an image either will take
 * straight to a story.
 *
 * Where the sheet cannot carry files (most desktop browsers) Instagram falls
 * back to saving the card, since that is the step you would be taking anyway
 * before posting it from a phone.
 *
 * The card is fetched on mount, not on click. Safari drops the user gesture
 * across an await, so a handler that fetched first would have its share() call
 * refused as though it had fired on its own.
 */


/** Order matters: Instagram leads, because the OS share sheet picks its own
 *  order and this is the only way to put it first. */
const OPTIONS = [
  { key: 'instagram', label: 'Instagram story', icon: '📸' },
  { key: 'snapchat', label: 'Snapchat', icon: '👻' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { key: 'telegram', label: 'Telegram', icon: '✈' },
  { key: 'x', label: 'X', icon: '𝕏' },
  { key: 'save', label: 'Save the image', icon: '⬇' },
  { key: 'copy', label: 'Copy link', icon: '🔗' },
];

type Props = { partner?: Partner };

export function ShareButton({ partner }: Props) {
  const fileRef = useRef<File | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const slug = partner?.slug ?? 'generic';
  const title = partner ? `Zemenay ✕ ${partner.name}` : 'Zemenay — Melkam Addis Amet';
  const text = 'መልካም አዲስ ዓመት — here is to the next year, side by side.';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/share/${slug}.jpg`);
        if (!res.ok) return;
        const blob = await res.blob();
        if (cancelled) return;
        blobUrlRef.current = URL.createObjectURL(blob);
        const file = new File([blob], `zemenay-${slug}.jpg`, { type: 'image/jpeg' });
        // canShare with files is the only reliable test: plenty of browsers
        // expose navigator.share but reject any payload containing files.
        if (navigator.canShare?.({ files: [file] })) fileRef.current = file;
      } catch {
        // No card, no problem: every link-based option below still works.
      }
    })();
    return () => {
      cancelled = true;
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, [slug]);

  // Click-away and Escape, so the panel behaves like a menu rather than
  // something that has to be dismissed by its own button.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function flash(message: string) {
    setNote(message);
    setTimeout(() => setNote(null), 2600);
  }

  function url() {
    return window.location.href;
  }

  function saveCard() {
    if (!blobUrlRef.current) return false;
    const a = document.createElement('a');
    a.href = blobUrlRef.current;
    a.download = `zemenay-${slug}.jpg`;
    a.click();
    return true;
  }

  /** The card via the OS sheet, which is the only route to a story. */
  async function shareCard(fallback: () => void) {
    setOpen(false);
    if (fileRef.current) {
      try {
        await navigator.share({ files: [fileRef.current], title, text });
        return;
      } catch (err) {
        // A cancelled sheet is the visitor changing their mind, not a failure.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    fallback();
  }

  function openLink(href: string) {
    setOpen(false);
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  async function copyLink() {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(url());
      flash('Link copied');
    } catch {
      flash('Could not copy');
    }
  }

  function select(key: string) {
    switch (key) {
      case 'instagram':
      case 'snapchat': {
        const where = key === 'instagram' ? 'Instagram' : 'Snapchat';
        void shareCard(() => {
          // No file sharing on this browser, so save the card instead — the
          // step you would be taking anyway before posting from a phone.
          if (saveCard()) flash(`Card saved. Post it from ${where}.`);
          else flash('Could not prepare the image');
        });
        return;
      }
      case 'whatsapp':
        return openLink(`https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`);
      case 'telegram':
        return openLink(
          `https://t.me/share/url?url=${encodeURIComponent(url())}&text=${encodeURIComponent(text)}`,
        );
      case 'x':
        return openLink(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url())}&text=${encodeURIComponent(text)}`,
        );
      case 'save':
        setOpen(false);
        if (!saveCard()) flash('Could not prepare the image');
        return;
      case 'copy':
        return void copyLink();
    }
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="glass inline-flex cursor-pointer items-center gap-2.5 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-gold/50 hover:text-gold"
      >
        <span aria-hidden>↗</span>
        {note ?? 'Share this'}
      </button>

      {open && (
        <div
          role="menu"
          // Deliberately NOT the .glass surface used elsewhere, and fully
          // opaque. This panel sits over the hero copy and the fists, and at any
          // transparency the paragraph and the artwork behind it read straight
          // through the menu items.
          className="absolute bottom-full left-1/2 z-30 mb-3 w-60 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-[#00112f] p-1.5 text-left shadow-[0_1.5rem_3rem_-0.5rem_rgba(0,0,0,0.7)]"
        >
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              role="menuitem"
              onClick={() => select(o.key)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-ink-2 transition-colors hover:bg-white/10 hover:text-ink"
            >
              <span aria-hidden className="w-5 text-center">
                {o.icon}
              </span>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
