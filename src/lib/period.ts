export type PeriodKey = '7d' | '30d' | '90d' | '3m' | '6m' | '12m';

export interface Period {
  key: PeriodKey;
  label: string;
  labelAr: string;
  since: Date;
  /** true = bucket by month instead of day */
  monthly: boolean;
}

const NOW = () => new Date();

const daysAgo = (n: number): Date => {
  const d = NOW();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

const monthsAgo = (n: number): Date => {
  const d = NOW();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - n);
  return d;
};

export const PERIODS: Record<PeriodKey, Omit<Period, 'since'>> = {
  '7d':  { key: '7d',  label: 'Last 7 days',    labelAr: 'آخر ٧ أيام',   monthly: false },
  '30d': { key: '30d', label: 'Last 30 days',   labelAr: 'آخر ٣٠ يوم',   monthly: false },
  '90d': { key: '90d', label: 'Last 90 days',   labelAr: 'آخر ٩٠ يوم',   monthly: false },
  '3m':  { key: '3m',  label: 'Last 3 months',  labelAr: 'آخر ٣ أشهر',   monthly: true  },
  '6m':  { key: '6m',  label: 'Last 6 months',  labelAr: 'آخر ٦ أشهر',   monthly: true  },
  '12m': { key: '12m', label: 'Last 12 months', labelAr: 'آخر ١٢ شهراً', monthly: true  },
};

export function resolvePeriod(key: string | undefined): Period {
  const k = (key as PeriodKey | undefined) ?? '30d';
  const def = PERIODS[k] ?? PERIODS['30d'];
  const since =
    k === '7d'  ? daysAgo(7) :
    k === '30d' ? daysAgo(30) :
    k === '90d' ? daysAgo(90) :
    k === '3m'  ? monthsAgo(3) :
    k === '6m'  ? monthsAgo(6) :
    monthsAgo(12);
  return { ...def, since };
}

export const PERIOD_KEYS: PeriodKey[] = ['7d', '30d', '90d', '3m', '6m', '12m'];
