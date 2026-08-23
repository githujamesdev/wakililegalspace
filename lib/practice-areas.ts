// Default agreed fees per practice area, stored in cents (KES).
export const PRACTICE_FEES: Record<string, number> = {
  criminal: 100000,
  conveyancing: 150000,
  elc: 120000,
  succession: 100000,
  commercial: 200000,
  'tax-law': 180000,
  civil: 120000,
  'debts-recovery': 80000,
  matrimonial: 100000,
  agreements: 50000,
}

export const PRACTICE_AREAS: [string, string][] = [
  ['criminal', 'Criminal'],
  ['conveyancing', 'Conveyancing'],
  ['elc', 'ELC (Environment & Land Court)'],
  ['succession', 'Succession'],
  ['commercial', 'Commercial'],
  ['tax-law', 'Tax Law'],
  ['civil', 'Civil (Personal / Material Claims)'],
  ['debts-recovery', 'Debts Recovery'],
  ['matrimonial', 'Matrimonial / Divorce'],
  ['agreements', 'Agreements / Affidavits / Certification / Demand'],
]

export const DEFAULT_PRACTICE_AREA = 'criminal'
