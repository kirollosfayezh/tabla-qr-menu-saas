import { ThemeRegistry } from '../theme.registry';
import type { ITheme, ThemeProps } from '../theme.types';
import { OmakasePage } from './omakase-page';

/** The Omakase diner theme: light editorial serif, centered hero, dotted-leader rows. */
export const OmakaseTheme: ITheme = {
  key: 'omakase',
  render(props: ThemeProps) {
    return <OmakasePage {...props} />;
  },
};

ThemeRegistry.register(OmakaseTheme);
