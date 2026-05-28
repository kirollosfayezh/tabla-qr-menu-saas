'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import {
  CreatePackageSchema,
  CreateThemeSchema,
  DeletePackageSchema,
  DeleteThemeSchema,
  RefundPaymentSchema,
  SetRestaurantStatusSchema,
  SetUserRoleSchema,
  UpdatePackageSchema,
  UpdateThemeSchema,
  type CreatePackageDTO,
  type CreateThemeDTO,
  type RefundPaymentDTO,
  type SetRestaurantStatusDTO,
  type SetUserRoleDTO,
  type UpdatePackageDTO,
  type UpdateThemeDTO,
} from '@/dtos/admin.dto';
import { AdminService } from '@/services/admin.service';
import { requireAdmin } from '@/lib/admin/require-admin';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';

export type AdminActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

export async function setRestaurantStatusAction(input: SetRestaurantStatusDTO): Promise<AdminActionResult> {
  return run('setRestaurantStatus', async () => {
    const actor = await requireAdmin();
    const parsed = SetRestaurantStatusSchema.parse(input);
    await new AdminService().setRestaurantStatus(actor, parsed.restaurantId, parsed.status);
    revalidatePath('/admin/restaurants');
    revalidatePath('/admin');
  });
}

export async function setUserRoleAction(input: SetUserRoleDTO): Promise<AdminActionResult> {
  return run('setUserRole', async () => {
    const actor = await requireAdmin();
    const parsed = SetUserRoleSchema.parse(input);
    await new AdminService().setUserRole(actor, parsed.userId, parsed.role);
    revalidatePath('/admin/users');
  });
}

export async function refundPaymentAction(input: RefundPaymentDTO): Promise<AdminActionResult> {
  return run('refundPayment', async () => {
    const actor = await requireAdmin();
    const parsed = RefundPaymentSchema.parse(input);
    await new AdminService().refundPayment(actor, parsed.paymentId);
    revalidatePath('/admin/payments');
  });
}

export async function createThemeAction(input: CreateThemeDTO): Promise<AdminActionResult> {
  return run('createTheme', async () => {
    const actor = await requireAdmin();
    const parsed = CreateThemeSchema.parse(input);
    await new AdminService().createTheme(actor, parsed);
    revalidatePath('/admin/themes');
  });
}

export async function updateThemeAction(input: UpdateThemeDTO): Promise<AdminActionResult> {
  return run('updateTheme', async () => {
    const actor = await requireAdmin();
    const parsed = UpdateThemeSchema.parse(input);
    await new AdminService().updateTheme(actor, parsed);
    revalidatePath('/admin/themes');
  });
}

export async function deleteThemeAction(input: { id: string }): Promise<AdminActionResult> {
  return run('deleteTheme', async () => {
    const actor = await requireAdmin();
    const parsed = DeleteThemeSchema.parse(input);
    await new AdminService().deleteTheme(actor, parsed.id);
    revalidatePath('/admin/themes');
  });
}

export async function createPackageAction(input: CreatePackageDTO): Promise<AdminActionResult> {
  return run('createPackage', async () => {
    const actor = await requireAdmin();
    const parsed = CreatePackageSchema.parse(input);
    await new AdminService().createPackage(actor, parsed);
    revalidatePath('/admin/packages');
  });
}

export async function updatePackageAction(input: UpdatePackageDTO): Promise<AdminActionResult> {
  return run('updatePackage', async () => {
    const actor = await requireAdmin();
    const parsed = UpdatePackageSchema.parse(input);
    await new AdminService().updatePackage(actor, parsed);
    revalidatePath('/admin/packages');
  });
}

export async function deletePackageAction(input: { id: string }): Promise<AdminActionResult> {
  return run('deletePackage', async () => {
    const actor = await requireAdmin();
    const parsed = DeletePackageSchema.parse(input);
    await new AdminService().deletePackage(actor, parsed.id);
    revalidatePath('/admin/packages');
  });
}

async function run(
  scope: string,
  body: () => Promise<void>,
): Promise<AdminActionResult> {
  try {
    await body();
    return { ok: true, value: undefined };
  } catch (err) {
    if (err instanceof ZodError) {
      const flat = err.flatten();
      const fieldErrors: Record<string, string> = {};
      for (const [k, msgs] of Object.entries(flat.fieldErrors)) {
        const list = msgs as string[] | undefined;
        if (list?.[0]) fieldErrors[k] = list[0];
      }
      const first = Object.values(fieldErrors)[0] ?? 'Invalid input';
      return { ok: false, code: 'VALIDATION_ERROR', message: first, fieldErrors };
    }
    const e = toAppError(err);
    logger.warn({ scope, code: e.code }, 'admin action rejected');
    return { ok: false, code: e.code, message: e.message };
  }
}
