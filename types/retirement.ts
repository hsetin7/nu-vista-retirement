export interface Person {
  name: string
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  currentIncome: number
  cppContributionYears: number
}

export interface SavingsInputs {
  rrspBalance: number
  rrspAnnualContribution: number
  tfsaBalance: number
  tfsaAnnualContribution: number
  nonRegBalance: number
  nonRegAnnualContribution: number
  otherPostRetirementMonthly: number
  otherPostRetirementStartAge: number
}

export interface AssumptionsInputs {
  equityPct: number
  bondPct: number
  cashPct: number
  equityMeanReturn: number
  equityVolatility: number
  bondMeanReturn: number
  bondVolatility: number
  cashReturn: number
  inflationRate: number
}

export interface RetirementInputs {
  person: Person
  desiredRetirementIncome: number
  savings: SavingsInputs
  assumptions: AssumptionsInputs
}

export interface YearlyProjection {
  year: number
  age: number
  phase: 'accumulation' | 'retirement'
  employmentIncome: number
  cppIncome: number
  oasIncome: number
  pensionIncome: number
  totalGrossIncome: number
  taxPaid: number
  totalNetIncome: number
  expenses: number
  netCashFlow: number
  rrspBalance: number
  tfsaBalance: number
  nonRegBalance: number
  totalPortfolio: number
  rrspContribution: number
  tfsaContribution: number
  nonRegContribution: number
  rrspWithdrawal: number
  tfsaWithdrawal: number
  nonRegWithdrawal: number
}

export interface MonteCarloResult {
  successRate: number
  p10: number[]
  p25: number[]
  p50: number[]
  p75: number[]
  p90: number[]
  years: number[]
}

export interface ProjectionResults {
  yearly: YearlyProjection[]
  monteCarlo: MonteCarloResult
  retirementPortfolio: number
  monthlyRetirementIncome: number
  portfolioRunwayYears: number
  cppMonthly: number
  oasMonthly: number
  totalContributed: number
  meetsGoal: boolean
}

export type ActiveSection = 'inputs' | 'projections' | 'cashflow' | 'release-notes'
export type ActiveInputTab = 'profile' | 'assumptions'
