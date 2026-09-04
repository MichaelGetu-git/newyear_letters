import type { Partner } from '../data/partners';
import { AdeyFall } from './AdeyFall';
import { Closing } from './Closing';
import { Hero } from './Hero';
import { Projects } from './Projects';
import { Presenter } from './Presenter';
import { Services } from './Services';

/**
 * The letter itself, shared by the generic page at `/` and every partner
 * version at `/<slug>`.
 *
 * The only difference between them is the lockup in the hero. Everything below
 * it, the work, the video and the contact details, is identical, so the two
 * routes are the same page with one prop rather than two pages to keep in sync.
 */
export function Letter({ partner }: { partner?: Partner }) {
  return (
    <main className="relative">
      <AdeyFall />
      <Hero partner={partner} />
      {/* What we do, then the presenter saying it in their own voice, then the
          work that proves it. */}
      <Services />
      <Presenter />
      <Projects />
      <Closing />
    </main>
  );
}
