import type { RetirementInputs, YearlyProjection, ProjectionResults, MonteCarloResult } from '@/types/retirement'
import { calcCombinedTax } from './canadian-tax'
import { estimateCppMonthly, calcOasMonthly } from './cpp-oas'
import { CURRENT_YEAR } from './utils'

function getBlendedReturn(a: RetirementInputs['assumptions']): number {
  return (
    (a.equityPct / 100) * (a.equityMeanReturn / 100) +
    (a.bondPct / 100) * (a.bondMeanReturn / 100) +
    (a.cashPct / 100) * (a.cashReturn / 100)
  )
}

function getBlendedVolatility(a: RetirementInputs['assumptions']): number {
  return (
    (a.equityPct / 100) * (a.equityVolatility / 100) +
    (a.bondPct / 100) * (a.bondVolatility / 100) +
    (a.cashPct / 100) * 0.005
  )
}

function boxMullerRandom(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function runProjection(inputs: RetirementInputs): ProjectionResults {
  const { person, savings, assumptions, desiredRetirementIncome } = inputs
  const currentAge = person.currentAge
  const inflation = assumptions.inflationRate / 100
  const nominalReturn = getBlendedReturn(assumptions)

  const cppMonthly = estimateCppMonthly(
    person.currentIncome,
    person.cppContributionYears,
    person.retirementAge
  )
  const oasMonthly = calcOasMonthly(cppMonthly * 12, 65)

  let rrsp = savings.rrspBalance
  let tfsa = savings.tfsaBalance
  let nonReg = savings.nonRegBalance

  const yearly: YearlyProjection[] = []
  let totalContributed = savings.rrspBalance + savings.tfsaBalance + savings.nonRegBalance

  for (let age = currentAge; age <= person.lifeExpectancy; age++) {
    const year = CURRENT_YEAR + (age - currentAge)
    const phase: 'accumulation' | 'retirement' = age < person.retirementAge ? 'accumulation' : 'retirement'
    const yearsFromRetirement = Math.max(0, age - person.retirementAge)
    const inflationFactor = Math.pow(1 + inflation, yearsFromRetirement)

    let employmentIncome = 0
    let cppIncome = 0
    let oasIncome = 0
    let pensionIncome = 0
    let taxPaid = 0
    let expenses = 0
    let rrspContrib = 0
    let tfsaContrib = 0
    let nonRegContrib = 0
    let rrspWithdrawal = 0
    let tfsaWithdrawal = 0
    let nonRegWithdrawal = 0

    if (phase === 'accumulation') {
      employmentIncome = person.currentIncome

      rrsp = rrsp * (1 + nominalReturn) + savings.rrspAnnualContribution
      tfsa = tfsa * (1 + nominalReturn) + savings.tfsaAnnualContribution
      nonReg = nonReg * (1 + nominalReturn) + savings.nonRegAnnualContribution

      rrspContrib = savings.rrspAnnualContribution
      tfsaContrib = savings.tfsaAnnualContribution
      nonRegContrib = savings.nonRegAnnualContribution

      totalContributed +=
        savings.rrspAnnualContribution +
        savings.tfsaAnnualContribution +
        savings.nonRegAnnualContribution

      const taxableIncome = Math.max(0, employmentIncome - savings.rrspAnnualContribution)
      taxPaid = calcCombinedTax(taxableIncome)
      expenses = 0
    } else {
      const targetSpend = desiredRetirementIncome * inflationFactor

      cppIncome = cppMonthly * 12 * inflationFactor
      oasIncome = age >= 65 ? oasMonthly * 12 * inflationFactor : 0
      pensionIncome =
        savings.otherPostRetirementMonthly > 0 && age >= savings.otherPostRetirementStartAge
          ? savings.otherPostRetirementMonthly * 12 * inflationFactor
          : 0

      const guaranteedIncome = cppIncome + oasIncome + pensionIncome
      const shortfall = Math.max(0, targetSpend - guaranteedIncome)

      rrsp = rrsp * (1 + nominalReturn)
      tfsa = tfsa * (1 + nominalReturn)
      nonReg = nonReg * (1 + nominalReturn)

      let remaining = shortfall
      if (rrsp > 0 && remaining > 0) {
        const gross = Math.min(rrsp, remaining * 1.35)
        rrspWithdrawal = gross
        rrsp = Math.max(0, rrsp - rrspWithdrawal)
        remaining = Math.max(0, remaining - rrspWithdrawal * 0.74)
      }
      if (tfsa > 0 && remaining > 0) {
        tfsaWithdrawal = Math.min(tfsa, remaining)
        tfsa = Math.max(0, tfsa - tfsaWithdrawal)
        remaining = Math.max(0, remaining - tfsaWithdrawal)
      }
      if (nonReg > 0 && remaining > 0) {
        nonRegWithdrawal = Math.min(nonReg, remaining)
        nonReg = Math.max(0, nonReg - nonRegWithdrawal)
      }

      const grossIncome = guaranteedIncome + rrspWithdrawal + nonRegWithdrawal * 0.5
      taxPaid = calcCombinedTax(Math.max(0, grossIncome))
      expenses = targetSpend
    }

    const totalGrossIncome = employmentIncome + cppIncome + oasIncome + pensionIncome + rrspWithdrawal + tfsaWithdrawal + nonRegWithdrawal
    const totalNetIncome = Math.max(0, totalGrossIncome - taxPaid)
    const totalPortfolio = Math.max(0, rrsp) + Math.max(0, tfsa) + Math.max(0, nonReg)

    const netCashFlow =
      phase === 'accumulation'
        ? employmentIncome - taxPaid - rrspContrib - tfsaContrib - nonRegContrib
        : totalNetIncome - expenses

    yearly.push({
      year,
      age,
      phase,
      employmentIncome,
      cppIncome,
      oasIncome,
      pensionIncome,
      totalGrossIncome,
      taxPaid,
      totalNetIncome,
      expenses,
      netCashFlow,
      rrspBalance: Math.max(0, rrsp),
      tfsaBalance: Math.max(0, tfsa),
      nonRegBalance: Math.max(0, nonReg),
      totalPortfolio,
      rrspContribution: rrspContrib,
      tfsaContribution: tfsaContrib,
      nonRegContribution: nonRegContrib,
      rrspWithdrawal,
      tfsaWithdrawal,
      nonRegWithdrawal,
    })
  }

  const retirementRow = yearly.find((r) => r.age === person.retirementAge)
  const retirementPortfolio = retirementRow?.totalPortfolio ?? 0

  const retirementRows = yearly.filter((r) => r.phase === 'retirement')
  const lastPositiveRow = [...retirementRows].reverse().find((r) => r.totalPortfolio > 0)
  const portfolioRunwayYears = lastPositiveRow
    ? lastPositiveRow.age - person.retirementAge + 1
    : 0

  const meetsGoal = portfolioRunwayYears >= person.lifeExpectancy - person.retirementAge

  const avgMonthlyIncome =
    retirementRows.length > 0
      ? retirementRows.reduce((s, r) => s + r.totalGrossIncome, 0) / retirementRows.length / 12
      : 0

  const monteCarlo = runMonteCarlo(inputs)

  return {
    yearly,
    monteCarlo,
    retirementPortfolio,
    monthlyRetirementIncome: avgMonthlyIncome,
    portfolioRunwayYears,
    cppMonthly,
    oasMonthly,
    totalContributed,
    meetsGoal,
  }
}

function runMonteCarlo(inputs: RetirementInputs, runs = 1000): MonteCarloResult {
  const { person, savings, assumptions, desiredRetirementIncome } = inputs
  const currentAge = person.currentAge
  const yearsToRetirement = Math.max(0, person.retirementAge - currentAge)
  const yearsInRetirement = Math.max(1, person.lifeExpectancy - person.retirementAge)
  const totalYears = yearsToRetirement + yearsInRetirement

  const nominalReturn = getBlendedReturn(assumptions)
  const volatility = getBlendedVolatility(assumptions)
  const inflation = assumptions.inflationRate / 100

  const cppAnnual = estimateCppMonthly(person.currentIncome, person.cppContributionYears, person.retirementAge) * 12
  const oasAnnual = calcOasMonthly(cppAnnual, 65) * 12
  const pensionAnnual = savings.otherPostRetirementMonthly * 12
  const govtIncome = cppAnnual + oasAnnual + pensionAnnual

  const allBalances: number[][] = Array.from({ length: totalYears }, () => [])
  let successCount = 0

  for (let run = 0; run < runs; run++) {
    let portfolio = savings.rrspBalance + savings.tfsaBalance + savings.nonRegBalance
    let succeeded = true

    for (let yr = 0; yr < totalYears; yr++) {
      const z = boxMullerRandom()
      const annualReturn = nominalReturn + z * volatility
      portfolio *= 1 + annualReturn

      if (yr < yearsToRetirement) {
        portfolio += savings.rrspAnnualContribution + savings.tfsaAnnualContribution + savings.nonRegAnnualContribution
      } else {
        const inflFactor = Math.pow(1 + inflation, yr - yearsToRetirement)
        const netWithdrawal = Math.max(0, desiredRetirementIncome * inflFactor - govtIncome * inflFactor)
        portfolio -= netWithdrawal
        if (portfolio < 0) {
          portfolio = 0
          if (yr === totalYears - 1) succeeded = false
        }
      }

      allBalances[yr].push(Math.max(0, portfolio))
    }

    if (succeeded) successCount++
  }

  const years = Array.from({ length: totalYears }, (_, i) => CURRENT_YEAR + i)

  const pct = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b)
    const idx = Math.floor((p / 100) * (sorted.length - 1))
    return sorted[idx] ?? 0
  }

  return {
    successRate: (successCount / runs) * 100,
    years,
    p10: allBalances.map((yr) => pct(yr, 10)),
    p25: allBalances.map((yr) => pct(yr, 25)),
    p50: allBalances.map((yr) => pct(yr, 50)),
    p75: allBalances.map((yr) => pct(yr, 75)),
    p90: allBalances.map((yr) => pct(yr, 90)),
  }
}
