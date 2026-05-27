import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/** Themed text input. Wrap in <Field> for label + error layout. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'block w-full rounded-lg bg-surface-base px-3.5 h-11 text-sm text-text-primary',
        'border border-border-default placeholder:text-text-tertiary',
        'focus:border-brand-primary focus:outline-none',
        invalid && 'border-danger focus:border-danger',
        className,
      )}
      {...rest}
    />
  );
});
