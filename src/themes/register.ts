/**
 * Side-effect entry point that registers every built-in diner theme.
 * Anywhere the theme system is used must import this file (directly or transitively)
 * before resolving a theme by key. `theme.renderer.tsx` imports it for that reason.
 *
 * Adding a new theme: import its `index` here. The module's top-level call to
 * `ThemeRegistry.register(...)` is what wires it in.
 */
import './classic';
