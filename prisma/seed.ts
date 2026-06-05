import { PrismaClient } from '@prisma/client';
import { THEME_DESIGN_PRESETS, DEFAULT_THEME_DESIGN } from '../src/dtos/theme-design.dto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // ── Themes ─────────────────────────────────────────────────────────────────
  const themeRows = [
    { key: 'classic', name: 'Classic', nameAr: 'كلاسيك',  description: 'Warm, traditional bistro feel.',               descriptionAr: 'إحساس دافئ وتقليدي.',                             isFree: true,  priceCents: 0,     sortOrder: 1 },
    { key: 'garden',  name: 'Garden',  nameAr: 'حديقة',   description: 'Fresh, green bistro list — a clean digital menu.', descriptionAr: 'قائمة بيسترو خضراء ومنعشة — قائمة رقمية أنيقة.', isFree: true,  priceCents: 0,     sortOrder: 2 },
    { key: 'modern',  name: 'Modern',  nameAr: 'حديث',    description: 'Clean, minimalist café look.',                 descriptionAr: 'مظهر بسيط وعصري.',                                isFree: false, priceCents: 49900, sortOrder: 3 },
    { key: 'omakase', name: 'Omakase', nameAr: 'أوماكاسي', description: 'Editorial, refined photo menu that sells.',   descriptionAr: 'قائمة مصوّرة راقية بأسلوب تحريري تبيع.',         isFree: false, priceCents: 49900, sortOrder: 4 },
    { key: 'elegant', name: 'Elegant', nameAr: 'أنيق',    description: 'Upscale fine-dining theme.',                   descriptionAr: 'تصميم راقٍ للمطاعم الفاخرة.',                     isFree: false, priceCents: 99900, sortOrder: 5 },
    { key: 'street',  name: 'Street',  nameAr: 'شارع',    description: 'Bold poster-style with strong contrast.',      descriptionAr: 'تصميم جريء بأسلوب بوسترات الشارع وتباين قوي.',   isFree: false, priceCents: 79900, sortOrder: 6 },
  ];

  for (const t of themeRows) {
    const design = THEME_DESIGN_PRESETS[t.key] ?? DEFAULT_THEME_DESIGN;
    await prisma.theme.upsert({
      where: { key: t.key },
      update: { name: t.name, nameAr: t.nameAr, description: t.description, descriptionAr: t.descriptionAr, isFree: t.isFree, priceCents: t.priceCents, sortOrder: t.sortOrder, isActive: true, design },
      create: { ...t, isActive: true, design },
    });
  }

  const allThemes = await prisma.theme.findMany({ select: { id: true, key: true } });
  const themeId = (key: string) => allThemes.find((t) => t.key === key)!.id;

  // ── Plans ──────────────────────────────────────────────────────────────────
  // free_trial: classic + garden, 5 items, 5 categories
  // studio:     classic, garden, modern, omakase — 100 items, 20 categories
  // group:      all 6 themes, unlimited items, unlimited categories

  await prisma.plan.upsert({
    where: { key: 'free_trial' },
    update: { name: 'Free Trial', nameAr: 'تجربة مجانية', maxItems: 5, maxCategories: 5, monthlyPriceCents: 0, yearlyPriceCents: 0, sortOrder: 1 },
    create: { key: 'free_trial', name: 'Free Trial', nameAr: 'تجربة مجانية', maxItems: 5, maxCategories: 5, monthlyPriceCents: 0, yearlyPriceCents: 0, sortOrder: 1 },
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
  // free_trial: classic + garden
  const freeTrialThemes = ['classic', 'garden'];
  // studio:     classic, garden, modern, omakase
  const studioThemes    = ['classic', 'garden', 'modern', 'omakase'];
  // group:      all
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
