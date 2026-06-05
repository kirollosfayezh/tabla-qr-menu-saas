import type { CSSProperties } from 'react';

/** Lucide-style icon set used by the theme store + live preview (1.6px stroke, 24px grid). */
const PATHS: Record<string, string> = {
  sparkle: 'M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5 10.1 11.9 4.5 10l5.6-1.4L12 3z',
  check: 'M5 12l5 5L20 7',
  minus: 'M5 12h14',
  plus: 'M12 5v14M5 12h14',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z',
  play: 'M6 4l14 8-14 8z',
  palette:
    'M12 22a10 10 0 110-20 10 10 0 016 18.1A4.1 4.1 0 0114 18.1c0-.6.2-1.2.6-1.7A2.5 2.5 0 0014 13H12a2 2 0 01-2-2c0-1.5 1-2.5 2.5-2.5M7.5 11A1.5 1.5 0 116 9.5 1.5 1.5 0 017.5 11zM13 7.5A1.5 1.5 0 1111.5 6 1.5 1.5 0 0113 7.5zM18.5 11A1.5 1.5 0 1117 9.5a1.5 1.5 0 011.5 1.5z',
  refresh: 'M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16',
  arrowLeft: 'M19 12H5M11 5l-7 7 7 7',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  x: 'M18 6L6 18M6 6l12 12',
  cart: 'M3 3h2l3 13h12l3-9H7M7 21a1 1 0 100-2 1 1 0 000 2zM19 21a1 1 0 100-2 1 1 0 000 2z',
  star: 'M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1 7 14.2 2 9.3l7-1z',
  phone: 'M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zM11 19h2',
  tablet: 'M5 2h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1zM10 19h4',
  laptop: 'M4 5h16v11H4zM2 20h20',
  call:
    'M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z',
  whatsapp:
    'M12 2a10 10 0 00-8.7 14.9L2 22l5.3-1.4A10 10 0 1012 2zm5.4 14.4c-.2.7-1.2 1.3-1.7 1.4-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.4-3.8-4.5-4-.1-.2-1-1.4-1-2.6 0-1.3.6-1.9.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.8 0 .1.1.3 0 .4-.1.2-.1.3-.3.5l-.3.4c-.1.1-.2.2-.1.4.1.3.5 1 1.2 1.6.8.7 1.5 1 1.7 1.1.2.1.4.1.5-.1.2-.2.6-.7.8-1 .2-.3.4-.2.6-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3.1.2.1.7-.1 1.3z',
};

export interface StoreIconProps {
  name: keyof typeof PATHS | string;
  size?: number;
  stroke?: number;
  color?: string;
  style?: CSSProperties;
}

/** Pure SVG icon — safe in server or client trees. */
export function StoreIcon({ name, size = 20, stroke = 1.6, color = 'currentColor', style }: StoreIconProps): React.JSX.Element {
  const d = PATHS[name] ?? PATHS.x!;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
