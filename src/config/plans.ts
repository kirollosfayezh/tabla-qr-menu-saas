import { FREE_TRIAL_DAYS } from '@/config/constants';

/**
 * Plan key type — matches the `key` column in the `plans` DB table.
 * Limits and prices are stored in the DB and managed via /admin/packages.
 * This type just provides autocomplete; the actual values come from the DB.
 */
export type PlanKey = 'free_trial' | 'studio' | 'group' | string;

/** The free trial is the only plan that expires; paid plans never carry an end date. */
export const FREE_TRIAL_PLAN_KEY = 'free_trial';

/** Returns true if this plan should show an upgrade CTA (i.e. not on a paid plan). */
export function isUpgradeable(planKey: string): boolean {
  return planKey === FREE_TRIAL_PLAN_KEY;
}

/** Timestamp marking the end of a fresh free trial, measured from `now`. */
export function trialEndsFromNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * True when a restaurant's free trial has elapsed.
 * Only the `free_trial` plan can expire; a null end date is treated as not-yet-expired
 * (e.g. legacy rows created before trials had a deadline).
 */
export function isTrialExpired(
  planKey: string,
  trialEndsAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (planKey !== FREE_TRIAL_PLAN_KEY) return false;
  if (!trialEndsAt) return false;
  return trialEndsAt.getTime() <= now.getTime();
}
