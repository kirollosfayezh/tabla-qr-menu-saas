import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // ── Themes ─────────────────────────────────────────────────────────────────
  const themeRows = [
    { key: 'classic',  name: 'Classic',  nameAr: 'كلاسيك',  description: 'Warm, traditional bistro feel.',                    descriptionAr: 'إحساس دافئ وتقليدي.',                               isFree: true,  priceCents: 0,     sortOrder: 1 },
    { key: 'modern',   name: 'Modern',   nameAr: 'حديث',    description: 'Clean, minimalist café look.',                      descriptionAr: 'مظهر بسيط وعصري.',                                  isFree: false, priceCents: 49900, sortOrder: 2 },
    { key: 'elegant',  name: 'Elegant',  nameAr: 'أنيق',    description: 'Upscale fine-dining theme.',                        descriptionAr: 'تصميم راقٍ للمطاعم الفاخرة.',                       isFree: false, priceCents: 99900, sortOrder: 3 },
    { key: 'market',   name: 'Market',   nameAr: 'سوق',     description: 'Bright food-market with animated hero photos.',     descriptionAr: 'تصميم سوق مشرق مع صور متحركة.',                     isFree: false, priceCents: 69900, sortOrder: 4 },
    { key: 'neon',     name: 'Neon',     nameAr: 'نيون',    description: 'Dark, energetic late-night style.',                 descriptionAr: 'تصميم داكن وحيوي للكافيهات الليلية.',               isFree: false, priceCents: 79900, sortOrder: 5 },
    { key: 'coastal',  name: 'Coastal',  nameAr: 'ساحلي',   description: 'Soft, fresh layout for seafood and casual dining.', descriptionAr: 'تصميم هادئ ومنعش للمأكولات البحرية والبرانش.',      isFree: false, priceCents: 69900, sortOrder: 6 },
    { key: 'street',   name: 'Street',   nameAr: 'شارع',    description: 'Bold poster-style with strong contrast.',           descriptionAr: 'تصميم جريء بأسلوب بوسترات الشارع وتباين قوي.',     isFree: false, priceCents: 79900, sortOrder: 7 },
  ];

  for (const t of themeRows) {
    await prisma.theme.upsert({
      where: { key: t.key },
      update: { name: t.name, nameAr: t.nameAr, description: t.description, descriptionAr: t.descriptionAr, priceCents: t.priceCents, sortOrder: t.sortOrder, isActive: true },
      create: { ...t, isActive: true },
    });
  }

  const allThemes = await prisma.theme.findMany({ select: { id: true, key: true } });
  const themeId = (key: string) => allThemes.find((t) => t.key === key)!.id;

  // ── Plans ──────────────────────────────────────────────────────────────────
  // free_trial: classic only, 5 items, 2 categories
  // studio:     classic + modern + elegant + market + coastal, 100 items, 20 categories
  // group:      all themes, unlimited items, unlimited categories

  await prisma.plan.upsert({
    where: { key: 'free_trial' },
    update: { name: 'Free Trial', nameAr: 'تجربة مجانية', maxItems: 5, maxCategories: 2, monthlyPriceCents: 0, yearlyPriceCents: 0, sortOrder: 1 },
    create: { key: 'free_trial', name: 'Free Trial', nameAr: 'تجربة مجانية', maxItems: 5, maxCategories: 2, monthlyPriceCents: 0, yearlyPriceCents: 0, sortOrder: 1 },
  });

  await prisma.plan.upsert({
    where: { key: 'studio' },
    update: { name: 'Studio', nameAr: 'الاستوديو', maxItems: 100, maxCategories: 20, monthlyPriceCents: 29000, yearlyPriceCents: 27840, sortOrder: 2 },
    create: { key: 'studio', name: 'Studio', nameAr: 'الاستوديو', maxItems: 100, maxCategories: 20, monthlyPriceCents: 29000, yearlyPriceCents: 27840, sortOrder: 2 },
  });

  await prisma.plan.upsert({
    where: { key: 'group' },
    update: { name: 'Group', nameAr: 'المجموعة', maxItems: 999999, maxCategories: 999999, monthlyPriceCents: 69000, yearlyPriceCents: 66240, sortOrder: 3 },
    create: { key: 'group', name: 'Group', nameAr: 'المجموعة', maxItems: 999999, maxCategories: 999999, monthlyPriceCents: 69000, yearlyPriceCents: 66240, sortOrder: 3 },
  });

  // ── Plan → Theme access ────────────────────────────────────────────────────
  // free_trial: classic only
  const freeTrialThemes = ['classic'];
  // studio: classic, modern, elegant, market, coastal
  const studioThemes    = ['classic', 'modern', 'elegant', 'market', 'coastal'];
  // group: all
  const groupThemes     = themeRows.map((t) => t.key);

  const planThemeMap: Record<string, string[]> = {
    free_trial: freeTrialThemes,
    studio:     studioThemes,
    group:      groupThemes,
  };

  for (const [planKey, themeKeys] of Object.entries(planThemeMap)) {
    // Remove stale entries first
    await prisma.planTheme.deleteMany({ where: { planKey } });
    // Re-insert
    for (const key of themeKeys) {
      const tid = themeId(key);
      if (!tid) continue;
      await prisma.planTheme.upsert({
        where: { planKey_themeId: { planKey, themeId: tid } },
        update: {},
        create: { planKey, themeId: tid },
      });
    }
  }

  console.warn('Seed complete: themes + plans + plan-theme access seeded.');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
