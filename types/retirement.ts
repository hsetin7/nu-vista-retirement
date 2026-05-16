export interface Person {
  name: string
  birthYear: number
  retirementAge: number
  lifeExpectancy: number
}

export interface SavingsInputs {
  rrspBalance: number
  rrspRoom: number
  rrspAnnualContribution: number
  tfsaBalance: number
  tfsaRoom: number
  tfsaAnnualContribution: number
  pensionMonthly: number
  nonRegBalance: number
}

export interface IncomeInputs {
  employmentIncome: number
  otherIncome: number
  cppStartAge: number
  cppContributionYears: number
}

export interface ExpenseCategory {
  label: string
  current: number
  retirement: number
}

export interface ExpensesInputs {
  categories: ExpenseCategory[]
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
  person1: Person
  person2: Person | null
  savings: SavingsInputs
  income: IncomeInputs
  expenses: ExpensesInputs
  assumptions: AssumptionsInputs
}

export interface YearlyProjection {
  year: number
  age: number
  rrspBalance: number
  tfsaBalance: number
  nonRegBalance: number
  totalBalance: number
  rrspWithdrawal: number
  tfsaWithdrawal: number
  cppIncome: number
  oasIncome: number
  pensionIncome: number
  totalIncome: number
  taxPaid: number
  totalExpenses: number
}

export interface MonteCarloResult {
  successRate: number
  p10: number[]
  p50: number[]
  p90: number[]
  years: number[]
}

export interface ProjectionResults {
  yearly: YearlyProjection[]
  monteCarlo: MonteCarloResult
  retirementPortfolio: number
  monthlyRetirementIncome: number
  portfolioRunwayYears: number
  effectiveTaxRate: number
  cppMonthly: number
  oasMonthly: number
}

export type ActiveSection = 'inputs' | 'projections' | 'report'
export type ActiveInputTab = 'people' | 'savings' | 'income' | 'expenses' | 'assumptions'
