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
} from 'recharts'
import type { YearlyProjection } from '@/types/retirement'

interface Props {
  yearly: YearlyProjection[]
  retirementAge: number
}

function formatYAxis(value: number): string {
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
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
    </div>
  )
}

export default function IncomeChart({ yearly, retirementAge }: Props) {
  const retirementRows = yearly.filter((r) => r.age >= retirementAge)

  const data = retirementRows.map((r) => ({
    age: r.age,
    CPP: Math.round(r.cppIncome),
    OAS: Math.round(r.oasIncome),
    Pension: Math.round(r.pensionIncome),
    RRSP: Math.round(r.rrspWithdrawal),
    TFSA: Math.round(r.tfsaWithdrawal),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-1">Retirement Income Breakdown</h3>
      <p className="text-xs text-gray-500 mb-4">Annual income by source during retirement</p>
      <ResponsiveContainer width="100%" height={260}>
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
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} iconType="square" />
          <Bar dataKey="CPP" stackId="a" fill="#6366f1" />
          <Bar dataKey="OAS" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="Pension" stackId="a" fill="#a78bfa" />
          <Bar dataKey="RRSP" stackId="a" fill="#2563eb" />
          <Bar dataKey="TFSA" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
