import { ThemeRegistry } from '../theme.registry';
import type { ITheme, ThemeProps } from '../theme.types';
import { ShowcasePage, type ShowcaseVariant } from './showcase-page';

function makeTheme(key: ShowcaseVariant): ITheme {
  return {
    key,
    render(props: ThemeProps) {
      return <ShowcasePage {...props} variant={key} />;
    },
  };
}

export const MarketTheme = makeTheme('market');
export const NeonTheme = makeTheme('neon');
export const CoastalTheme = makeTheme('coastal');
export const StreetTheme = makeTheme('street');

for (const theme of [MarketTheme, NeonTheme, CoastalTheme, StreetTheme]) {
  ThemeRegistry.register(theme);
}
