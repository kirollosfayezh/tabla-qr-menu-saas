import { localizedField } from '../helpers';
import type { RestaurantSnapshot } from '../theme.types';
import { ClassicHeaderActions, ClassicTableBadge } from './header-actions';

interface Props {
  restaurant: RestaurantSnapshot;
  locale: 'en' | 'ar';
}

/** Hero band at the top of the Classic theme: actions row, logo, name, tagline, table badge. */
export function ClassicHeader({ restaurant, locale }: Props): React.JSX.Element {
  const name = localizedField(restaurant.name, restaurant.nameAr, locale);
  const description = localizedField(
    restaurant.description ?? '',
    restaurant.descriptionAr,
    locale,
  );

  return (
    <header className="px-4 pb-6 pt-5 text-center">
      <ClassicHeaderActions locale={locale} />
      {restaurant.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={restaurant.logoUrl}
          alt={name}
          className="mx-auto mb-3 h-16 w-16 rounded-full object-cover shadow-md"
        />
      ) : (
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--d-secondary)] font-serif text-2xl font-semibold text-[var(--d-primary)] shadow-sm">
          {name.slice(0, 1)}
        </div>
      )}
      <h1 className="font-serif text-[34px] font-semibold leading-none text-[var(--d-text)]">{name}</h1>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-xs font-semibold uppercase tracking-[0.08em] text-[var(--d-text-soft)]">
          {description}
        </p>
      ) : null}
      <ClassicTableBadge restaurantId={restaurant.id} locale={locale} />
    </header>
  );
}
