import { localizedField } from '../helpers';
import { ClassicHeaderActions, ClassicTableBadge } from '../classic/header-actions';
import { HeroStrip } from '../shared/hero-strip';
import type { RestaurantSnapshot } from '../theme.types';

interface Props {
  restaurant: RestaurantSnapshot;
  locale: 'en' | 'ar';
}

/** Modern theme header — when hero photos exist, they fill the top as a full-bleed backdrop with the restaurant name overlaid. Without photos, plain dark header. */
export function ModernHeader({ restaurant, locale }: Props): React.JSX.Element {
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
          containerClass="w-full h-52"
          imageClass=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 start-0 end-0 px-5 pb-4 pt-2">
          <ClassicHeaderActions locale={locale} />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{description || 'Menu'}</p>
          <h1 className="mt-0.5 font-display text-4xl font-bold leading-[1] tracking-tight text-white">{name}</h1>
          <ClassicTableBadge restaurantId={restaurant.id} locale={locale} />
        </div>
      </header>
    );
  }

  return (
    <header className="px-5 pb-4 pt-6">
      <ClassicHeaderActions locale={locale} />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--d-text-soft)]">{description || 'Menu'}</p>
      <h1 className="mt-1 font-display text-4xl font-bold leading-[1] tracking-tight text-[var(--d-text)]">{name}</h1>
      <ClassicTableBadge restaurantId={restaurant.id} locale={locale} />
    </header>
  );
}
