import type { RetirementInputs, ProjectionResults } from '@/types/retirement'

const DISCLAIMER =
  'Illustrative projection only. This calculator uses simplified growth and drawdown logic. It does not model income taxes, RRIF minimum withdrawals, OAS clawback, GIS eligibility, inflation, benefit indexation, or account sequencing. Results are for educational purposes and are not personalized financial advice. Consult a qualified financial planner before making decisions.'

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function fmtFull(n: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`
}

function getBlendedReturn(a: RetirementInputs['assumptions']): number {
  return (
    (a.equityPct / 100) * (a.equityMeanReturn / 100) +
    (a.bondPct / 100) * (a.bondMeanReturn / 100) +
    (a.cashPct / 100) * (a.cashReturn / 100)
  )
}

/**
 * Calculate additional monthly savings required to close the retirement income gap.
 * Returns 0 if the plan already meets the goal.
 */
function calcAdditionalMonthlySavings(inputs: RetirementInputs, results: ProjectionResults): number {
  if (results.meetsGoal) return 0

  const { person, desiredRetirementIncome, savings, assumptions } = inputs
  const yearsToRetirement = Math.max(1, person.retirementAge - person.currentAge)
  const yearsInRetirement = Math.max(1, person.lifeExpectancy - person.retirementAge)
  const annualReturn = getBlendedReturn(assumptions)

  // Government + guaranteed income per year (nominal, unindexed estimate)
  const govtAnnual = (results.cppMonthly + results.oasMonthly) * 12 + savings.otherPostRetirementMonthly * 12

  // Annual portfolio withdrawal needed
  const annualWithdrawalNeeded = Math.max(0, desiredRetirementIncome - govtAnnual)

  // Present value of that annuity stream at retirement
  const r = annualReturn
  const pvFactor = r > 0
    ? (1 - Math.pow(1 + r, -yearsInRetirement)) / r
    : yearsInRetirement
  const neededAtRetirement = annualWithdrawalNeeded * pvFactor

  const gap = Math.max(0, neededAtRetirement - results.retirementPortfolio)
  if (gap <= 0) return 0

  // Future value annuity factor (monthly contributions)
  const monthlyRate = annualReturn / 12
  const months = yearsToRetirement * 12
  const fvFactor = monthlyRate > 0
    ? (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
    : months

  return fvFactor > 0 ? gap / fvFactor : 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = any

export async function exportPdf(
  inputs: RetirementInputs,
  results: ProjectionResults
): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc: AnyDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const MARGIN = 18
  const PAGE_W = 215.9
  const CONTENT_W = PAGE_W - MARGIN * 2
  const DARK: [number, number, number] = [26, 26, 26]
  const GRAY: [number, number, number] = [92, 92, 92]
  const LIGHT: [number, number, number] = [243, 242, 239]
  const AMBER: [number, number, number] = [201, 150, 76]
  const GREEN: [number, number, number] = [45, 106, 79]
  const RED: [number, number, number] = [184, 53, 53]

  let y = MARGIN

  function addPage() {
    doc.addPage()
    y = MARGIN
  }

  function checkPage(needed = 20) {
    if (y + needed > 255) addPage()
  }

  function sectionHeader(text: string) {
    checkPage(12)
    doc.setFillColor(...DARK)
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text(text, MARGIN + 3, y + 4.8)
    y += 11
    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'normal')
  }

  function row2col(label1: string, val1: string, label2: string, val2: string) {
    const mid = MARGIN + CONTENT_W / 2
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY)
    doc.text(label1, MARGIN, y)
    doc.text(label2, mid, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    doc.text(val1, MARGIN, y + 4.5)
    doc.text(val2, mid, y + 4.5)
    y += 10
  }

  // ── COVER HEADER ──
  doc.setFillColor(...DARK)
  doc.rect(0, 0, PAGE_W, 30, 'F')
  doc.setFillColor(...AMBER)
  doc.rect(0, 30, PAGE_W, 1.5, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Nu Vista Analytics', MARGIN, 14)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 170, 155)
  doc.text('Retirement Planner  |  Forecast Report', MARGIN, 21)
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    MARGIN, 27
  )
  y = 40

  // ── PERSONALIZED SUMMARY (before section 1) ──
  const person = inputs.person
  const displayName = person.name || 'You'
  const additionalMonthly = calcAdditionalMonthlySavings(inputs, results)

  if (results.meetsGoal) {
    // Congratulations message
    doc.setFillColor(230, 245, 237)
    doc.setDrawColor(45, 106, 79)
    doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...GREEN)
    doc.text(`Congratulations, ${displayName}!`, MARGIN + 4, y + 7)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(45, 106, 79)
    const congrats = doc.splitTextToSize(
      `Your current savings plan and investments are on track to support your retirement income target of ${fmtFull(inputs.desiredRetirementIncome)}/yr through age ${person.lifeExpectancy}. Well done! We recommend continuing to monitor your interest rate and inflation assumptions annually to stay on course.`,
      CONTENT_W - 8
    )
    doc.text(congrats, MARGIN + 4, y + 13)
    y += 28
  } else {
    // Shortfall message
    doc.setFillColor(253, 242, 242)
    doc.setDrawColor(184, 53, 53)
    doc.roundedRect(MARGIN, y, CONTENT_W, 24, 2, 2, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...RED)
    doc.text(`Retirement Gap Identified — ${displayName}`, MARGIN + 4, y + 7)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(184, 53, 53)
    const shortfallText = additionalMonthly > 0
      ? `Based on your current savings and planned investments, ${displayName} needs an additional ${fmtFull(additionalMonthly)}/month (${fmtFull(additionalMonthly * 12)}/year) in savings to achieve the retirement income target of ${fmtFull(inputs.desiredRetirementIncome)}/yr. Review your contribution strategy or consider adjusting your retirement age.`
      : `Based on your current savings and planned investments, the portfolio may not sustain the target retirement income of ${fmtFull(inputs.desiredRetirementIncome)}/yr through age ${person.lifeExpectancy}. Consider increasing contributions or adjusting your timeline.`
    const lines = doc.splitTextToSize(shortfallText, CONTENT_W - 8)
    doc.text(lines, MARGIN + 4, y + 13)
    y += 30
  }

  y += 4

  // ── 1. PROFILE SUMMARY ──
  sectionHeader('1.  PROFILE SUMMARY')

  row2col('Name', person.name || '—', 'Current Age', `${person.currentAge}`)
  row2col('Retirement Age', `${person.retirementAge}`, 'Life Expectancy', `${person.lifeExpectancy}`)
  row2col('Current Annual Income', fmt(person.currentIncome), 'Desired Retirement Income', fmt(inputs.desiredRetirementIncome))
  row2col('CPP/OAS Contribution Years', `${person.cppContributionYears} years`, 'Years to Retirement', `${Math.max(0, person.retirementAge - person.currentAge)} years`)

  y += 2
  autoTable(doc, {
    startY: y,
    head: [['Account', 'Current Balance', 'Annual Contribution']],
    body: [
      ['RRSP', fmt(inputs.savings.rrspBalance), fmt(inputs.savings.rrspAnnualContribution)],
      ['TFSA', fmt(inputs.savings.tfsaBalance), fmt(inputs.savings.tfsaAnnualContribution)],
      ['Non-Registered', fmt(inputs.savings.nonRegBalance), fmt(inputs.savings.nonRegAnnualContribution)],
      ['Other Post-Ret. Income', `${fmt(inputs.savings.otherPostRetirementMonthly)}/mo`, `Starts age ${inputs.savings.otherPostRetirementStartAge}`],
    ],
    styles: { fontSize: 8, cellPadding: 2.5, textColor: DARK },
    headStyles: { fillColor: LIGHT, textColor: GRAY, fontStyle: 'bold', fontSize: 7.5 },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 6

  const a = inputs.assumptions
  checkPage(14)
  row2col('Asset Allocation', `Equity ${a.equityPct}% / Bond ${a.bondPct}% / Cash ${a.cashPct}%`, 'Inflation', pct(a.inflationRate))
  row2col('Equity Return / Volatility', `${pct(a.equityMeanReturn)} / ${pct(a.equityVolatility)}`, 'Bond Return / Volatility', `${pct(a.bondMeanReturn)} / ${pct(a.bondVolatility)}`)

  // ── 2. FORECAST METRICS ──
  sectionHeader('2.  FORECAST METRICS')

  const goalText = results.meetsGoal
    ? 'ON TRACK - Portfolio projected to last full retirement horizon'
    : `AT RISK - Portfolio may deplete after ${results.portfolioRunwayYears} yrs (need ${person.lifeExpectancy - person.retirementAge} yrs)`

  autoTable(doc, {
    startY: y,
    body: [
      ['Portfolio at Retirement', fmt(results.retirementPortfolio)],
      ['Total Contributed (all years)', fmt(results.totalContributed)],
      ['CPP (estimated monthly)', fmt(results.cppMonthly)],
      ['OAS (estimated monthly)', fmt(results.oasMonthly)],
      ['Portfolio Runway', `${results.portfolioRunwayYears} years`],
      ['Monte Carlo Success Rate', `${results.monteCarlo.successRate.toFixed(0)}% of 1,000 simulations`],
      ['Goal Achievement', goalText],
    ],
    styles: { fontSize: 9, cellPadding: 3, textColor: DARK },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: GRAY, cellWidth: 90 },
      1: { halign: 'right' },
    },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: MARGIN, right: MARGIN },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (data: any) => {
      if (data.column.index === 1 && data.row.index === 6) {
        data.cell.styles.textColor = results.meetsGoal ? GREEN : RED
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })
  y = doc.lastAutoTable.finalY + 8

  // ── 3. YEAR-BY-YEAR CASH FLOW ──
  addPage()
  sectionHeader('3.  YEAR-BY-YEAR CASH FLOW')

  const cfBody = results.yearly.map((row) => {
    const govt = row.cppIncome + row.oasIncome + row.pensionIncome
    const drawdown = row.rrspWithdrawal + row.tfsaWithdrawal + row.nonRegWithdrawal
    return [
      row.year.toString(),
      row.age.toString(),
      row.phase === 'accumulation' ? 'Accum.' : 'Retire',
      row.phase === 'accumulation' ? fmt(row.employmentIncome) : fmt(row.totalGrossIncome),
      govt > 0 ? fmt(govt) : '—',
      drawdown > 0 ? fmt(drawdown) : '—',
      fmt(row.rrspBalance),
      fmt(row.tfsaBalance),
      fmt(row.nonRegBalance),
      row.totalPortfolio === 0 ? 'Depleted' : fmt(row.totalPortfolio),
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['Year', 'Age', 'Phase', 'Income', 'CPP/OAS', 'Drawdown', 'RRSP', 'TFSA', 'Non-Reg', 'Portfolio']],
    body: cfBody,
    styles: { fontSize: 6.5, cellPadding: 1.5, textColor: DARK },
    headStyles: { fillColor: LIGHT, textColor: GRAY, fontStyle: 'bold', fontSize: 6.5 },
    margin: { left: MARGIN, right: MARGIN },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (data: any) => {
      if (data.column.index === 9 && data.cell.raw === 'Depleted') {
        data.cell.styles.textColor = RED
        data.cell.styles.fontStyle = 'bold'
      }
      if (data.column.index === 2 && data.cell.raw === 'Retire') {
        data.cell.styles.textColor = AMBER
      }
    },
  })
  y = doc.lastAutoTable.finalY + 8

  // ── 4. DISCLAIMER ──
  checkPage(22)
  doc.setFillColor(243, 242, 239)
  doc.setDrawColor(220, 217, 210)
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 2, 2, 'FD')
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...GRAY)
  const lines = doc.splitTextToSize(DISCLAIMER, CONTENT_W - 8)
  doc.text(lines, MARGIN + 4, y + 5)

  // ── PAGE NUMBERS ──
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(
      `Nu Vista Analytics  |  Retirement Planner  |  Page ${i} of ${pageCount}`,
      MARGIN,
      doc.internal.pageSize.height - 8
    )
  }

  const safeName = (inputs.person.name || 'Retirement').replace(/[^a-zA-Z0-9_-]/g, '_')
  doc.save(`${safeName}_NuVista_Forecast.pdf`)
}
