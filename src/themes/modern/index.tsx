import { ThemeRegistry } from '../theme.registry';
import type { ITheme, ThemeProps } from '../theme.types';
import { ModernPage } from './modern-page';

export const ModernTheme: ITheme = {
  key: 'modern',
  render(props: ThemeProps) {
    return <ModernPage {...props} />;
  },
};

ThemeRegistry.register(ModernTheme);
