'use client'

const RELEASES = [
  {
    version: 'v2.0',
    date: 'May 2026',
    badge: 'Latest',
    badgeColor: '#059669',
    items: [
      'Redesigned UI — Wealthsimple-inspired clean layout with zero-scroll desktop view',
      'Consolidated inputs into 2 tabs: User Profile and Investments & Assumptions',
      'Removed Expenses section — now uses a single Desired Retirement Income target',
      'Removed Import functionality and second-person inputs for a focused single-user experience',
      'New Account Balances matrix with synchronized slider + number inputs for annual contributions',
      'CPP/OAS years-contributed input with 38-year full-benefit guidance tooltip',
      'Sensitivity Analysis panel with Bear / Mild Bear / Base / Mild Bull / Bull scenario comparison',
      'Goal achievement banner on Projections page (green = on track, red = at risk)',
      'New Portfolio Balance chart: P25–P75 shaded band + P50 median line (Monte Carlo band)',
      'Cash Flow section: full year-by-year drawdown table with income, tax, balances, and portfolio total',
      'PDF Save button: generates a professional report with inputs, metrics, cashflow, and legal disclaimer',
      'Added Other Post-Retirement Income row (monthly guaranteed income, e.g. pension)',
      'Non-registered account contributions now tracked separately',
      'Monte Carlo upgraded to include P25 and P75 percentiles (previously only P10/P50/P90)',
    ],
  },
  {
    version: 'v1.0',
    date: 'April 2026',
    badge: 'Initial',
    badgeColor: '#6b7280',
    items: [
      'Initial release of Nu Vista Analytics Retirement Planner',
      'Support for RRSP, TFSA, Non-Registered, and defined-benefit pension accounts',
      'Canadian 2026 Federal + Ontario tax brackets (15%–33% Federal, 5.05%–13.16% Ontario)',
      'CPP estimator with actuarial age adjustment (−0.6%/mo early, +0.7%/mo late)',
      'OAS with $86,912 clawback threshold (2026 estimate)',
      'Monte Carlo simulation: 1,000 runs, Box-Muller normal distribution, P10/P50/P90',
      '5-tab input system: People & Timeline, Savings, Income, Expenses, Assumptions',
      'Portfolio stacked bar chart (RRSP / TFSA / Non-Reg) and income breakdown chart',
      'Report section with RRSP melt-down strategy description',
      'Deployed to Vercel: nu-vista-retirement.vercel.app',
    ],
  },
]

export default function ReleaseNotesSection() {
  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <div className="px-5 py-4 shrink-0 border-b" style={{ borderColor: '#e5e7eb', background: '#fff' }}>
        <h2
          className="text-sm font-semibold font-serif"
          style={{ color: '#1a1a1a', fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Version Control
        </h2>
        <p className="text-[11px]" style={{ color: '#9a9a9a' }}>Nu Vista Analytics · Retirement Planner · Change History</p>
      </div>

      <div className="flex-1 overflow-y-auto panel-scroll px-5 py-4 flex flex-col gap-5">
        {RELEASES.map((release) => (
          <div
            key={release.version}
            className="rounded-lg border p-4"
            style={{ borderColor: '#e5e7eb', background: '#fff' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold" style={{ color: '#111827' }}>{release.version}</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: release.badgeColor }}
              >
                {release.badge}
              </span>
              <span className="text-[11px]" style={{ color: '#9ca3af' }}>{release.date}</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {release.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-[10px]" style={{ color: '#2563eb' }}>•</span>
                  <span className="text-xs" style={{ color: '#374151', lineHeight: '1.5' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div
          className="rounded-lg border p-4"
          style={{ borderColor: '#e5e7eb', background: '#f6f8fa' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#374151' }}>Legal Disclaimer</p>
          <p className="text-[11px] leading-relaxed" style={{ color: '#6b7280' }}>
            Illustrative projection only. This calculator uses simplified growth and drawdown logic. It does not model income taxes,
            RRIF minimum withdrawals, OAS clawback, GIS eligibility, inflation, benefit indexation, or account sequencing.
            Results are for educational purposes and are not personalized financial advice. Consult a qualified financial planner
            before making decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
