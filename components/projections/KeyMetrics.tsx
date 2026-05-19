'use client'

import { formatCurrency } from '@/lib/utils'
import type { ProjectionResults, RetirementInputs } from '@/types/retirement'

interface Props {
  results: ProjectionResults
  inputs: RetirementInputs
}

function Card({
  label,
  value,
  sub,
  style,
}: {
  label: string
  value: string
  sub?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className="rounded-lg border p-3 flex flex-col gap-0.5"
      style={{ borderColor: '#e5e7eb', background: '#fff', ...style }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>{label}</p>
      <p className="text-xl font-bold leading-tight" style={{ color: '#111827' }}>{value}</p>
      {sub && <p className="text-[11px]" style={{ color: '#9ca3af' }}>{sub}</p>}
    </div>
  )
}

export default function KeyMetrics({ results, inputs }: Props) {
  const sr = results.monteCarlo.successRate
  const successStyle =
    sr >= 85
      ? { borderColor: '#bbf7d0', background: '#f0fdf4', color: '#059669' }
      : sr >= 65
      ? { borderColor: '#fef08a', background: '#fefce8', color: '#d97706' }
      : { borderColor: '#fecaca', background: '#fef2f2', color: '#dc2626' }

  const runwayNeeded = inputs.person.lifeExpectancy - inputs.person.retirementAge
  const runwayOk = results.portfolioRunwayYears >= runwayNeeded

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card
        label="Portfolio at Retirement"
        value={formatCurrency(results.retirementPortfolio, true)}
        sub="RRSP + TFSA + Non-Reg"
        style={{ borderColor: '#bfdbfe', background: '#eff6ff' }}
      />
      <Card
        label="Total Contributed"
        value={formatCurrency(results.totalContributed, true)}
        sub="All accounts, all years"
      />
      <div
        className="rounded-lg border p-3 flex flex-col gap-0.5"
        style={successStyle}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">Monte Carlo Success</p>
        <p className="text-xl font-bold leading-tight">{sr.toFixed(0)}%</p>
        <p className="text-[10px] opacity-70">of 1,000 scenarios</p>
      </div>
      <div
        className="rounded-lg border p-3 flex flex-col gap-0.5"
        style={{
          borderColor: runwayOk ? '#bbf7d0' : '#fecaca',
          background: runwayOk ? '#f0fdf4' : '#fef2f2',
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>Portfolio Runway</p>
        <p className="text-xl font-bold leading-tight" style={{ color: runwayOk ? '#059669' : '#dc2626' }}>
          {results.portfolioRunwayYears} yrs
        </p>
        <p className="text-[11px]" style={{ color: '#9ca3af' }}>Need {runwayNeeded} yrs</p>
      </div>
    </div>
  )
}
