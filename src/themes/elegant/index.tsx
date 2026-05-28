import { ThemeRegistry } from '../theme.registry';
import type { ITheme, ThemeProps } from '../theme.types';
import { ElegantPage } from './elegant-page';

export const ElegantTheme: ITheme = {
  key: 'elegant',
  render(props: ThemeProps) {
    return <ElegantPage {...props} />;
  },
};

ThemeRegistry.register(ElegantTheme);
