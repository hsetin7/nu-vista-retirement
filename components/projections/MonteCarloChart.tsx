'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { MonteCarloResult } from '@/types/retirement'
import { CURRENT_YEAR } from '@/lib/utils'

interface Props {
  monteCarlo: MonteCarloResult
  retirementAge: number
  currentAge: number
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

export default function MonteCarloChart({ monteCarlo, retirementAge, currentAge }: Props) {
  const data = monteCarlo.years.map((year, i) => ({
    age: currentAge + (year - CURRENT_YEAR),
    P90: Math.round(monteCarlo.p90[i]),
    P50: Math.round(monteCarlo.p50[i]),
    P10: Math.round(monteCarlo.p10[i]),
  }))

  const successColor =
    monteCarlo.successRate >= 85
      ? '#16a34a'
      : monteCarlo.successRate >= 65
      ? '#ca8a04'
      : '#dc2626'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-semibold text-gray-800">Monte Carlo Simulation</h3>
          <p className="text-xs text-gray-500 mt-0.5">1,000 randomized market scenarios</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: successColor }}>
            {monteCarlo.successRate.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500">success rate</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value) => [formatYAxis(Number(value)), '']}
            labelFormatter={(label) => `Age ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
          <ReferenceLine
            x={retirementAge}
            stroke="#2563eb"
            strokeDasharray="4 3"
            label={{ value: 'Retire', position: 'top', fontSize: 11, fill: '#2563eb' }}
          />
          <Line
            type="monotone"
            dataKey="P90"
            name="90th percentile (best)"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 3"
          />
          <Line
            type="monotone"
            dataKey="P50"
            name="50th percentile (median)"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="P10"
            name="10th percentile (worst)"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 3"
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-400 mt-3">
        Shaded area shows range of outcomes. Median line is the most likely path. A success rate above
        85% means your plan is robust to most market conditions.
      </p>
    </div>
  )
}
