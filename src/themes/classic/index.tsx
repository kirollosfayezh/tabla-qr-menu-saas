import { ThemeRegistry } from '../theme.registry';
import type { ITheme, ThemeProps } from '../theme.types';
import { ClassicPage } from './classic-page';

/** The Classic diner theme: warm hero header + sticky tabs + image-on-the-side cards. */
export const ClassicTheme: ITheme = {
  key: 'classic',
  render(props: ThemeProps) {
    return <ClassicPage {...props} />;
  },
};

ThemeRegistry.register(ClassicTheme);
