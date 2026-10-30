import { describe, expect, it } from 'vitest';
import { isTrialExpired, isUpgradeable, trialEndsFromNow } from './plans';
import { FREE_TRIAL_DAYS } from './constants';

describe('plan helpers', () => {
  const now = new Date('2026-10-30T12:00:00Z');

  it('sets the trial deadline FREE_TRIAL_DAYS from now', () => {
    expect(trialEndsFromNow(now).getTime() - now.getTime()).toBe(FREE_TRIAL_DAYS * 86_400_000);
  });

  it('only the free trial expires, and only once its deadline has passed', () => {
    expect(isTrialExpired('free_trial', new Date('2026-10-30T11:59:59Z'), now)).toBe(true);
    expect(isTrialExpired('free_trial', now, now)).toBe(true);
    expect(isTrialExpired('free_trial', new Date('2026-10-31T00:00:00Z'), now)).toBe(false);
    expect(isTrialExpired('free_trial', null, now)).toBe(false);
    expect(isTrialExpired('studio', new Date('2020-01-01T00:00:00Z'), now)).toBe(false);
  });

  it('offers upgrades only to trial restaurants', () => {
    expect(isUpgradeable('free_trial')).toBe(true);
    expect(isUpgradeable('studio')).toBe(false);
  });
});
