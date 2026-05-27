import type { Theme } from '@prisma/client';

export type StepKey = 'basics' | 'branding' | 'theme' | 'done';

export const STEP_ORDER: ReadonlyArray<StepKey> = ['basics', 'branding', 'theme', 'done'];

/** In-memory draft kept by the wizard until the final submit. */
export interface RestaurantDraft {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  whatsappNumber: string;
  currencyCode: string;
  defaultLocale: 'en' | 'ar';
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  themeId: string;
}

export const EMPTY_DRAFT: RestaurantDraft = {
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  whatsappNumber: '',
  currencyCode: 'EGP',
  defaultLocale: 'en',
  slug: '',
  primaryColor: '#FF6B35',
  secondaryColor: '#1A1A2E',
  accentColor: '#FFE8DE',
  themeId: '',
};

export interface ThemeOption {
  id: string;
  key: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  isFree: boolean;
  priceCents: number;
  previewImageUrl: string | null;
}

export function toThemeOption(t: Theme): ThemeOption {
  return {
    id: t.id,
    key: t.key,
    name: t.name,
    nameAr: t.nameAr,
    description: t.description,
    descriptionAr: t.descriptionAr,
    isFree: t.isFree,
    priceCents: t.priceCents,
    previewImageUrl: t.previewImageUrl,
  };
}
