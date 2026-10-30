import { describe, expect, it } from 'vitest';
import { parseHost } from './host-parser';

describe('parseHost', () => {
  const root = 'tabla.app';

  it('returns no tenant for the apex and www', () => {
    expect(parseHost('tabla.app', root)).toMatchObject({ subdomain: null, reserved: false });
    expect(parseHost('www.tabla.app', root)).toMatchObject({ subdomain: null, reserved: false });
  });

  it('extracts the tenant subdomain, ignoring case and port', () => {
    expect(parseHost('Cafe-Nile.Tabla.app:3000', root)).toEqual({ subdomain: 'cafe-nile', reserved: false, host: 'cafe-nile.tabla.app' });
  });

  it('flags reserved system subdomains instead of treating them as tenants', () => {
    expect(parseHost('admin.tabla.app', root)).toMatchObject({ subdomain: null, reserved: true });
    expect(parseHost('api.tabla.app', root)).toMatchObject({ subdomain: null, reserved: true });
  });

  it('does not match look-alike domains', () => {
    expect(parseHost('cafe.eviltabla.app', root).subdomain).toBeNull();
    expect(parseHost('tabla.app.evil.com', root).subdomain).toBeNull();
  });
});
