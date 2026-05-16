import type { RetirementInputs } from '@/types/retirement'
import { CURRENT_YEAR } from '@/lib/utils'

export const DEFAULT_INPUTS: RetirementInputs = {
  person1: {
    name: '',
    birthYear: CURRENT_YEAR - 40,
    retirementAge: 65,
    lifeExpectancy: 90,
  },
  person2: null,
  savings: {
    rrspBalance: 0,
    rrspRoom: 0,
    rrspAnnualContribution: 0,
    tfsaBalance: 0,
    tfsaRoom: 0,
    tfsaAnnualContribution: 0,
    pensionMonthly: 0,
    nonRegBalance: 0,
  },
  income: {
    employmentIncome: 0,
    otherIncome: 0,
    cppStartAge: 65,
    cppContributionYears: 35,
  },
  expenses: {
    categories: [
      { label: 'Housing', current: 0, retirement: 0 },
      { label: 'Food & Groceries', current: 0, retirement: 0 },
      { label: 'Transportation', current: 0, retirement: 0 },
      { label: 'Healthcare', current: 0, retirement: 0 },
      { label: 'Travel & Vacation', current: 0, retirement: 0 },
      { label: 'Dining & Entertainment', current: 0, retirement: 0 },
      { label: 'Personal & Shopping', current: 0, retirement: 0 },
      { label: 'Utilities & Subscriptions', current: 0, retirement: 0 },
      { label: 'Other', current: 0, retirement: 0 },
    ],
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
