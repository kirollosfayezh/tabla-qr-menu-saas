'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { parsePriceInput } from './format';
import type { OptionGroupDTO } from '@/dtos/menu.dto';

interface Props {
  groups: OptionGroupDTO[];
  currencyCode: string;
  onChange: (groups: OptionGroupDTO[]) => void;
}

export function ItemOptionsEditor({ groups, currencyCode, onChange }: Props): React.JSX.Element {
  const t = useTranslations('owner.menu.options');

  function patchGroup(index: number, patch: Partial<OptionGroupDTO>): void {
    onChange(groups.map((group, i) => (i === index ? { ...group, ...patch } : group)));
  }

  function removeGroup(index: number): void {
    onChange(groups.filter((_, i) => i !== index));
  }

  function patchOption(groupIndex: number, optionIndex: number, patch: Partial<OptionGroupDTO['options'][number]>): void {
    const group = groups[groupIndex];
    if (!group) return;
    patchGroup(groupIndex, {
      options: group.options.map((option, i) => (i === optionIndex ? { ...option, ...patch } : option)),
    });
  }

  function removeOption(groupIndex: number, optionIndex: number): void {
    const group = groups[groupIndex];
    if (!group) return;
    patchGroup(groupIndex, { options: group.options.filter((_, i) => i !== optionIndex) });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border-subtle bg-surface-raised p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-text-primary">{t('title')}</h3>
          <p className="text-xs text-text-tertiary">{t('hint')}</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...groups, blankGroup(groups.length)])}>
          {t('addGroup')}
        </Button>
      </div>

      {groups.length === 0 ? <p className="rounded-xl border border-dashed border-border-default p-4 text-sm text-text-tertiary">{t('empty')}</p> : null}

      {groups.map((group, groupIndex) => (
        <div key={group.id ?? groupIndex} className="space-y-3 rounded-xl border border-border-subtle bg-surface-base p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('groupName')} htmlFor={`og-name-${groupIndex}`}>
              <Input id={`og-name-${groupIndex}`} value={group.name} onChange={(e) => patchGroup(groupIndex, { name: e.target.value })} />
            </Field>
            <Field label={t('groupNameAr')} htmlFor={`og-name-ar-${groupIndex}`}>
              <Input id={`og-name-ar-${groupIndex}`} dir="rtl" value={group.nameAr} onChange={(e) => patchGroup(groupIndex, { nameAr: e.target.value })} />
            </Field>
            <Field label={t('minSelect')} htmlFor={`og-min-${groupIndex}`}>
              <Input id={`og-min-${groupIndex}`} type="number" min={0} value={group.minSelect} onChange={(e) => patchGroup(groupIndex, { minSelect: Number(e.target.value) })} />
            </Field>
            <Field label={t('maxSelect')} htmlFor={`og-max-${groupIndex}`}>
              <Input id={`og-max-${groupIndex}`} type="number" min={1} value={group.maxSelect} onChange={(e) => patchGroup(groupIndex, { maxSelect: Number(e.target.value) })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={group.required} onChange={(e) => patchGroup(groupIndex, { required: e.target.checked, minSelect: e.target.checked ? Math.max(1, group.minSelect) : group.minSelect })} className="h-4 w-4 accent-brand-primary" />
            {t('required')}
          </label>

          <div className="space-y-2">
            {group.options.map((option, optionIndex) => (
              <div key={option.id ?? optionIndex} className="grid gap-2 rounded-lg bg-surface-sunken p-3 sm:grid-cols-[1fr_1fr_130px_auto]">
                <Input value={option.label} placeholder={t('optionLabel')} onChange={(e) => patchOption(groupIndex, optionIndex, { label: e.target.value })} />
                <Input value={option.labelAr} dir="rtl" placeholder={t('optionLabelAr')} onChange={(e) => patchOption(groupIndex, optionIndex, { labelAr: e.target.value })} />
                <Input
                  inputMode="decimal"
                  value={formatDelta(option.priceDeltaCents)}
                  aria-label={`${t('priceDelta')} ${currencyCode}`}
                  onChange={(e) => patchOption(groupIndex, optionIndex, { priceDeltaCents: parseDelta(e.target.value) })}
                />
                <button type="button" onClick={() => removeOption(groupIndex, optionIndex)} className="rounded-lg px-2 text-sm font-semibold text-danger hover:bg-white">
                  {t('remove')}
                </button>
              </div>
            ))}
            <div className="flex justify-between gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => patchGroup(groupIndex, { options: [...group.options, blankOption(group.options.length)] })}>
                {t('addOption')}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => removeGroup(groupIndex)}>
                {t('removeGroup')}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function blankGroup(sortOrder: number): OptionGroupDTO {
  return {
    name: '',
    nameAr: '',
    minSelect: 0,
    maxSelect: 1,
    required: false,
    sortOrder,
    options: [blankOption(0)],
  };
}

function blankOption(sortOrder: number): OptionGroupDTO['options'][number] {
  return { label: '', labelAr: '', priceDeltaCents: 0, sortOrder };
}

function formatDelta(cents: number): string {
  return cents === 0 ? '' : String(cents / 100);
}

function parseDelta(value: string): number {
  if (value.trim() === '') return 0;
  const parsed = parsePriceInput(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
