import { localizedField } from '../helpers';
import { ClassicHeaderActions, ClassicTableBadge } from '../classic/header-actions';
import { HeroStrip } from '../shared/hero-strip';
import type { RestaurantSnapshot } from '../theme.types';

interface Props {
  restaurant: RestaurantSnapshot;
  locale: 'en' | 'ar';
}

/** Elegant theme header — when hero photos exist, full-bleed backdrop with name overlaid. Without photos, centered serif layout with gold accents. */
export function ElegantHeader({ restaurant, locale }: Props): React.JSX.Element {
  const name = localizedField(restaurant.name, restaurant.nameAr, locale);
  const description = localizedField(restaurant.description ?? '', restaurant.descriptionAr, locale);
  const hasHero = (restaurant.heroPhotos ?? []).length > 0;

  if (hasHero) {
    return (
      <header className="relative overflow-hidden">
        <HeroStrip
          photos={restaurant.heroPhotos}
          layout={restaurant.heroLayout}
          scale={restaurant.heroImageScale}
          containerClass="w-full h-56"
          imageClass=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 start-0 end-0 px-5 pb-5 text-center">
          <ClassicHeaderActions locale={locale} />
          {description ? (
            <p className="mx-auto inline-block border-y border-[var(--d-primary)] px-4 py-0.5 font-serif text-[11px] italic uppercase tracking-[0.18em] text-[var(--d-primary)]">
              {description}
            </p>
          ) : null}
          <h1 className="mt-3 font-serif text-4xl font-normal leading-none tracking-wide text-white">{name}</h1>
          <div className="mt-3 flex justify-center">
            <ClassicTableBadge restaurantId={restaurant.id} locale={locale} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="px-5 pb-6 pt-6">
      <ClassicHeaderActions locale={locale} />
      <div className="text-center">
        {description ? (
          <p className="mx-auto inline-block border-y border-[var(--d-primary)] px-4 py-0.5 font-serif text-[11px] italic uppercase tracking-[0.18em] text-[var(--d-primary)]">
            {description}
          </p>
        ) : null}
        <h1 className="mt-4 font-serif text-4xl font-normal leading-none tracking-wide text-[var(--d-text)]">{name}</h1>
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-[var(--d-text-soft)]">
          <span className="h-px w-3 bg-[var(--d-primary)]" />
          <span className="font-serif italic">{locale === 'ar' ? 'منذ ٢٠١٨' : 'Est · 2018'}</span>
          <span className="h-px w-3 bg-[var(--d-primary)]" />
        </div>
        <div className="mt-3 flex justify-center">
          <ClassicTableBadge restaurantId={restaurant.id} locale={locale} />
        </div>
      </div>
    </header>
  );
}
