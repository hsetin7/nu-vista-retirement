'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts'
import type { ProjectionResults, RetirementInputs } from '@/types/retirement'
import { formatCurrency } from '@/lib/utils'

interface Props {
  results: ProjectionResults | null
  inputs: RetirementInputs
  onRunSimulation: () => void
}

function fmtY(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

const COLORS = {
  RRSP: '#2563eb',
  TFSA: '#059669',
  NonReg: '#c9964c',
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string }>
  label?: number
}) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value || 0), 0)
  return (
    <div
      className="rounded-lg p-3 text-xs shadow-lg"
      style={{ background: '#ffffff', border: '1px solid #e8e6e1', minWidth: 160 }}
    >
      <p className="font-semibold mb-2" style={{ color: '#1a1a1a' }}>Age {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ background: p.fill }} />
            <span style={{ color: '#5c5c5c' }}>{p.name}</span>
          </div>
          <span className="font-medium" style={{ color: '#1a1a1a' }}>{formatCurrency(p.value, true)}</span>
        </div>
      ))}
      <div
        className="flex justify-between font-semibold mt-2 pt-2"
        style={{ borderTop: '1px solid #e8e6e1', color: '#1a1a1a' }}
      >
        <span>Total</span>
        <span>{formatCurrency(total, true)}</span>
      </div>
    </div>
  )
}

export default function CashFlowSection({ results, inputs, onRunSimulation }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: '#f3f2ef' }}
        >
          <span className="text-2xl">💰</span>
        </div>
        <h2 className="text-base font-semibold mb-2" style={{ color: '#1a1a1a' }}>No data yet</h2>
        <p className="text-xs mb-5 max-w-xs" style={{ color: '#5c5c5c' }}>
          Run an analysis first to see your portfolio trajectory.
        </p>
        <button onClick={onRunSimulation} className="btn-3d btn-primary-3d">
          Run Analysis
        </button>
      </div>
    )
  }

  const { yearly } = results
  const retirementAge = inputs.person.retirementAge

  const data = yearly.map((r) => ({
    age: r.age,
    year: r.year,
    phase: r.phase,
    RRSP: Math.round(r.rrspBalance),
    TFSA: Math.round(r.tfsaBalance),
    'Non-Reg': Math.round(r.nonRegBalance),
    total: Math.round(r.totalPortfolio),
  }))

  const retirementRow = yearly.find((r) => r.age === retirementAge)
  const peakValue = Math.max(...data.map((d) => d.total))

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0 border-b"
        style={{ borderColor: '#e8e6e1', background: '#ffffff' }}
      >
        <div>
          <h2
            className="text-sm font-semibold font-serif"
            style={{ color: '#1a1a1a', fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Cash Flow
          </h2>
          <p className="text-[11px]" style={{ color: '#9a9a9a' }}>
            Portfolio value by account type · accumulation grows, retirement draws down
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px]" style={{ color: '#9a9a9a' }}>
          {retirementRow && (
            <span>
              Peak: <span className="font-semibold" style={{ color: '#1a1a1a' }}>{formatCurrency(peakValue, true)}</span>{' '}
              at age {retirementAge}
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 panel-scroll px-5 py-4" style={{ minHeight: 0, background: '#faf9f7' }}>
        <div
          className="rounded-xl border p-5"
          style={{ borderColor: '#e8e6e1', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <div className="mb-1">
            <span className="text-xs font-medium" style={{ color: '#5c5c5c' }}>
              Portfolio Balance by Account Type
            </span>
          </div>
          <p className="text-[11px] mb-4" style={{ color: '#9a9a9a' }}>
            Total balance at each age · retirement year marked in amber
          </p>

          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, bottom: 4, left: 12 }}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 10, fill: '#9a9a9a' }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(data.length / 12)}
              />
              <YAxis
                tickFormatter={fmtY}
                tick={{ fontSize: 10, fill: '#9a9a9a' }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '16px', color: '#5c5c5c' }}
                iconType="square"
              />
              <ReferenceLine
                x={retirementAge}
                stroke="#c9964c"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: 'Retire',
                  position: 'insideTopLeft',
                  fontSize: 10,
                  fill: '#c9964c',
                  dy: -4,
                }}
              />
              <Bar dataKey="RRSP" stackId="portfolio" fill={COLORS.RRSP} radius={[0, 0, 0, 0]} maxBarSize={24} />
              <Bar dataKey="TFSA" stackId="portfolio" fill={COLORS.TFSA} radius={[0, 0, 0, 0]} maxBarSize={24} />
              <Bar dataKey="Non-Reg" stackId="portfolio" fill={COLORS.NonReg} radius={[2, 2, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Disclaimer */}
        <p
          className="text-[10px] leading-relaxed mt-4 px-1"
          style={{ color: '#b0aca6' }}
        >
          Illustrative projection only. This calculator uses simplified growth and drawdown logic. It does not model income taxes, RRIF minimum
          withdrawals, OAS clawback, GIS eligibility, inflation, benefit indexation, or account sequencing. Results are for educational purposes
          and are not personalized financial advice. Consult a qualified financial planner before making decisions.
        </p>
      </div>
    </div>
  )
}
