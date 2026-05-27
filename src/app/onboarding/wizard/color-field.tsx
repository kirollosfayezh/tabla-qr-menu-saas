'use client';

import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

/** Hex color picker + text input pair used by Step 2. */
export function ColorField({ id, label, value, onChange, error }: Props): React.JSX.Element {
  return (
    <Field label={label} htmlFor={`c-${id}`} error={error}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          id={`c-${id}`}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-11 w-14 cursor-pointer rounded-lg border border-border-default bg-surface-base p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="font-mono"
          invalid={Boolean(error)}
        />
      </div>
    </Field>
  );
}
