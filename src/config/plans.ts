/**
 * Plan key type — matches the `key` column in the `plans` DB table.
 * Limits and prices are stored in the DB and managed via /admin/packages.
 * This type just provides autocomplete; the actual values come from the DB.
 */
export type PlanKey = 'free_trial' | 'studio' | 'group' | string;

/** Returns true if this plan should show an upgrade CTA (i.e. not on a paid plan). */
export function isUpgradeable(planKey: string): boolean {
  return planKey === 'free_trial';
}
