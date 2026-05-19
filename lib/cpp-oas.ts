// CPP and OAS estimates for Canada (2026 values)

const CPP_MAX_MONTHLY_AT_65 = 1364.60  // 2026 maximum CPP at age 65
const OAS_MONTHLY_AT_65 = 713.34        // 2026 full OAS at age 65 (40 residency years)
const OAS_CLAWBACK_THRESHOLD = 86912    // 2026 net income where clawback begins
const OAS_CLAWBACK_RATE = 0.15          // 15 cents per dollar over threshold
const OAS_FULL_RESIDENCY_YEARS = 40     // 40 years Canadian residency = full OAS

// CPP actuarial adjustments relative to age 65
// Early: -0.6% per month (max -36% at age 60)
// Late:  +0.7% per month (max +42% at age 70)
function cppAgeAdjustment(startAge: number): number {
  const monthsDiff = (startAge - 65) * 12
  if (monthsDiff < 0) return 1 + monthsDiff * 0.006
  return 1 + monthsDiff * 0.007
}

/**
 * Estimate monthly CPP based on income and contribution years.
 * Full CPP requires ~39 years of maximum contributions.
 */
export function estimateCppMonthly(
  averageAnnualIncome: number,
  contributionYears: number,
  startAge: number
): number {
  const ympe = 68500  // CPP pensionable earnings ceiling 2026
  const incomeRatio = Math.min(averageAnnualIncome, ympe) / ympe
  const yearRatio = Math.min(contributionYears / 39, 1)
  const estimatedAt65 = CPP_MAX_MONTHLY_AT_65 * incomeRatio * yearRatio
  const adjusted = estimatedAt65 * cppAgeAdjustment(startAge)
  return Math.min(Math.max(adjusted, 0), CPP_MAX_MONTHLY_AT_65 * cppAgeAdjustment(startAge))
}

/**
 * Base OAS monthly benefit before clawback, prorated by residency years.
 * 40 years of Canadian residency after age 18 = full OAS ($713.34/mo in 2026).
 */
export function calcBaseOasMonthly(residencyYears: number): number {
  const ratio = Math.min(Math.max(0, residencyYears) / OAS_FULL_RESIDENCY_YEARS, 1)
  return OAS_MONTHLY_AT_65 * ratio
}

/**
 * Apply OAS clawback: 15% of taxable income above $86,912 threshold (2026).
 * TFSA withdrawals are excluded from taxable income for clawback purposes.
 * Returns post-clawback monthly OAS amount.
 */
export function applyOasClawback(baseMonthlyOas: number, totalAnnualTaxableIncome: number): number {
  if (baseMonthlyOas <= 0) return 0
  const excess = Math.max(0, totalAnnualTaxableIncome - OAS_CLAWBACK_THRESHOLD)
  const annualClawback = excess * OAS_CLAWBACK_RATE
  const netAnnualOas = Math.max(0, baseMonthlyOas * 12 - annualClawback)
  return netAnnualOas / 12
}

export const OAS_BASE_MONTHLY = OAS_MONTHLY_AT_65
export const CPP_MAX_MONTHLY = CPP_MAX_MONTHLY_AT_65
