'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { localizedField } from '../helpers';
import type { CartSelection } from '@/app/t/[slug]/cart/types';
import type { MenuItemOptionGroupSnapshot } from '../theme.types';

interface Props {
  groups: ReadonlyArray<MenuItemOptionGroupSnapshot>;
  value: ReadonlyArray<CartSelection>;
  onChange: (value: ReadonlyArray<CartSelection>) => void;
  currencyCode: string;
  locale: 'en' | 'ar';
}

/**
 * Generic option picker that adapts to each group's min/max selection.
 * - maxSelect === 1 → radio group (single choice).
 * - maxSelect > 1   → checkbox group (capped at maxSelect picks).
 * Emits a flat CartSelection[] back to the parent; parent owns validation totals.
 */
export function OptionPicker({ groups, value, onChange, currencyCode, locale }: Props): React.JSX.Element {
  const t = useTranslations('tenant.options');
  const selectedByGroup = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const s of value) {
      if (!map.has(s.groupId)) map.set(s.groupId, new Set());
      map.get(s.groupId)!.add(s.optionId);
    }
    return map;
  }, [value]);

  function toggle(group: MenuItemOptionGroupSnapshot, optionId: string): void {
    const isRadio = group.maxSelect === 1;
    const next: CartSelection[] = value.filter((s) => s.groupId !== group.id || (!isRadio && s.optionId !== optionId));
    const wasSelected = selectedByGroup.get(group.id)?.has(optionId) ?? false;
    if (isRadio || !wasSelected) {
      const cap = group.maxSelect;
      const currentForGroup = next.filter((s) => s.groupId === group.id);
      if (!isRadio && currentForGroup.length >= cap) return; // ignore if at cap
      const opt = group.options.find((o) => o.id === optionId);
      if (!opt) return;
      next.push({
        groupId: group.id,
        groupName: group.name,
        groupNameAr: group.nameAr,
        optionId: opt.id,
        optionLabel: opt.label,
        optionLabelAr: opt.labelAr,
        priceDeltaCents: opt.priceDeltaCents,
      });
    }
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isRadio = group.maxSelect === 1;
        const picked = selectedByGroup.get(group.id) ?? new Set<string>();
        const count = picked.size;
        return (
          <fieldset key={group.id} className="rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wider text-[var(--d-text)]">
              {localizedField(group.name, group.nameAr, locale)}
              {group.required ? <span className="ms-1 text-[var(--d-primary)]">*</span> : null}
              <span className="ms-2 text-[10px] font-medium normal-case text-[var(--d-text-soft)]">
                {isRadio
                  ? t('chooseOne')
                  : group.minSelect > 0
                    ? t('chooseRange', { min: group.minSelect, max: group.maxSelect })
                    : t('chooseUpTo', { max: group.maxSelect })}
              </span>
            </legend>
            <ul className="mt-2 space-y-1">
              {group.options.map((opt) => {
                const isPicked = picked.has(opt.id);
                const atCap = !isRadio && count >= group.maxSelect && !isPicked;
                return (
                  <li key={opt.id}>
                    <label
                      className={`flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition ${atCap ? 'opacity-40' : 'hover:bg-[var(--d-bg)]'}`}
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <input
                          type={isRadio ? 'radio' : 'checkbox'}
                          name={`group-${group.id}`}
                          checked={isPicked}
                          disabled={atCap}
                          onChange={() => toggle(group, opt.id)}
                          className="h-4 w-4 accent-[var(--d-primary)]"
                        />
                        <span className="text-[var(--d-text)]">{localizedField(opt.label, opt.labelAr, locale)}</span>
                      </span>
                      {opt.priceDeltaCents !== 0 ? (
                        <span className="font-mono text-xs font-semibold text-[var(--d-primary)]">
                          {opt.priceDeltaCents > 0 ? '+' : '-'}
                          {formatDelta(Math.abs(opt.priceDeltaCents), currencyCode, locale)}
                        </span>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );
}

function formatDelta(cents: number, currency: string, locale: 'en' | 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency }).format(cents / 100);
}

/** Validate that every required/min-select group has enough selections. */
export function validateSelections(
  groups: ReadonlyArray<MenuItemOptionGroupSnapshot>,
  value: ReadonlyArray<CartSelection>,
): { ok: boolean; firstMissing?: MenuItemOptionGroupSnapshot } {
  for (const group of groups) {
    const count = value.filter((s) => s.groupId === group.id).length;
    const minRequired = group.required ? Math.max(1, group.minSelect) : group.minSelect;
    if (count < minRequired) return { ok: false, firstMissing: group };
  }
  return { ok: true };
}
