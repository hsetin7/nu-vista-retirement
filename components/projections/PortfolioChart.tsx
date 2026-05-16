'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { YearlyProjection } from '@/types/retirement'

interface Props {
  yearly: YearlyProjection[]
  retirementAge: number
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0)
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">Age {label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-gray-600">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.fill }} />
          <span>{p.name}:</span>
          <span className="font-medium text-gray-900">{formatYAxis(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-semibold text-gray-800">
        <span>Total</span>
        <span>{formatYAxis(total)}</span>
      </div>
    </div>
  )
}

export default function PortfolioChart({ yearly, retirementAge }: Props) {
  const data = yearly.map((r) => ({
    age: r.age,
    RRSP: Math.round(r.rrspBalance),
    TFSA: Math.round(r.tfsaBalance),
    'Non-Reg': Math.round(r.nonRegBalance),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-1">Portfolio Value Over Time</h3>
      <p className="text-xs text-gray-500 mb-4">Total balance by account type at each age</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            iconType="square"
          />
          <ReferenceLine
            x={retirementAge}
            stroke="#2563eb"
            strokeDasharray="4 3"
            label={{ value: 'Retire', position: 'top', fontSize: 11, fill: '#2563eb' }}
          />
          <Bar dataKey="RRSP" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
          <Bar dataKey="TFSA" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Non-Reg" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
