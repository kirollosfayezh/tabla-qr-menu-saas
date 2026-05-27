/** Minimal class-name composer. Filters falsy values and joins with a space. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}
