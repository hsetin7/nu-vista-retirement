// Federal and Ontario tax brackets for 2026

interface TaxBracket {
  threshold: number
  rate: number
}

const FEDERAL_BRACKETS: TaxBracket[] = [
  { threshold: 0, rate: 0.15 },
  { threshold: 57375, rate: 0.205 },
  { threshold: 114750, rate: 0.26 },
  { threshold: 158519, rate: 0.29 },
  { threshold: 220000, rate: 0.33 },
]

const ONTARIO_BRACKETS: TaxBracket[] = [
  { threshold: 0, rate: 0.0505 },
  { threshold: 51446, rate: 0.0915 },
  { threshold: 102894, rate: 0.1116 },
  { threshold: 150000, rate: 0.1216 },
  { threshold: 220000, rate: 0.1316 },
]

const BASIC_PERSONAL_AMOUNT_FEDERAL = 16129
const BASIC_PERSONAL_AMOUNT_ONTARIO = 11865

function calcBracketTax(income: number, brackets: TaxBracket[], basicAmount: number): number {
  const taxableIncome = Math.max(0, income - basicAmount)
  let tax = 0
  for (let i = 0; i < brackets.length; i++) {
    const lower = brackets[i].threshold
    const upper = brackets[i + 1]?.threshold ?? Infinity
    if (taxableIncome <= lower) break
    const slice = Math.min(taxableIncome, upper) - lower
    tax += slice * brackets[i].rate
  }
  return tax
}

export function calcCombinedTax(grossIncome: number, rrspDeduction = 0): number {
  const taxableIncome = Math.max(0, grossIncome - rrspDeduction)
  const federal = calcBracketTax(taxableIncome, FEDERAL_BRACKETS, BASIC_PERSONAL_AMOUNT_FEDERAL)
  const ontario = calcBracketTax(taxableIncome, ONTARIO_BRACKETS, BASIC_PERSONAL_AMOUNT_ONTARIO)
  return federal + ontario
}

export function effectiveTaxRate(grossIncome: number, rrspDeduction = 0): number {
  if (grossIncome <= 0) return 0
  return calcCombinedTax(grossIncome, rrspDeduction) / grossIncome
}

export function marginalTaxRate(grossIncome: number): number {
  const allBrackets = [
    ...FEDERAL_BRACKETS.map((b) => ({ ...b, type: 'federal' })),
    ...ONTARIO_BRACKETS.map((b) => ({ ...b, type: 'ontario' })),
  ]
  let marginal = 0
  for (const bracket of FEDERAL_BRACKETS) {
    if (grossIncome >= bracket.threshold) marginal = bracket.rate
  }
  let ontarioMarginal = 0
  for (const bracket of ONTARIO_BRACKETS) {
    if (grossIncome >= bracket.threshold) ontarioMarginal = bracket.rate
  }
  return marginal + ontarioMarginal
}
