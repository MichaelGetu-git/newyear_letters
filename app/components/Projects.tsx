'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PROJECTS, type Project } from '../data/projects';
import { Reveal } from './Reveal';

/**
 * The work, as portrait photo cards that deal onto the page on scroll. Clicking
 * one rides its detail up over the photo rather than growing the card, so the
 * grid never lurches when a row opens.
 *
 * Cards toggle independently rather than behaving as an accordion, so two can
 * be left open side by side.
 */
export function Projects() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="work" className="relative z-10 py-[clamp(4rem,12vh,8rem)]">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <p className="overline">Some of the work</p>
          <h2 className="mt-3 h2">A year of things that shipped</h2>
          <p className="mt-4 text-[clamp(0.98rem,3vw,1.1rem)] leading-relaxed text-ink-3">
            Open any card for the detail behind it.
          </p>
        </Reveal>

        {/* deal-grid supplies the perspective the cards tip through as they
            land. Without it their rotateX only squashes them flat. */}
        <ul className="deal-grid mt-[clamp(2rem,6vh,3.5rem)] grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <Reveal
              as="li"
              key={project.id}
              // The lead project runs the full width of the grid. Six identical
              // tiles read as a spreadsheet; one feature gives the section a
              // place for the eye to start.
              className={i === 0 ? 'lg:col-span-2' : undefined}
              // Stagger in reading order, and alternate the tilt so the row
              // lands like dealt cards instead of sliding down in formation.
              delay={i * 100}
              tilt={i % 2 === 0 ? -2.5 : 2.5}
              deal
            >
              <Card
                project={project}
                index={i + 1}
                feature={i === 0}
                isOpen={open === project.id}
                onToggle={() => setOpen(open === project.id ? null : project.id)}
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Card({
  project,
  index,
  feature = false,
  isOpen,
  onToggle,
}: {
  project: Project;
  index: number;
  /** Renders wide and landscape as the lead card of the grid. */
  feature?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  // A photo named in the data but not yet on disk should not leave a torn image
  // icon behind. Tracking the failure lets the empty state name the file it is
  // waiting for, which is more use than a broken frame.
  const [imageFailed, setImageFailed] = useState(false);
  const hasVideo = Boolean(project.video);
  const hasPhoto = Boolean(project.image) && !imageFailed;
  const number = String(index).padStart(2, '0');

  return (
    <article className="card" data-open={isOpen}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`panel-${project.id}`}
        className="block w-full cursor-pointer text-left"
      >
        {/* The feature card only earns its wide crop where it actually spans
            two columns. On one column it is the same width as every other card,
            so 16:9 just makes it a short letterbox stub above a full-height
            neighbour. It matches the rest at 4:5 until the grid goes wide. */}
        <span
          className={`relative block overflow-hidden ${
            feature ? 'aspect-4/5 lg:aspect-video' : 'aspect-4/5'
          }`}
        >
          {hasVideo ? (
            <video
              src={project.video}
              autoPlay
              loop
              muted
              playsInline
              className="card-media object-cover absolute inset-0 w-full h-full"
            />
          ) : hasPhoto ? (
            <Image
              src={project.image as string}
              alt={project.title}
              fill
              sizes={
                feature
                  ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 66vw'
                  : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              }
              className="card-media object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            /* No photo yet. Rather than a dashed placeholder box, the card
               falls back to the index numeral at full bleed, which still looks
               like a designed card in a deck that is only half filled. */
            <span className="card-media absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_80%_at_50%_0%,#004aad_0%,#00204f_70%)]">
              {/* The oversized numeral belongs to the wide layout too. At one
                  column the feature card is no bigger than its neighbours, so
                  10rem simply overflowed it. */}
              <span
                className={`dg leading-none text-white/8 select-none ${
                  feature ? 'text-[7rem] lg:text-[10rem]' : 'text-[7rem]'
                }`}
              >
                {number}
              </span>
            </span>
          )}

          <span aria-hidden className="card-scrim absolute inset-0" />

          {/* Header rail: index on the left, category on the right. */}
          <span className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4">
            <span className="dg text-sm tracking-[0.18em] text-gold">{number}</span>
            <span className="rounded-full border border-white/25 bg-navy/50 px-3 py-1 text-[0.62rem] tracking-[0.18em] text-ink-2 uppercase backdrop-blur-sm">
              {project.tag}
            </span>
          </span>

          {/* Title block, sitting on the photo. */}
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-5 pb-5">
            <span className="block">
              <span
                className={`dg block leading-tight ${
                  feature ? 'text-[1.3rem] lg:text-[1.75rem]' : 'text-[1.3rem]'
                }`}
              >
                {project.title}
              </span>
              <span className="mt-1.5 block text-[0.82rem] leading-relaxed text-ink-3">
                {project.blurb}
              </span>
              {!hasPhoto && !hasVideo && (
                <span className="mt-2 block text-[0.65rem] text-ink-3/70">
                  media goes at{' '}
                  <code className="text-cyan">
                    {project.image ?? `public/projects/${project.id}.jpg`}
                  </code>
                </span>
              )}
            </span>
            <span
              aria-hidden
              className={`mb-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 text-gold transition-transform duration-300 ${
                isOpen ? 'rotate-45' : ''
              }`}
            >
              &#43;
            </span>
          </span>
        </span>
      </button>

      {/* The detail, riding up over the photograph. Once open it covers the
          card's own toggle, so it carries its own close control rather than
          leaving the only way out a sliver of photo at the top.
          `inert` while closed takes the whole panel out of the tab order and
          the accessibility tree at once, including that close button. */}
      <div
        id={`panel-${project.id}`}
        className="card-panel p-5"
        {...(isOpen ? {} : { inert: true })}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="dg text-[1.05rem] leading-tight text-gold">{project.title}</p>
          <button
            type="button"
            onClick={onToggle}
            aria-label={`Close ${project.title}`}
            className="-mt-1 -mr-1 grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border border-white/20 text-ink-3 transition-colors hover:border-gold/60 hover:text-gold"
          >
            <span aria-hidden>&times;</span>
          </button>
        </div>
        <p className="mt-2.5 text-[0.86rem] leading-relaxed text-ink-2">{project.detail}</p>
        <ul className="mt-3 list-none space-y-2 p-0 text-[0.82rem] text-ink-3">
          {project.points.map((point) => (
            <li key={point} className="flex gap-2.5">
              <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        {project.href ? (
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-cyan hover:underline"
          >
            See the project
            <span aria-hidden>&rarr;</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
