import type { RetirementInputs, ProjectionResults } from '@/types/retirement'

const DISCLAIMER =
  'Illustrative projection only. This calculator uses simplified growth and drawdown logic. It does not model income taxes, RRIF minimum withdrawals, OAS clawback, GIS eligibility, inflation, benefit indexation, or account sequencing. Results are for educational purposes and are not personalized financial advice. Consult a qualified financial planner before making decisions.'

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`
}

export async function exportPdf(
  inputs: RetirementInputs,
  results: ProjectionResults
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const jsPDFModule = await import('jspdf')
  const jsPDF = jsPDFModule.default
  const autoTableModule = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  // Attach autotable to instance
  ;(autoTableModule.default as unknown as (doc: InstanceType<typeof jsPDF>) => void)(doc)

  const MARGIN = 18
  const PAGE_W = 215.9
  const CONTENT_W = PAGE_W - MARGIN * 2
  const BLUE = [37, 99, 235] as [number, number, number]
  const DARK = [17, 24, 39] as [number, number, number]
  const GRAY = [107, 114, 128] as [number, number, number]
  const LIGHT = [246, 248, 250] as [number, number, number]

  let y = MARGIN

  function addPage() {
    doc.addPage()
    y = MARGIN
  }

  function checkPage(needed = 20) {
    if (y + needed > 260) addPage()
  }

  function sectionHeader(text: string) {
    checkPage(14)
    doc.setFillColor(...BLUE)
    doc.rect(MARGIN, y, CONTENT_W, 7, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(text, MARGIN + 3, y + 4.8)
    y += 10
    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'normal')
  }

  function labelValue(label: string, value: string, col: 0 | 1 = 0) {
    const x = col === 0 ? MARGIN : MARGIN + CONTENT_W / 2
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY)
    doc.text(label, x, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    doc.text(value, x, y + 4)
  }

  // ── COVER / HEADER ──
  doc.setFillColor(...DARK)
  doc.rect(0, 0, PAGE_W, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Nu Vista Analytics', MARGIN, 13)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 190, 210)
  doc.text('Retirement Forecast Report', MARGIN, 21)
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    MARGIN,
    27
  )
  y = 40

  // ── 1. INPUT SUMMARY ──
  sectionHeader('1. INPUT SUMMARY')

  const person = inputs.person
  const currentAge = new Date().getFullYear() - person.birthYear

  labelValue('Name', person.name || '—', 0)
  labelValue('Birth Year / Age', `${person.birthYear} (Age ${currentAge})`, 1)
  y += 10
  labelValue('Retirement Age', `${person.retirementAge}`, 0)
  labelValue('Life Expectancy', `${person.lifeExpectancy}`, 1)
  y += 10
  labelValue('Current Annual Income', fmt(person.currentIncome), 0)
  labelValue('Desired Retirement Income', fmt(inputs.desiredRetirementIncome), 1)
  y += 10
  labelValue('CPP/OAS Contribution Years', `${person.cppContributionYears} years`, 0)
  y += 8

  // Accounts table
  ;(doc as unknown as { autoTable: (opts: object) => void }).autoTable({
    startY: y,
    head: [['Account', 'Current Balance', 'Annual Contribution']],
    body: [
      ['RRSP', fmt(inputs.savings.rrspBalance), fmt(inputs.savings.rrspAnnualContribution)],
      ['TFSA', fmt(inputs.savings.tfsaBalance), fmt(inputs.savings.tfsaAnnualContribution)],
      ['Non-Registered', fmt(inputs.savings.nonRegBalance), fmt(inputs.savings.nonRegAnnualContribution)],
      ['Other Post-Ret. Income', `${fmt(inputs.savings.otherPostRetirementMonthly)}/mo`, `Starts age ${inputs.savings.otherPostRetirementStartAge}`],
    ],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: LIGHT, textColor: GRAY, fontStyle: 'bold', fontSize: 7.5 },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

  // Assumptions
  const a = inputs.assumptions
  checkPage(20)
  labelValue('Equity / Bond / Cash', `${a.equityPct}% / ${a.bondPct}% / ${a.cashPct}%`, 0)
  labelValue('Inflation Rate', pct(a.inflationRate), 1)
  y += 10
  labelValue('Equity Return / Volatility', `${pct(a.equityMeanReturn)} / ${pct(a.equityVolatility)}`, 0)
  labelValue('Bond Return / Volatility', `${pct(a.bondMeanReturn)} / ${pct(a.bondVolatility)}`, 1)
  y += 12

  // ── 2. RETIREMENT METRICS ──
  sectionHeader('2. RETIREMENT METRICS')

  const metricsData = [
    ['Portfolio at Retirement', fmt(results.retirementPortfolio)],
    ['Total Contributed (all years)', fmt(results.totalContributed)],
    ['CPP (estimated monthly)', fmt(results.cppMonthly)],
    ['OAS (estimated monthly)', fmt(results.oasMonthly)],
    ['Portfolio Runway', `${results.portfolioRunwayYears} years`],
    ['Monte Carlo Success Rate', `${results.monteCarlo.successRate.toFixed(0)}%`],
    ['Goal Achievement', results.meetsGoal ? '✓ On Track' : '✗ At Risk'],
  ]

  ;(doc as unknown as { autoTable: (opts: object) => void }).autoTable({
    startY: y,
    body: metricsData,
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: GRAY, cellWidth: 90 },
      1: { textColor: DARK, halign: 'right' },
    },
    alternateRowStyles: { fillColor: LIGHT },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

  // ── 3. CASH FLOW TABLE ──
  addPage()
  sectionHeader('3. YEAR-BY-YEAR CASH FLOW')

  const cfBody = results.yearly.map((row) => {
    const govt = row.cppIncome + row.oasIncome + row.pensionIncome
    return [
      row.year.toString(),
      row.age.toString(),
      row.phase === 'accumulation' ? 'Acc.' : 'Ret.',
      row.phase === 'accumulation' ? fmt(row.employmentIncome) : fmt(row.totalGrossIncome),
      row.taxPaid > 0 ? `−${fmt(row.taxPaid)}` : '—',
      govt > 0 ? fmt(govt) : '—',
      fmt(row.rrspBalance),
      fmt(row.tfsaBalance),
      fmt(row.nonRegBalance),
      row.totalPortfolio === 0 ? 'Depleted' : fmt(row.totalPortfolio),
    ]
  })

  ;(doc as unknown as { autoTable: (opts: object) => void }).autoTable({
    startY: y,
    head: [['Year', 'Age', 'Phase', 'Income', 'Tax', 'CPP/OAS', 'RRSP', 'TFSA', 'Non-Reg', 'Portfolio']],
    body: cfBody,
    styles: { fontSize: 6.5, cellPadding: 1.5 },
    headStyles: { fillColor: LIGHT, textColor: GRAY, fontStyle: 'bold', fontSize: 6.5 },
    margin: { left: MARGIN, right: MARGIN },
    didParseCell: (data: { row: { raw: string[] }; cell: { styles: { textColor: [number, number, number] } } }) => {
      if (data.row.raw[9] === 'Depleted') {
        data.cell.styles.textColor = [220, 38, 38]
      }
    },
  })
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  // ── 4. DISCLAIMER ──
  checkPage(24)
  doc.setFillColor(250, 250, 250)
  doc.setDrawColor(220, 220, 220)
  doc.roundedRect(MARGIN, y, CONTENT_W, 20, 2, 2, 'FD')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY)
  doc.setFont('helvetica', 'italic')
  const lines = doc.splitTextToSize(DISCLAIMER, CONTENT_W - 6)
  doc.text(lines, MARGIN + 3, y + 5)

  // ── Page numbers ──
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(
      `Nu Vista Analytics · Retirement Forecast · Page ${i} of ${pageCount}`,
      MARGIN,
      doc.internal.pageSize.height - 8
    )
  }

  const name = inputs.person.name ? inputs.person.name.replace(/\s+/g, '_') : 'Retirement'
  doc.save(`${name}_NuVista_RetirementForecast.pdf`)
}
