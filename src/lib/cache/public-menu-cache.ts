import { updateTag } from 'next/cache';

/**
 * Cache tag for a tenant's public menu (`/t/[slug]`). The diner page caches the
 * resolved menu under this tag; owner mutations (branding, theme, settings, menu)
 * call {@link revalidatePublicMenu} so the live page reflects the change at once
 * instead of waiting for the time-based revalidation window.
 */
export function publicMenuTag(slug: string): string {
  return `public-menu:${slug}`;
}

/**
 * Bust the cached public menu for a slug after an owner edit. Uses `updateTag`
 * (read-your-own-writes) so the change is visible on the very next render — must
 * be called from within a Server Action.
 */
export function revalidatePublicMenu(slug: string): void {
  updateTag(publicMenuTag(slug));
}
