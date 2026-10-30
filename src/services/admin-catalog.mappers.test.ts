import { describe, expect, it } from 'vitest';
import { toPackageCreateData, toPackageUpdateData } from './admin-catalog.mappers';

describe('admin catalog mappers', () => {
  it('stores empty optional strings as NULL on create', () => {
    const data = toPackageCreateData({
      name: 'Starter', nameAr: '', description: '', descriptionAr: 'وصف',
      priceCents: 1000, currencyCode: 'EGP', themeIds: ['t1'], isActive: true,
    });
    expect(data).toMatchObject({ nameAr: null, description: null, descriptionAr: 'وصف' });
  });

  it("on update, '' clears a field and undefined leaves it unchanged", () => {
    const data = toPackageUpdateData({ id: 'p1', nameAr: '', description: undefined });
    expect(data.nameAr).toBeNull();
    expect(data.description).toBeUndefined();
    expect('isActive' in data && data.isActive).toBeFalsy();
  });
});
