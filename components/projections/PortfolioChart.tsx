'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import type { ProjectionResults, RetirementInputs } from '@/types/retirement'
import { formatCurrency } from '@/lib/utils'

interface Props {
  results: ProjectionResults
  inputs: RetirementInputs
}

function formatYAxis(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

export default function PortfolioChart({ results, inputs }: Props) {
  const { monteCarlo, yearly } = results
  const retirementYear = yearly.find((r) => r.phase === 'retirement')?.year

  const data = monteCarlo.years.map((year, i) => ({
    year,
    bandLow: monteCarlo.p25[i],
    bandHigh: monteCarlo.p75[i],
    p50: monteCarlo.p50[i],
  }))

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: '#e5e7eb', background: '#fff' }}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
          Portfolio Balance Trajectory
        </h3>
        <p className="text-[11px]" style={{ color: '#6b7280' }}>
          P25–P75 band with median · 1,000 Monte Carlo simulations
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), '']}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{
              fontSize: 11,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          {/* P25–P75 band: stack high on top of low, then paint low white */}
          <Area type="monotone" dataKey="bandHigh" stroke="none" fill="#dbeafe" fillOpacity={1} legendType="none" name="P75" />
          <Area type="monotone" dataKey="bandLow" stroke="none" fill="#f6f8fa" fillOpacity={1} legendType="none" name="P25" />
          {/* Median line */}
          <Line type="monotone" dataKey="p50" stroke="#2563eb" strokeWidth={2} dot={false} name="Base Case (P50)" />
          {retirementYear && (
            <ReferenceLine
              x={retirementYear}
              stroke="#d97706"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'Retire', position: 'insideTopLeft', fontSize: 9, fill: '#d97706', dy: -2 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-0.5 rounded" style={{ background: '#2563eb' }} />
          <span className="text-[10px]" style={{ color: '#6b7280' }}>Base Case (P50)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-3 rounded" style={{ background: '#dbeafe' }} />
          <span className="text-[10px]" style={{ color: '#6b7280' }}>P25–P75 range</span>
        </div>
        {retirementYear && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 border-t border-dashed" style={{ borderColor: '#d97706' }} />
            <span className="text-[10px]" style={{ color: '#6b7280' }}>Retirement</span>
          </div>
        )}
      </div>
    </div>
  )
}
