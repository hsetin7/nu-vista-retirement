'use client'

import { formatCurrency, formatPct } from '@/lib/utils'
import type { ProjectionResults } from '@/types/retirement'

interface Props {
  results: ProjectionResults
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${highlight ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function KeyMetrics({ results }: Props) {
  const successColor =
    results.monteCarlo.successRate >= 85
      ? 'text-green-700 bg-green-50 border-green-200'
      : results.monteCarlo.successRate >= 65
      ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
      : 'text-red-700 bg-red-50 border-red-200'

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <MetricCard
        label="Portfolio at Retirement"
        value={formatCurrency(results.retirementPortfolio, true)}
        sub="Combined RRSP + TFSA + Non-Reg"
        highlight
      />
      <MetricCard
        label="Monthly Retirement Income"
        value={formatCurrency(results.monthlyRetirementIncome)}
        sub="Avg. after tax (gross)"
      />
      <div className={`rounded-xl border p-5 ${successColor}`}>
        <p className="text-xs font-medium uppercase tracking-wide mb-1 opacity-70">Monte Carlo Success</p>
        <p className="text-2xl font-bold">{results.monteCarlo.successRate.toFixed(0)}%</p>
        <p className="text-xs mt-1 opacity-70">of 1,000 scenarios outlast plan</p>
      </div>
      <MetricCard
        label="Portfolio Runway"
        value={`${results.portfolioRunwayYears} yrs`}
        sub="Years portfolio stays positive"
      />
    </div>
  )
}
