import { localizedField } from '../helpers';
import { ClassicHeaderActions, ClassicTableBadge } from '../classic/header-actions';
import { HeroStrip } from '../shared/hero-strip';
import type { RestaurantSnapshot } from '../theme.types';

interface Props {
  restaurant: RestaurantSnapshot;
  locale: 'en' | 'ar';
}

/** Modern theme header — table label + huge serif name, search input below. */
export function ModernHeader({ restaurant, locale }: Props): React.JSX.Element {
  const name = localizedField(restaurant.name, restaurant.nameAr, locale);
  const description = localizedField(restaurant.description ?? '', restaurant.descriptionAr, locale);
  return (
    <header className="px-5 pb-4 pt-6">
      <ClassicHeaderActions locale={locale} />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--d-text-soft)]">{description || 'Menu'}</p>
      <h1 className="mt-1 font-display text-4xl font-bold leading-[1] tracking-tight text-[var(--d-text)]">
        {name}
      </h1>
      <ClassicTableBadge restaurantId={restaurant.id} locale={locale} />
      <HeroStrip
        photos={restaurant.heroPhotos}
        layout={restaurant.heroLayout}
        scale={restaurant.heroImageScale}
        containerClass="mt-4"
        imageClass="rounded-2xl"
      />
    </header>
  );
}
