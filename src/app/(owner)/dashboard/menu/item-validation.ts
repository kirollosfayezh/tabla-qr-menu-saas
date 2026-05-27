'use client';

import { ItemFormSchema } from '@/dtos/menu.dto';
import type { ItemDraft } from './types';
import { parsePriceInput } from './format';

/**
 * Apply the typed-but-not-committed price text to the draft.
 * Empty / unparseable → priceCents becomes NaN so Zod's validator rejects it.
 */
export function applyPriceText(draft: ItemDraft, priceText: string): ItemDraft {
  if (priceText.trim() === '') {
    return { ...draft, priceCents: Number.NaN as unknown as number };
  }
  const parsed = parsePriceInput(priceText);
  return {
    ...draft,
    priceCents: Number.isNaN(parsed) ? (Number.NaN as unknown as number) : parsed,
  };
}

/**
 * Validate an item draft against the strict client schema plus the
 * "Arabic name required when default locale is Arabic" rule.
 * Returns a map of field → already-localized error message.
 * The Zod schema uses i18n keys (`errors.foo`) as messages; we resolve them via `tErr`.
 */
export function validateItem(
  draft: ItemDraft,
  defaultLocale: 'en' | 'ar',
  tErr: (key: string) => string,
): Record<string, string> {
  const errs: Record<string, string> = {};
  const parsed = ItemFormSchema.safeParse(draft);
  if (!parsed.success) {
    for (const [field, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      const key = (msgs as string[] | undefined)?.[0];
      if (!key) continue;
      errs[field] = key.startsWith('errors.') ? tErr(key.slice('errors.'.length)) : key;
    }
  }
  if (defaultLocale === 'ar' && !draft.nameAr.trim()) {
    errs.nameAr = tErr('nameArRequired');
  }
  return errs;
}
