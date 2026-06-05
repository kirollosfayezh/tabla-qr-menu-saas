/**
 * Side-effect entry point that registers every built-in diner theme.
 * Anywhere the theme system is used must import this file (directly or transitively)
 * before resolving a theme by key. `theme.renderer.tsx` imports it for that reason.
 *
 * Adding a new theme: import its `index` here. The module's top-level call to
 * `ThemeRegistry.register(...)` is what wires it in.
 */
import { ClassicTheme } from './classic';
import { ModernTheme } from './modern';
import './elegant';
import './omakase';
import './showcase';
import { ThemeRegistry } from './theme.registry';

// Themes whose layout matches an existing renderer reuse it — the palette, fonts
// and corners come entirely from the theme's CSS vars, so the look stays distinct.
// garden: fresh list layout (same as classic, green palette via CSS vars)
// street: neon cards (same as modern, dark neon palette via CSS vars)
// (classic, modern, elegant, omakase each register their own renderer.)
ThemeRegistry.register({ key: 'garden', render: (props) => ClassicTheme.render(props) });
ThemeRegistry.register({ key: 'street', render: (props) => ModernTheme.render(props) });
