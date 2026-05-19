'use client'

import type { ProjectionResults, RetirementInputs } from '@/types/retirement'
import { formatCurrency } from '@/lib/utils'

interface Props {
  results: ProjectionResults | null
  inputs: RetirementInputs
  onRunSimulation: () => void
}

function fmt(n: number, opts?: { sign?: boolean; compact?: boolean }): string {
  if (opts?.compact) return formatCurrency(n, true)
  const abs = Math.abs(n)
  const str = abs >= 1_000_000
    ? `$${(abs / 1_000_000).toFixed(2)}M`
    : abs >= 1_000
    ? `$${(abs / 1_000).toFixed(1)}K`
    : `$${abs.toFixed(0)}`
  if (opts?.sign && n !== 0) return `${n > 0 ? '+' : '−'}${str}`
  return str
}

export default function CashFlowSection({ results, inputs, onRunSimulation }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#eff6ff' }}>
          <span className="text-2xl">💰</span>
        </div>
        <h2 className="text-base font-semibold mb-2" style={{ color: '#111827' }}>No data yet</h2>
        <p className="text-xs mb-5 max-w-xs" style={{ color: '#6b7280' }}>Run a simulation first to see the year-by-year cashflow table.</p>
        <button
          onClick={onRunSimulation}
          className="px-4 py-2 text-white text-xs font-semibold rounded hover:opacity-90"
          style={{ background: '#2563eb' }}
        >
          Run Simulation
        </button>
      </div>
    )
  }

  const { yearly } = results
  const retirementAge = inputs.person.retirementAge

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b" style={{ borderColor: '#e5e7eb', background: '#fff' }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>Cash Flow</h2>
          <p className="text-[11px]" style={{ color: '#6b7280' }}>
            Year-by-year asset trajectory · {yearly.length} years
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: '#6b7280' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#e5e7eb' }} /> Accumulation
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#eff6ff' }} /> Retirement
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto panel-scroll" style={{ minHeight: 0 }}>
        <table style={{ tableLayout: 'fixed', minWidth: '820px' }}>
          <colgroup>
            <col style={{ width: '56px' }} />
            <col style={{ width: '48px' }} />
            <col style={{ width: '108px' }} />
            <col style={{ width: '72px' }} />
            <col style={{ width: '108px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '108px' }} />
          </colgroup>
          <thead className="sticky top-0 z-10" style={{ background: '#f6f8fa', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              {[
                'Year', 'Age', 'Income', 'Tax', 'CPP/OAS/Pension',
                'RRSP Bal', 'TFSA Bal', 'Non-Reg', 'Portfolio Total',
              ].map((h) => (
                <th
                  key={h}
                  className="text-right text-[10px] font-semibold px-2 py-2"
                  style={{ color: '#6b7280', textAlign: h === 'Year' || h === 'Age' ? 'left' : 'right' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yearly.map((row, idx) => {
              const isRetirement = row.phase === 'retirement'
              const isRetirementStart = row.age === retirementAge
              const govtIncome = row.cppIncome + row.oasIncome + row.pensionIncome
              const portfolioZero = row.totalPortfolio === 0

              return (
                <tr
                  key={row.year}
                  style={{
                    background: portfolioZero
                      ? '#fef2f2'
                      : isRetirement
                      ? '#eff6ff'
                      : idx % 2 === 0
                      ? '#fff'
                      : '#f9fafb',
                    borderBottom: isRetirementStart ? '2px solid #2563eb' : '1px solid #f3f4f6',
                  }}
                >
                  <td className="px-2 py-1.5 text-xs font-medium" style={{ color: '#374151' }}>
                    {row.year}
                  </td>
                  <td className="px-2 py-1.5 text-xs" style={{ color: '#374151' }}>
                    {row.age}
                    {isRetirementStart && (
                      <span className="ml-1 text-[9px] font-semibold px-1 py-0.5 rounded" style={{ background: '#2563eb', color: '#fff' }}>
                        Retire
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-right" style={{ color: '#111827' }}>
                    {isRetirement
                      ? fmt(row.totalGrossIncome)
                      : fmt(row.employmentIncome)}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-right" style={{ color: '#dc2626' }}>
                    {row.taxPaid > 0 ? `−${fmt(row.taxPaid)}` : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-right" style={{ color: isRetirement ? '#059669' : '#9ca3af' }}>
                    {isRetirement && govtIncome > 0 ? fmt(govtIncome) : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-right" style={{ color: '#111827' }}>
                    {fmt(row.rrspBalance)}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-right" style={{ color: '#111827' }}>
                    {fmt(row.tfsaBalance)}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-right" style={{ color: '#111827' }}>
                    {fmt(row.nonRegBalance)}
                  </td>
                  <td className="px-2 py-1.5 text-xs text-right font-semibold" style={{ color: portfolioZero ? '#dc2626' : '#111827' }}>
                    {portfolioZero ? 'Depleted' : fmt(row.totalPortfolio)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <div
        className="px-4 py-2 text-[10px] shrink-0 border-t"
        style={{ borderColor: '#e5e7eb', color: '#9ca3af', background: '#f6f8fa', lineHeight: '1.5' }}
      >
        Illustrative projection only. This calculator uses simplified growth and drawdown logic. It does not model income taxes, RRIF minimum withdrawals,
        OAS clawback, GIS eligibility, inflation, benefit indexation, or account sequencing. Results are for educational purposes and are not personalized
        financial advice. Consult a qualified financial planner before making decisions.
      </div>
    </div>
  )
}
