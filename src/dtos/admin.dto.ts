import { z } from 'zod';

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;

export const SetRestaurantStatusSchema = z.object({
  restaurantId: z.string().uuid(),
  status: z.enum(['PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED']),
});
export type SetRestaurantStatusDTO = z.infer<typeof SetRestaurantStatusSchema>;

export const SetUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['OWNER', 'ADMIN']),
});
export type SetUserRoleDTO = z.infer<typeof SetUserRoleSchema>;

export const RefundPaymentSchema = z.object({
  paymentId: z.string().uuid(),
});
export type RefundPaymentDTO = z.infer<typeof RefundPaymentSchema>;

const ThemeBase = z.object({
  key: z.string().trim().min(2).max(40).regex(/^[a-z0-9-]+$/, 'lowercase, digits, hyphens'),
  name: z.string().trim().min(2).max(80),
  nameAr: z.string().trim().max(80).optional().or(z.literal('')).transform((v) => v ?? ''),
  description: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v ?? ''),
  descriptionAr: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v ?? ''),
  previewImageUrl: z.string().url().optional().or(z.literal('')).transform((v) => v ?? ''),
  isFree: z.boolean(),
  priceCents: z.coerce.number().int().min(0),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
export const CreateThemeSchema = ThemeBase;
export const UpdateThemeSchema = ThemeBase.partial().extend({ id: z.string().uuid() });
export type CreateThemeDTO = z.infer<typeof CreateThemeSchema>;
export type UpdateThemeDTO = z.infer<typeof UpdateThemeSchema>;

export const DeleteThemeSchema = z.object({ id: z.string().uuid() });
export type DeleteThemeDTO = z.infer<typeof DeleteThemeSchema>;

const PackageBase = z.object({
  name: z.string().trim().min(2).max(80),
  nameAr: z.string().trim().max(80).optional().or(z.literal('')).transform((v) => v ?? ''),
  description: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v ?? ''),
  descriptionAr: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v ?? ''),
  priceCents: z.coerce.number().int().min(0),
  currencyCode: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  themeIds: z.array(z.string().uuid()).min(1, 'Pick at least one theme'),
  isActive: z.boolean(),
});
export const CreatePackageSchema = PackageBase;
export const UpdatePackageSchema = PackageBase.partial().extend({ id: z.string().uuid() });
export type CreatePackageDTO = z.infer<typeof CreatePackageSchema>;
export type UpdatePackageDTO = z.infer<typeof UpdatePackageSchema>;

export const DeletePackageSchema = z.object({ id: z.string().uuid() });

// Re-export hex color for callers that need it.
export const HEX_COLOR_RE = HEX_COLOR;
