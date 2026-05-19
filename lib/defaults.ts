import type { RetirementInputs } from '@/types/retirement'

export const DEFAULT_INPUTS: RetirementInputs = {
  person: {
    name: '',
    currentAge: 40,
    retirementAge: 65,
    lifeExpectancy: 90,
    currentIncome: 0,
    cppContributionYears: 40,
  },
  desiredRetirementIncome: 0,
  savings: {
    rrspBalance: 0,
    rrspAnnualContribution: 0,
    tfsaBalance: 0,
    tfsaAnnualContribution: 0,
    nonRegBalance: 0,
    nonRegAnnualContribution: 0,
    otherPostRetirementMonthly: 0,
    otherPostRetirementStartAge: 65,
  },
  assumptions: {
    equityPct: 60,
    bondPct: 30,
    cashPct: 10,
    equityMeanReturn: 7.0,
    equityVolatility: 15.0,
    bondMeanReturn: 3.5,
    bondVolatility: 6.0,
    cashReturn: 4.5,
    inflationRate: 2.5,
  },
}
