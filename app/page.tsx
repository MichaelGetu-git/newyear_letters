import { Letter } from './components/Letter';

/**
 * The generic letter, and the one that goes out to most companies. It names
 * nobody, so a single link is safe to send to any number of them.
 *
 * The personalised versions live at `/<slug>`; see `app/[partner]/page.tsx`.
 */
export default function Page() {
  return <Letter />;
}
