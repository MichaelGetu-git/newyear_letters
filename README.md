# Zemenay Enkutatash

A one-page new year note sent to partner companies ahead of Meskerem 1, 2019 E.C.
(11 September 2026).

The letter at `/` names nobody, so one URL goes to the whole list. Alongside it
sit a handful of named versions at `/<slug>`, where a partner's own logo takes
the place of the word "You" in the hero. Each has its own QR code.

```bash
npm run dev
```

Runs on http://localhost:4500 via the project launch config, or port 3000 with a
plain `npm run dev`.

## What still needs filling in

### 1. The projects

Edit `app/data/projects.ts`. Add and remove freely, the grid reflows for any
count. Drop media into `public/projects/` and point `image` (or `video`, see
below) at it.

The first entry is the feature card. On a wide screen it spans two columns and
crops to 16:9, so give it a landscape shot. Everything else crops to 4:5 and
suits portrait or square originals. Below that two-column breakpoint the feature
card is the same width as every other card, so it drops to 4:5 as well — a 16:9
frame at one column is just a short letterbox stub sitting above a full-height
neighbour.

Media is centre-cropped either way, so keep the subject away from the very
edges. Any card without usable media falls back to its index numeral at full
bleed and names the file it is waiting for, so a half-filled deck still looks
deliberate rather than broken.

### 2. The services list

`app/data/services.ts` holds the six offerings shown under "what we do", with
copy and links tracking the live pages on zemenaytech.com. Nothing to add here
unless the offering set changes.

### 3. Project videos

A card plays `video` when the entry has one, looping and muted, and ignores
`image` entirely in that case. Always run a new clip through this rather than
dropping the file straight in:

```bash
npm run video media-src/whatever.mp4 my-project-id
```

Add `--wide` only for a clip going in the first slot, which spans two columns
and crops to 16:9 on a wide screen.

Two things it handles that matter more than the compression:

**Shape.** The cards are 4:5 and fill with `object-cover`, so a 16:9 clip
dropped straight in loses 55% of its width. For a promo cut with content out at
the left and right edges, that means whole phone mockups disappear off the
sides. The script scales the full frame to the card's width and pads it out to
4:5 in the clip's own background colour, sampled from a real frame. Nothing is
cropped, and because the pad matches the backdrop the join is invisible.

**Weight.** Footage arrives at 1080p and several megabits with an audio track
the cards can never play. The first clip dropped in here was 37MB on its own,
more than twenty times everything else on the page put together; it came out at
1.4MB with no visible loss.

Keep the master in `media-src/` — gitignored, so it is never deployed and never
lost.

### 4. The presenter video

The clip is composited straight onto the blue, so it needs a real alpha channel.
Two encodings are required, because Safari cannot decode alpha WebM and Chrome
cannot decode HEVC:

| File | Codec | Plays in |
| --- | --- | --- |
| `public/media/pm-intro.webm` | VP9 or AV1 with alpha | Chrome, Edge, Firefox |
| `public/media/pm-intro.mov` | HEVC with alpha (`hvc1`) | Safari |
| `public/media/pm-poster.png` | still frame, optional | before playback starts |

Until both exist the section shows a panel saying so rather than a broken
player.

### 5. TAN Nimbus

The hero word is meant to be set in TAN Nimbus, a licensed face from TAN Type
that cannot be committed here. Put the file at `public/fonts/TAN-NIMBUS.woff2`
(or `.otf`) and it takes over on the next load, no code change needed. Until
then the stack falls through to Righteous, which carries a similar retro-deco
weight.

## The generic letter and the partner versions

There are two kinds of page, and the difference between them is one line in the
hero.

**The generic letter, at `/`.** It names nobody: the lockup reads
`Zemenay ✕ You`. This is the one that goes out to most companies, and because it
names nobody, one link is safe to send to any number of them.

**A partner version, at `/<slug>`.** Identical in every respect except that the
partner's own mark replaces the word "You". Everything below the hero, the work,
the video, the contact details, is the same page: `app/components/Letter.tsx` is
shared, and the route just passes a partner through it.

Partner versions carry `robots: noindex`, because they name a specific company
and are meant to be reached from a QR code on something posted to that company
rather than found by a stranger. The generic letter stays indexable.

### Adding or changing a partner

1. Drop the logo at `public/partners/<slug>.svg`. SVG is preferred; a PNG with
   real transparency is fine. It gets knocked out to pure white, so only the
   silhouette matters — set `keepColor` on the entry if a mark genuinely needs
   its own colours and has the contrast to survive on the navy.
2. Edit `app/data/partners.ts`.
3. `npm run qr` to regenerate the codes.

The ten entries currently in there are placeholders, and so are the ten marks in
`public/partners/`, which `npm run logos` regenerates. They read "PARTNER 01"
rather than borrowing a plausible company name on purpose: a page that looks
like a finished announcement for a company Zemenay has not partnered with is not
something you want sitting on a public URL. Swap the names in `partners.ts` and
overwrite the SVGs as the real logos arrive.

A slug whose logo file does not exist yet falls back to the company name set in
the same tracked capitals, so partners can go live one at a time as their logos
come in. The lookup happens on disk at build time, which is why a missing file
becomes a deliberate fallback in the HTML rather than a broken image.

Unknown slugs 404 rather than rendering. Without that, any path at the root of
the site would produce a real-looking letter addressed to a company invented
from the URL.

## QR codes

`npm run qr` writes eleven codes to `qr/` — one for the generic letter, one per
partner — reading the list straight out of `partners.ts` so the codes can never
drift from the routes that exist.

| File | Use |
| --- | --- |
| `qr/<slug>.svg` | vector. Use this on anything printed. |
| `qr/<slug>.png` | 1024px raster, for slides, email and messaging apps. |
| `qr/contact-sheet.png` | every code with its destination printed underneath |

Check the contact sheet before anything goes to print. Getting two codes crossed
is the one mistake in this job that cannot be undone after posting.

The codes are dark navy on white at error correction level M, which survives a
fold or a scuff on a printed card while staying readable at small sizes. Do not
invert them: nearly every scanner expects the dark modules to be the data.

`qr/` is not committed. The codes are derived entirely from `partners.ts` and the
site URL, so regenerating takes a second. Point them elsewhere with
`SITE=https://example.com npm run qr`.

## The artwork

`public/art/` is generated, not hand-made. `npm run art` rebuilds every file in
it from the fist cut-outs committed under `public/media/` and the illustration
pack in `D:/Telegram Desktop/Adeweb Developer Africa` (override with
`ART_PACK`).

- **`fist-left.png` / `fist-right.png`** are composed from the two supplied
  cut-outs in `public/media/`. Those are separate drawings with their own
  margins and widths, so the build trims each to its real content, crops both
  through one shared vertical window so the fists sit at the same height, and
  pads each on its outer edge to a common half-width. Butting the two halves
  together then lands the knuckles exactly on the pair's centre line, which is
  where the hero fires the impact ring and the flower burst. Stray specks left
  by the masking are cleared first, since the trim measures the alpha bounding
  box and one loose pixel near an edge would pad the crop and push the knuckles
  off the seam.
- **`adey.png` / `adey-blue.png`** are the falling flower in its own yellow and
  in Zemenay blue. The page hard-cuts between the two behind a white flash
  rather than running a CSS `hue-rotate`, which drags a saturated yellow through
  green on the way out and overshoots into violet on the way in.
- **`meadow-grow.webp`** is the field at the foot of the page, assembled wide
  from one tall cut-out by flipping and rescaling copies. Its ragged top edge is
  the whole point: stems and heads break into the open green so the field grows
  out of the page rather than being a rectangle of photograph pasted across the
  bottom.
- **`woman.webp`** stands in that field, behind the band so the front row of
  flowers crosses her skirt.
- **`blue-drift.webp`** is the drift of small blue flowers behind the services
  list, and **`bloom-blur.webp`** is the close-up cluster thrown out of focus
  behind the presenter video.

## Brand

Colours and the Degular Display heading face come from the marketing site
(`Zemenay-Revamped-2026`), not from the internal workspace app, so this reads as
Zemenay rather than as one product inside it. The page sits at the dark end of
the same palette because the cut-out fists and the glowing petals need a dark
ground. Tokens live at the top of `app/globals.css`.

## Motion

Every entrance is CSS keyframes over server-rendered markup, so the opening
plays on the first painted frame with no hydration wait and no animation
library. Under `prefers-reduced-motion` the scroll reveals resolve to their end
state, the petal layer slows to a drift and stops spinning, and the hover lifts
come off. The opening itself still plays: on this page the fist bump is the
content, not decoration around it, and Windows reports that preference for
anyone who has simply switched animation effects off.
