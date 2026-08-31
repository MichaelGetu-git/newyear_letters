import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Letter } from '../components/Letter';
import { PARTNERS, findPartner } from '../data/partners';

/**
 * A named version of the letter, at `/<slug>`.
 *
 * Identical to the generic page in every respect but the hero lockup, where the
 * partner's own mark replaces the word "You".
 */

// Only the slugs in PARTNERS exist. Without this, any path at the root of the
// site would render a letter addressed to a company invented from the URL, so
// a typo would quietly produce a real-looking page rather than a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return PARTNERS.map((p) => ({ partner: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ partner: string }>;
}): Promise<Metadata> {
  const { partner } = await params;
  const found = findPartner(partner);
  if (!found) return {};

  return {
    title: `Zemenay ✕ ${found.name} | Melkam Addis Amet`,
    // These pages name a specific company. They are meant to be opened from a
    // QR code on something posted to that company, not found by anyone else, so
    // they stay out of search results. The generic letter at `/` is indexable.
    robots: { index: false, follow: false },
  };
}

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ partner: string }>;
}) {
  const { partner } = await params;
  const found = findPartner(partner);

  // dynamicParams already restricts this to known slugs at build time. This is
  // the belt to that braces: it keeps the component honest about the type
  // rather than asserting the lookup succeeded.
  if (!found) notFound();

  return <Letter partner={found} />;
}
