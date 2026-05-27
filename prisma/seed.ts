import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Seed initial themes registered in code (src/themes/*). */
async function main(): Promise<void> {
  await prisma.theme.upsert({
    where: { key: 'classic' },
    update: {},
    create: {
      key: 'classic',
      name: 'Classic',
      nameAr: 'كلاسيك',
      description: 'Warm, traditional bistro feel.',
      descriptionAr: 'إحساس دافئ وتقليدي.',
      isFree: true,
      priceCents: 0,
      sortOrder: 1,
    },
  });

  await prisma.theme.upsert({
    where: { key: 'modern' },
    update: {},
    create: {
      key: 'modern',
      name: 'Modern',
      nameAr: 'حديث',
      description: 'Clean, minimalist café look.',
      descriptionAr: 'مظهر بسيط وعصري.',
      isFree: false,
      priceCents: 49900,
      sortOrder: 2,
    },
  });

  await prisma.theme.upsert({
    where: { key: 'elegant' },
    update: {},
    create: {
      key: 'elegant',
      name: 'Elegant',
      nameAr: 'أنيق',
      description: 'Upscale fine-dining theme.',
      descriptionAr: 'تصميم راقٍ للمطاعم الفاخرة.',
      isFree: false,
      priceCents: 99900,
      sortOrder: 3,
    },
  });

  console.warn('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
