import type { HeroPhoto } from '../theme.types';

interface Props {
  photos: ReadonlyArray<HeroPhoto>;
  layout: 'featured' | 'grid' | 'strip' | 'stack';
  scale: number;
  /** Tailwind class for the outer container; theme-specific. */
  containerClass?: string;
  /** Tailwind class for image tiles; theme-specific. */
  tileClass?: string;
  /** Tailwind class for the image element itself (rounding etc). */
  imageClass?: string;
}

/**
 * Renders the hero photo block for every diner theme.
 * Honors layout (featured | grid | strip | stack), zoom scale, and per-photo
 * rotation/flip transforms.
 */
export function HeroStrip({
  photos,
  layout,
  scale,
  containerClass = 'mx-auto mt-5 max-w-md',
  tileClass = '',
  imageClass = 'rounded-[18px]',
}: Props): React.JSX.Element | null {
  const visible = (photos ?? []).slice(0, 6);
  if (visible.length === 0) return null;
  const zoom = clampScale(scale);

  if (layout === 'grid') {
    return (
      <div className={`${containerClass} grid grid-cols-2 gap-2`}>
        {visible.slice(0, 4).map((p) => (
          <Tile key={p.url} photo={p} zoom={zoom} imageClass={imageClass} tileClass={`aspect-[4/3] ${tileClass}`} />
        ))}
      </div>
    );
  }
  if (layout === 'strip') {
    return (
      <div className={`${containerClass} flex gap-2 overflow-x-auto pb-1`}>
        {visible.slice(0, 5).map((p) => (
          <Tile key={p.url} photo={p} zoom={zoom} imageClass={imageClass} tileClass={`h-28 min-w-[46%] ${tileClass}`} />
        ))}
      </div>
    );
  }
  if (layout === 'stack') {
    return (
      <div className={`relative ${containerClass} h-44 overflow-hidden rounded-[24px] bg-[var(--d-primary-soft)]`}>
        {visible.slice(0, 3).map((p, index) => (
          <div
            key={p.url}
            className={index === 0
              ? `absolute inset-2 overflow-hidden ${imageClass}`
              : `absolute h-24 w-24 overflow-hidden shadow-lg ${imageClass}`}
            style={index === 1
              ? { insetInlineEnd: 16, bottom: 14 }
              : index === 2
                ? { insetInlineStart: 16, bottom: 14 }
                : undefined}
          >
            <HeroImage photo={p} zoom={zoom} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`${containerClass} h-44 overflow-hidden ${imageClass} bg-[var(--d-primary-soft)]`}>
      <HeroImage photo={visible[0]!} zoom={zoom} />
    </div>
  );
}

function Tile({ photo, zoom, imageClass, tileClass }: { photo: HeroPhoto; zoom: number; imageClass: string; tileClass: string }): React.JSX.Element {
  return (
    <div className={`overflow-hidden bg-[var(--d-primary-soft)] ${imageClass} ${tileClass}`}>
      <HeroImage photo={photo} zoom={zoom} />
    </div>
  );
}

function HeroImage({ photo, zoom }: { photo: HeroPhoto; zoom: number }): React.JSX.Element {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.url}
      alt=""
      className="h-full w-full object-cover"
      style={{ transform: heroTransform(photo, zoom), transformOrigin: 'center center' }}
    />
  );
}

function clampScale(scale: number): number {
  return Math.max(0.7, Math.min(1.4, scale / 100));
}

/** Compose zoom + rotation + flip into one CSS transform. */
export function heroTransform(photo: HeroPhoto, zoom: number): string {
  const sx = photo.flipX ? -1 : 1;
  const sy = photo.flipY ? -1 : 1;
  return `scale(${sx * zoom}, ${sy * zoom}) rotate(${photo.rotation}deg)`;
}
