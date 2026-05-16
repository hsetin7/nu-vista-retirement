// CPP and OAS estimates for Canada (2026 values)

const CPP_MAX_MONTHLY_AT_65 = 1364.60  // 2026 maximum CPP at age 65
const CPP_AVERAGE_MONTHLY_AT_65 = 810   // Average recipient amount
const OAS_MONTHLY_AT_65 = 713.34        // 2026 OAS base at age 65
const OAS_CLAWBACK_THRESHOLD = 86912    // 2026 OAS clawback starts
const OAS_CLAWBACK_RATE = 0.15          // 15 cents per dollar over threshold

// CPP actuarial adjustments relative to age 65
// Early: -0.6% per month (up to 60 months early = -36%)
// Late:  +0.7% per month (up to 60 months late = +42%)
function cppAgeAdjustment(startAge: number): number {
  const monthsDiff = (startAge - 65) * 12
  if (monthsDiff < 0) {
    return 1 + monthsDiff * 0.006
  }
  return 1 + monthsDiff * 0.007
}

/**
 * Estimate monthly CPP based on income history and contribution years.
 * Uses a simplified formula: prorate CPP max by contribution years and income.
 */
export function estimateCppMonthly(
  averageAnnualIncome: number,
  contributionYears: number,
  startAge: number
): number {
  // CPP pensionable earnings ceiling 2026 ≈ $68,500
  const ympe = 68500
  const cappedIncome = Math.min(averageAnnualIncome, ympe)
  const incomeRatio = cappedIncome / ympe

  // Full CPP requires ~39 years of maximum contributions
  const yearRatio = Math.min(contributionYears / 39, 1)

  const estimatedAt65 = CPP_MAX_MONTHLY_AT_65 * incomeRatio * yearRatio
  const adjusted = estimatedAt65 * cppAgeAdjustment(startAge)

  return Math.min(Math.max(adjusted, 0), CPP_MAX_MONTHLY_AT_65 * cppAgeAdjustment(startAge))
}

/**
 * Calculate OAS monthly benefit after clawback based on net income.
 */
export function calcOasMonthly(netIncome: number, age: number): number {
  if (age < 65) return 0

  const excess = Math.max(0, netIncome - OAS_CLAWBACK_THRESHOLD)
  const annualClawback = excess * OAS_CLAWBACK_RATE
  const annualOas = OAS_MONTHLY_AT_65 * 12
  const netAnnualOas = Math.max(0, annualOas - annualClawback)

  return netAnnualOas / 12
}

export const OAS_BASE_MONTHLY = OAS_MONTHLY_AT_65
export const CPP_MAX_MONTHLY = CPP_MAX_MONTHLY_AT_65
