import type { HeroPhoto } from '@/themes/theme.types';

const VALID_ROTATIONS: ReadonlyArray<HeroPhoto['rotation']> = [0, 90, 180, 270];

/**
 * Coerce raw DB JSON (or a legacy `String[]` of URLs) into a typed HeroPhoto array.
 * Tolerates unknown shapes by returning [].
 */
export function parseHeroPhotos(raw: unknown, legacyUrls?: ReadonlyArray<string>): HeroPhoto[] {
  const fromJson = Array.isArray(raw) ? raw.map(toHeroPhoto).filter((p): p is HeroPhoto => p !== null) : [];
  if (fromJson.length > 0) return fromJson;
  if (legacyUrls && legacyUrls.length > 0) {
    return legacyUrls.filter((u) => typeof u === 'string' && u.length > 0).map((url) => ({
      url,
      rotation: 0,
      flipX: false,
      flipY: false,
    }));
  }
  return [];
}

function toHeroPhoto(value: unknown): HeroPhoto | null {
  if (typeof value !== 'object' || value === null) return null;
  const obj = value as Record<string, unknown>;
  const url = typeof obj.url === 'string' ? obj.url : null;
  if (!url) return null;
  const rotation = VALID_ROTATIONS.find((r) => r === obj.rotation) ?? 0;
  return {
    url,
    rotation,
    flipX: obj.flipX === true,
    flipY: obj.flipY === true,
  };
}
