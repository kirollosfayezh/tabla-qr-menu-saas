import { z } from 'zod';

const uuid = z.string().uuid();
const bilingualOptional = z.string().trim().max(120).optional().or(z.literal(''));
const bilingualDescription = z.string().trim().max(500).optional().or(z.literal(''));

/** Category creation payload. */
export const CreateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  nameAr: bilingualOptional,
});

export const RenameCategorySchema = z.object({
  id: uuid,
  name: z.string().trim().min(1).max(80),
  nameAr: bilingualOptional,
});

export const ReorderSchema = z.object({
  ids: z.array(uuid).min(1).max(500),
});

/** Item creation payload. priceCents stored as integer minor units. */
export const CreateItemSchema = z.object({
  categoryId: uuid,
  name: z.string().trim().min(1, 'Name is required').max(120),
  nameAr: bilingualOptional,
  description: bilingualDescription,
  descriptionAr: bilingualDescription,
  priceCents: z.number().int().min(0).max(100_000_000),
  imageUrl: z.string().url().max(500).optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
  allergens: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
});

export const UpdateItemSchema = CreateItemSchema.extend({ id: uuid });

/** One choice inside an option group (e.g. "Large +20 EGP"). */
export const OptionChoiceSchema = z.object({
  id: uuid.optional(),
  label: z.string().trim().min(1).max(80),
  labelAr: bilingualOptional.transform((v) => v ?? ''),
  priceDeltaCents: z.coerce.number().int().min(-1_000_000).max(1_000_000),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

/** An option group attached to an item (e.g. "Size" with min=1 max=1). */
export const OptionGroupSchema = z
  .object({
    id: uuid.optional(),
    name: z.string().trim().min(1).max(80),
    nameAr: bilingualOptional.transform((v) => v ?? ''),
    minSelect: z.coerce.number().int().min(0).max(20).default(0),
    maxSelect: z.coerce.number().int().min(1).max(20).default(1),
    required: z.boolean().default(false),
    sortOrder: z.coerce.number().int().min(0).default(0),
    options: z.array(OptionChoiceSchema).min(1, 'Add at least one option').max(40),
  })
  .refine((g) => g.maxSelect >= g.minSelect, { path: ['maxSelect'], message: 'Max must be ≥ min' });

export const SaveItemOptionsSchema = z.object({
  itemId: uuid,
  groups: z.array(OptionGroupSchema).max(20).default([]),
});

export type OptionChoiceDTO = z.infer<typeof OptionChoiceSchema>;
export type OptionGroupDTO = z.infer<typeof OptionGroupSchema>;
export type SaveItemOptionsDTO = z.infer<typeof SaveItemOptionsSchema>;

export const ToggleAvailabilitySchema = z.object({
  id: uuid,
  isAvailable: z.boolean(),
});

export const ReorderItemsSchema = z.object({
  categoryId: uuid,
  ids: z.array(uuid).min(1).max(1000),
});

/** Bulk update prices for items in one category. */
export const BulkPriceUpdateSchema = z
  .object({
    categoryId: uuid,
    mode: z.enum(['percent', 'absolute']),
    /** Percent: -90..+1000. Absolute: priceCents to set. */
    value: z.number().finite(),
  })
  .refine((d) => (d.mode === 'percent' ? d.value >= -90 && d.value <= 1000 : d.value >= 0), {
    path: ['value'],
    message: 'Value out of range',
  });

/**
 * Strict client-side form schema for the item editor.
 * Differs from CreateItemSchema: price must be > 0 and image URL is fully optional.
 * Server still validates with CreateItemSchema/UpdateItemSchema as the source of truth.
 * Error messages are i18n keys (resolved by the modal), not English literals.
 */
export const ItemFormSchema = z.object({
  categoryId: uuid,
  name: z.string().trim().min(1, 'errors.nameRequired').max(120, 'errors.nameTooLong'),
  nameAr: z.string().trim().max(120, 'errors.nameTooLong').optional().or(z.literal('')),
  description: z.string().trim().max(500, 'errors.descTooLong').optional().or(z.literal('')),
  descriptionAr: z.string().trim().max(500, 'errors.descTooLong').optional().or(z.literal('')),
  priceCents: z
    .number({ message: 'errors.priceRequired' })
    .int('errors.priceInvalid')
    .positive('errors.priceRequired')
    .max(100_000_000, 'errors.priceTooLarge'),
  imageUrl: z.string().url().max(500).optional().or(z.literal('')),
  isAvailable: z.boolean(),
  tags: z.array(z.string().trim().min(1).max(30)).max(20),
  allergens: z.array(z.string().trim().min(1).max(30)).max(20),
});
export type ItemFormDTO = z.infer<typeof ItemFormSchema>;

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
export type RenameCategoryDTO = z.infer<typeof RenameCategorySchema>;
export type ReorderDTO = z.infer<typeof ReorderSchema>;
export type CreateItemDTO = z.infer<typeof CreateItemSchema>;
export type UpdateItemDTO = z.infer<typeof UpdateItemSchema>;
export type ToggleAvailabilityDTO = z.infer<typeof ToggleAvailabilitySchema>;
export type ReorderItemsDTO = z.infer<typeof ReorderItemsSchema>;
export type BulkPriceUpdateDTO = z.infer<typeof BulkPriceUpdateSchema>;
