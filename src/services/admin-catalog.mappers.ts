import type { Prisma } from '@prisma/client';
import type { AdminThemeRepository } from '@/repositories/admin/admin-theme.repository';
import type {
  CreatePackageDTO,
  CreateThemeDTO,
  UpdatePackageDTO,
  UpdateThemeDTO,
} from '@/dtos/admin.dto';

/**
 * Pure DTO → repository-input mappers for the admin theme/package catalog.
 *
 * Convention: on create, an empty optional string is stored as NULL. On update,
 * `''` means "clear this field" (NULL) while `undefined` means "leave unchanged".
 */

type PackageCreateData = Parameters<AdminThemeRepository['createPackage']>[0];
type PackageUpdateData = Parameters<AdminThemeRepository['updatePackage']>[1];

const clearIfEmpty = (value: string | undefined): string | null | undefined => (value === '' ? null : value);

export function toThemeCreateData(input: CreateThemeDTO): Prisma.ThemeCreateInput {
  return {
    key: input.key,
    name: input.name,
    nameAr: input.nameAr || null,
    description: input.description || null,
    descriptionAr: input.descriptionAr || null,
    previewImageUrl: input.previewImageUrl || null,
    design: input.design as Prisma.InputJsonValue,
    isFree: input.isFree,
    priceCents: input.priceCents,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  };
}

export function toThemeUpdateData(input: UpdateThemeDTO): Prisma.ThemeUpdateInput {
  return {
    key: input.key,
    name: input.name,
    nameAr: clearIfEmpty(input.nameAr),
    description: clearIfEmpty(input.description),
    descriptionAr: clearIfEmpty(input.descriptionAr),
    previewImageUrl: clearIfEmpty(input.previewImageUrl),
    design: input.design ? (input.design as Prisma.InputJsonValue) : undefined,
    isFree: input.isFree,
    priceCents: input.priceCents,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  };
}

export function toPackageCreateData(input: CreatePackageDTO): PackageCreateData {
  return {
    name: input.name,
    nameAr: input.nameAr || null,
    description: input.description || null,
    descriptionAr: input.descriptionAr || null,
    priceCents: input.priceCents,
    currencyCode: input.currencyCode,
    themeIds: input.themeIds,
  };
}

export function toPackageUpdateData(input: UpdatePackageDTO): PackageUpdateData {
  return {
    name: input.name,
    nameAr: clearIfEmpty(input.nameAr),
    description: clearIfEmpty(input.description),
    descriptionAr: clearIfEmpty(input.descriptionAr),
    priceCents: input.priceCents,
    currencyCode: input.currencyCode,
    isActive: input.isActive,
    themeIds: input.themeIds,
  };
}
