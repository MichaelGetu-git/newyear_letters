import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Finds a partner's logo file on disk, or reports that there isn't one yet.
 *
 * This runs at build time on the server, never in the browser: every page here
 * is statically prerendered, so the lookup happens once during `next build` and
 * the answer is baked into the HTML. That is the whole point of doing it on
 * disk rather than letting the browser request the file and handle a 404 — a
 * missing logo becomes a deliberate fallback in the markup instead of a broken
 * image that flashes before any error handler can catch it.
 *
 * SVG is preferred over PNG when both exist, because these get knocked out to
 * white and scaled to the hero's cap height.
 */
const EXTENSIONS = ['svg', 'png'] as const;

export function findLogo(slug: string): string | undefined {
  for (const ext of EXTENSIONS) {
    // process.cwd() is the project root during a build, which is where
    // `public/` sits. Import paths would not help here: this is a filesystem
    // question about an asset that is served statically, not a module.
    if (existsSync(join(process.cwd(), 'public', 'partners', `${slug}.${ext}`))) {
      return `/partners/${slug}.${ext}`;
    }
  }
  return undefined;
}
