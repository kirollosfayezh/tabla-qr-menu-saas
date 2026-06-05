'use client';

// ── Tabla theme store — device frames (phone / tablet / laptop) ─────────────
import type { ReactNode } from 'react';
import type { DeviceKey } from './menu-types';

export interface DeviceSpec {
  key: DeviceKey;
  label: string;
  icon: 'phone' | 'tablet' | 'laptop';
  w: number;
  h: number;
}

export const DEVICES: Record<DeviceKey, DeviceSpec> = {
  phone: { key: 'phone', label: 'Phone', icon: 'phone', w: 390, h: 844 },
  tablet: { key: 'tablet', label: 'Tablet', icon: 'tablet', w: 760, h: 1024 },
  laptop: { key: 'laptop', label: 'Laptop', icon: 'laptop', w: 1280, h: 800 },
};

/** Holds children at native device size; the parent scales the whole frame. */
export function DeviceFrame({ device, children }: { device: DeviceKey; children: ReactNode }): React.JSX.Element {
  if (device === 'phone') {
    return (
      <div style={{ width: 390, height: 844, borderRadius: 56, background: '#0F0F1A', padding: 11, boxShadow: '0 40px 100px rgba(0,0,0,0.45)', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 17, left: '50%', transform: 'translateX(-50%)', width: 120, height: 30, background: '#0F0F1A', borderRadius: 16, zIndex: 60, pointerEvents: 'none' }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 46, overflow: 'hidden', background: '#fff', position: 'relative' }}>{children}</div>
      </div>
    );
  }
  if (device === 'tablet') {
    return (
      <div style={{ width: 760, height: 1024, borderRadius: 34, background: '#0F0F1A', padding: 16, boxShadow: '0 40px 100px rgba(0,0,0,0.45)', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: 4, background: '#2A2A35', zIndex: 60 }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', background: '#fff', position: 'relative' }}>{children}</div>
      </div>
    );
  }
  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 1280, height: 800, borderRadius: '18px 18px 0 0', background: '#0F0F1A', padding: 14, boxShadow: '0 40px 100px rgba(0,0,0,0.45)' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 6, overflow: 'hidden', background: '#fff', position: 'relative' }}>{children}</div>
      </div>
      <div style={{ width: 1480, height: 26, background: 'linear-gradient(#1c1c24,#0F0F1A)', borderRadius: '0 0 16px 16px', position: 'relative', boxShadow: '0 30px 50px rgba(0,0,0,0.35)' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 160, height: 9, background: '#000', borderRadius: '0 0 9px 9px' }} />
      </div>
    </div>
  );
}
