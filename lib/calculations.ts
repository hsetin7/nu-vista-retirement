import type { RetirementInputs, YearlyProjection, ProjectionResults } from '@/types/retirement'
import { calcCombinedTax, effectiveTaxRate } from './canadian-tax'
import { estimateCppMonthly, calcOasMonthly } from './cpp-oas'
import { CURRENT_YEAR } from './utils'

function blendedReturn(a: ReturnType<typeof getBlendedReturn>): number {
  return a
}

function getBlendedReturn(assumptions: RetirementInputs['assumptions']): number {
  const { equityPct, bondPct, cashPct, equityMeanReturn, bondMeanReturn, cashReturn } = assumptions
  return (
    (equityPct / 100) * equityMeanReturn +
    (bondPct / 100) * bondMeanReturn +
    (cashPct / 100) * cashReturn
  ) / 100
}

function getBlendedVolatility(assumptions: RetirementInputs['assumptions']): number {
  const { equityPct, bondPct, cashPct, equityVolatility, bondVolatility } = assumptions
  // Simplified: weighted average volatility (ignores correlation for deterministic path)
  return (
    (equityPct / 100) * equityVolatility +
    (bondPct / 100) * bondVolatility +
    (cashPct / 100) * 0.5
  ) / 100
}

export function runProjection(inputs: RetirementInputs): ProjectionResults {
  const { person1, savings, income, expenses, assumptions } = inputs
  const currentAge = CURRENT_YEAR - person1.birthYear
  const retirementYear = CURRENT_YEAR + (person1.retirementAge - currentAge)
  const endYear = CURRENT_YEAR + (person1.lifeExpectancy - currentAge)
  const inflation = assumptions.inflationRate / 100
  const nominalReturn = getBlendedReturn(assumptions)
  const realReturn = (1 + nominalReturn) / (1 + inflation) - 1

  const cppMonthly = estimateCppMonthly(
    income.employmentIncome,
    income.cppContributionYears,
    income.cppStartAge
  )
  const pensionMonthly = savings.pensionMonthly

  let rrsp = savings.rrspBalance
  let tfsa = savings.tfsaBalance
  let nonReg = savings.nonRegBalance

  const yearly: YearlyProjection[] = []

  for (let year = CURRENT_YEAR; year <= endYear; year++) {
    const age = currentAge + (year - CURRENT_YEAR)
    const isRetired = age >= person1.retirementAge
    const yearsFromNow = year - CURRENT_YEAR

    // Inflation factor for expenses
    const inflationFactor = Math.pow(1 + inflation, yearsFromNow)

    if (!isRetired) {
      // Accumulation phase: grow and contribute
      rrsp = rrsp * (1 + nominalReturn) + savings.rrspAnnualContribution
      tfsa = tfsa * (1 + nominalReturn) + savings.tfsaAnnualContribution
      nonReg = nonReg * (1 + nominalReturn)

      const totalExpenses = expenses.categories.reduce((s, c) => s + c.current, 0) * inflationFactor

      yearly.push({
        year,
        age,
        rrspBalance: rrsp,
        tfsaBalance: tfsa,
        nonRegBalance: nonReg,
        totalBalance: rrsp + tfsa + nonReg,
        rrspWithdrawal: 0,
        tfsaWithdrawal: 0,
        cppIncome: 0,
        oasIncome: 0,
        pensionIncome: 0,
        totalIncome: income.employmentIncome + income.otherIncome,
        taxPaid: calcCombinedTax(income.employmentIncome + income.otherIncome, savings.rrspAnnualContribution),
        totalExpenses,
      })
    } else {
      // Decumulation phase: withdraw to meet expenses
      const targetExpenses = expenses.categories.reduce((s, c) => s + c.retirement, 0) * inflationFactor

      const cppAnnual = age >= income.cppStartAge ? cppMonthly * 12 * inflationFactor : 0
      const pensionAnnual = pensionMonthly * 12 * inflationFactor

      // Estimate OAS (check clawback later with known income)
      const preOasIncome = cppAnnual + pensionAnnual
      const oasAnnual = calcOasMonthly(preOasIncome, age) * 12 * inflationFactor

      const governmentIncome = cppAnnual + oasAnnual + pensionAnnual
      const portfolioNeeded = Math.max(0, targetExpenses - governmentIncome)

      // Withdrawal strategy: RRSP first (to reduce future required minimum withdrawals), then TFSA, then non-reg
      let rrspWithdrawal = 0
      let tfsaWithdrawal = 0

      // Grow accounts by return first
      rrsp = rrsp * (1 + nominalReturn)
      tfsa = tfsa * (1 + nominalReturn)
      nonReg = nonReg * (1 + nominalReturn)

      let remaining = portfolioNeeded
      if (rrsp > 0 && remaining > 0) {
        rrspWithdrawal = Math.min(rrsp, remaining * 1.3) // withdraw a bit more to account for tax
        rrsp = Math.max(0, rrsp - rrspWithdrawal)
        remaining = Math.max(0, remaining - rrspWithdrawal * 0.7)
      }
      if (tfsa > 0 && remaining > 0) {
        tfsaWithdrawal = Math.min(tfsa, remaining)
        tfsa = Math.max(0, tfsa - tfsaWithdrawal)
        remaining = 0
      }

      const grossIncome = governmentIncome + rrspWithdrawal
      const tax = calcCombinedTax(grossIncome)

      yearly.push({
        year,
        age,
        rrspBalance: rrsp,
        tfsaBalance: tfsa,
        nonRegBalance: nonReg,
        totalBalance: rrsp + tfsa + nonReg,
        rrspWithdrawal,
        tfsaWithdrawal,
        cppIncome: cppAnnual,
        oasIncome: oasAnnual,
        pensionIncome: pensionAnnual,
        totalIncome: grossIncome,
        taxPaid: tax,
        totalExpenses: targetExpenses,
      })
    }
  }

  // Find retirement year data
  const retirementRow = yearly.find((r) => r.age === person1.retirementAge)
  const retirementPortfolio = retirementRow?.totalBalance ?? 0

  // Portfolio runway: years until balance hits 0
  let runwayYears = 0
  for (const row of yearly) {
    if (row.age >= person1.retirementAge && row.totalBalance > 0) {
      runwayYears++
    }
  }

  const retirementRows = yearly.filter((r) => r.age >= person1.retirementAge)
  const avgMonthlyIncome =
    retirementRows.length > 0
      ? retirementRows.reduce((s, r) => s + r.totalIncome, 0) / retirementRows.length / 12
      : 0

  const avgTaxRate =
    retirementRows.length > 0
      ? retirementRows.reduce((s, r) => s + (r.totalIncome > 0 ? r.taxPaid / r.totalIncome : 0), 0) /
        retirementRows.length
      : 0

  const monte = runMonteCarlo(inputs, 1000)

  return {
    yearly,
    monteCarlo: monte,
    retirementPortfolio,
    monthlyRetirementIncome: avgMonthlyIncome,
    portfolioRunwayYears: runwayYears,
    effectiveTaxRate: avgTaxRate,
    cppMonthly,
    oasMonthly: calcOasMonthly(cppMonthly * 12, 65),
  }
}

function runMonteCarlo(inputs: RetirementInputs, runs: number) {
  const { person1, savings, income, expenses, assumptions } = inputs
  const currentAge = CURRENT_YEAR - person1.birthYear
  const yearsToRetirement = person1.retirementAge - currentAge
  const yearsInRetirement = person1.lifeExpectancy - person1.retirementAge
  const totalYears = yearsToRetirement + yearsInRetirement

  const nominalReturn = getBlendedReturn(assumptions)
  const volatility = getBlendedVolatility(assumptions)
  const inflation = assumptions.inflationRate / 100

  const allEndBalances: number[][] = Array.from({ length: totalYears }, () => [])
  let successCount = 0

  for (let run = 0; run < runs; run++) {
    let portfolio =
      savings.rrspBalance + savings.tfsaBalance + savings.nonRegBalance

    const annualExpenses = expenses.categories.reduce((s, c) => s + c.retirement, 0)
    const cppAnnual = estimateCppMonthly(income.employmentIncome, income.cppContributionYears, income.cppStartAge) * 12
    const pensionAnnual = savings.pensionMonthly * 12
    const oasAnnual = calcOasMonthly(cppAnnual + pensionAnnual, 65) * 12

    let succeeded = true

    for (let yr = 0; yr < totalYears; yr++) {
      // Random return from normal distribution (Box-Muller)
      const u1 = Math.random()
      const u2 = Math.random()
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      const annualReturn = nominalReturn + z * volatility

      portfolio = portfolio * (1 + annualReturn)

      if (yr >= yearsToRetirement) {
        const inflFactor = Math.pow(1 + inflation, yr)
        const govtIncome = (cppAnnual + oasAnnual + pensionAnnual) * inflFactor
        const netWithdrawal = Math.max(0, annualExpenses * inflFactor - govtIncome)
        portfolio -= netWithdrawal

        // Also add annual contributions during accumulation
      } else {
        portfolio += savings.rrspAnnualContribution + savings.tfsaAnnualContribution
      }

      allEndBalances[yr].push(Math.max(0, portfolio))

      if (yr === totalYears - 1 && portfolio <= 0) {
        succeeded = false
      }
    }

    if (succeeded) successCount++
  }

  const years = Array.from({ length: totalYears }, (_, i) => CURRENT_YEAR + i)

  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b)
    const idx = Math.floor((p / 100) * sorted.length)
    return sorted[Math.min(idx, sorted.length - 1)]
  }

  return {
    successRate: (successCount / runs) * 100,
    years,
    p10: allEndBalances.map((yr) => percentile(yr, 10)),
    p50: allEndBalances.map((yr) => percentile(yr, 50)),
    p90: allEndBalances.map((yr) => percentile(yr, 90)),
  }
}
