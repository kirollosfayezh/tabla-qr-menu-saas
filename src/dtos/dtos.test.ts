import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { PlaceOrderSchema } from './order.dto';
import { ResetPasswordSchema, SignUpSchema } from './auth.dto';
import { SubmitInstapaySchema } from './payment.dto';
import { OptionGroupSchema } from './menu.dto';
import { SlugSchema } from './restaurant.dto';
import { UpdateThemeSchema } from './admin.dto';

const baseOrder = () => ({
  restaurantId: randomUUID(),
  lines: [{ itemId: randomUUID(), qty: 1 }],
  locale: 'en',
});

describe('PlaceOrderSchema', () => {
  it('defaults fulfillment to DINE_IN and optionIds to []', () => {
    const parsed = PlaceOrderSchema.parse(baseOrder());
    expect(parsed.fulfillmentType).toBe('DINE_IN');
    expect(parsed.lines[0].optionIds).toEqual([]);
  });

  it('requires phone and address for delivery', () => {
    const result = PlaceOrderSchema.safeParse({ ...baseOrder(), fulfillmentType: 'DELIVERY', customerPhone: '  ' });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining(['customerPhone', 'deliveryAddress']));
  });

  it('bounds quantity, cart size and coordinates', () => {
    expect(PlaceOrderSchema.safeParse({ ...baseOrder(), lines: [{ itemId: randomUUID(), qty: 0 }] }).success).toBe(false);
    expect(PlaceOrderSchema.safeParse({ ...baseOrder(), lines: [{ itemId: randomUUID(), qty: 100 }] }).success).toBe(false);
    expect(PlaceOrderSchema.safeParse({ ...baseOrder(), lines: [] }).success).toBe(false);
    expect(PlaceOrderSchema.safeParse({ ...baseOrder(), deliveryLat: 91 }).success).toBe(false);
  });

  it('rejects non-uuid ids and unsupported locales', () => {
    expect(PlaceOrderSchema.safeParse({ ...baseOrder(), restaurantId: 'rest-1' }).success).toBe(false);
    expect(PlaceOrderSchema.safeParse({ ...baseOrder(), locale: 'fr' }).success).toBe(false);
  });
});

describe('auth DTOs', () => {
  const signUp = { name: 'Kiro', email: '  Owner@Example.COM ', password: 'secret123', confirmPassword: 'secret123', turnstileToken: 't' };

  it('normalizes the email and accepts a valid sign-up', () => {
    expect(SignUpSchema.parse(signUp).email).toBe('owner@example.com');
  });

  it('enforces password rules and matching confirmation', () => {
    expect(SignUpSchema.safeParse({ ...signUp, password: 'letters-only', confirmPassword: 'letters-only' }).success).toBe(false);
    expect(SignUpSchema.safeParse({ ...signUp, password: 'short1', confirmPassword: 'short1' }).success).toBe(false);
    const mismatch = SignUpSchema.safeParse({ ...signUp, confirmPassword: 'different1' });
    expect(mismatch.error?.issues[0].path).toEqual(['confirmPassword']);
  });

  it('rejects reset tokens shorter than 32 characters', () => {
    expect(ResetPasswordSchema.safeParse({ token: 'abc', password: 'secret123', confirmPassword: 'secret123' }).success).toBe(false);
  });
});

describe('payment and catalog DTOs', () => {
  it('InstaPay needs exactly one of plan or theme', () => {
    expect(SubmitInstapaySchema.safeParse({ planKey: 'studio' }).success).toBe(true);
    expect(SubmitInstapaySchema.safeParse({ themeKey: 'elegant' }).success).toBe(true);
    expect(SubmitInstapaySchema.safeParse({}).success).toBe(false);
    expect(SubmitInstapaySchema.safeParse({ planKey: 'studio', themeKey: 'elegant' }).success).toBe(false);
  });

  it('option groups must have maxSelect >= minSelect and at least one option', () => {
    const group = { name: 'Size', minSelect: 2, maxSelect: 1, options: [{ label: 'S', priceDeltaCents: 0 }] };
    expect(OptionGroupSchema.safeParse(group).success).toBe(false);
    expect(OptionGroupSchema.safeParse({ ...group, maxSelect: 2 }).success).toBe(true);
    expect(OptionGroupSchema.safeParse({ ...group, maxSelect: 2, options: [] }).success).toBe(false);
  });

  it('coerces form-string prices on option choices', () => {
    const parsed = OptionGroupSchema.parse({ name: 'Size', options: [{ label: 'L', priceDeltaCents: '1500' }] });
    expect(parsed.options[0].priceDeltaCents).toBe(1500);
  });

  it('slugs are lowercased and may not use reserved subdomains', () => {
    expect(SlugSchema.parse('  Cafe-Nile ')).toBe('cafe-nile');
    expect(SlugSchema.safeParse('admin').success).toBe(false);
    expect(SlugSchema.safeParse('bad_slug').success).toBe(false);
  });

  it('partial theme updates keep undefined fields undefined', () => {
    const parsed = UpdateThemeSchema.parse({ id: randomUUID(), name: 'Elegant' });
    expect(parsed.priceCents).toBeUndefined();
    expect(parsed.isActive).toBeUndefined();
  });
});
