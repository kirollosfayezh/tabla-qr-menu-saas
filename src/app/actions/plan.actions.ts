'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AdminPlanRepository } from '@/repositories/admin/admin-plan.repository';

const PriceFields = z.object({
  monthlyPriceCents: z.coerce.number().int().min(0).max(99999900),
  yearlyPriceCents:  z.coerce.number().int().min(0).max(99999900),
});

const UpdatePlanSchema = z.object({
  key:           z.string().min(1),
  maxItems:      z.coerce.number().int().min(1).max(999999),
  maxCategories: z.coerce.number().int().min(1).max(999999),
  themeIds:      z.array(z.string().uuid()),
}).merge(PriceFields);

const CreatePlanSchema = z.object({
  key:           z.string().min(2).max(32).regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers and underscores only'),
  name:          z.string().min(2).max(60),
  nameAr:        z.string().max(60).default(''),
  maxItems:      z.coerce.number().int().min(1).max(999999),
  maxCategories: z.coerce.number().int().min(1).max(999999),
  themeIds:      z.array(z.string().uuid()),
}).merge(PriceFields);

export type PlanActionResult =
  | { ok: true }
  | { ok: false; message: string };

/** Admin-only: create a new plan with limits and accessible themes. */
export async function createPlanAction(input: unknown): Promise<PlanActionResult> {
  try {
    await requireAdmin();
    const parsed = CreatePlanSchema.parse(input);
    const repo = new AdminPlanRepository();
    await repo.create({
      key:               parsed.key,
      name:              parsed.name,
      nameAr:            parsed.nameAr,
      maxItems:          parsed.maxItems,
      maxCategories:     parsed.maxCategories,
      monthlyPriceCents: parsed.monthlyPriceCents,
      yearlyPriceCents:  parsed.yearlyPriceCents,
    });
    await repo.setThemeAccess(parsed.key, parsed.themeIds);
    revalidatePath('/admin/packages');
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Create failed' };
  }
}

/** Admin-only: update plan limits and accessible themes. */
export async function updatePlanAction(input: unknown): Promise<PlanActionResult> {
  try {
    await requireAdmin();
    const parsed = UpdatePlanSchema.parse(input);
    const repo = new AdminPlanRepository();
    await Promise.all([
      repo.updateLimits(parsed.key, parsed.maxItems, parsed.maxCategories, parsed.monthlyPriceCents, parsed.yearlyPriceCents),
      repo.setThemeAccess(parsed.key, parsed.themeIds),
    ]);
    revalidatePath('/admin/packages');
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Update failed' };
  }
}
