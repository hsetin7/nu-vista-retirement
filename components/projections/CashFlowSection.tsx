'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BalanceTooltip({ active, payload, label, phase }: any) {
  if (!active || !payload?.length) return null
  const total = [...payload].reduce((s: number, p: { value?: number }) => s + (p.value || 0), 0)
  return (
    <div className="rounded-lg p-3 text-xs shadow-lg" style={{ background: '#fff', border: '1px solid #e8e6e1', minWidth: 175 }}>
      <p className="font-semibold mb-2" style={{ color: '#1a1a1a' }}>
        Age {label} — {phase === 'accum' ? 'Balance' : 'Remaining Portfolio'}
      </p>
      {[...payload].reverse().map((p: { name: string; value?: number; fill?: string; stroke?: string }) => (p.value || 0) > 0 && (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: p.fill || p.stroke }} />
            <span style={{ color: '#5c5c5c' }}>{p.name}</span>
          </div>
          <span className="font-medium" style={{ color: '#1a1a1a' }}>{formatCurrency(p.value || 0, true)}</span>
        </div>
      ))}
      <div className="flex justify-between font-semibold mt-2 pt-2" style={{ borderTop: '1px solid #e8e6e1', color: '#1a1a1a' }}>
        <span>Total</span>
        <span>{formatCurrency(total, true)}</span>
      </div>
    </div>
  )
}

const INCOME_COLORS = {
  CPP: '#2563eb',
  OAS: '#059669',
  Pension: '#7c3aed',
  'RRSP Draw': '#60a5fa',
  'TFSA Draw': '#34d399',
  'Non-Reg Draw': '#fbbf24',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function IncomeTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const govt = (payload as { name: string; value?: number; fill?: string }[])
    .filter(p => ['CPP', 'OAS', 'Pension'].includes(p.name))
    .reduce((s, p) => s + (p.value || 0), 0)
  const draw = (payload as { name: string; value?: number; fill?: string }[])
    .filter(p => p.name.includes('Draw'))
    .reduce((s, p) => s + (p.value || 0), 0)
  return (
    <div className="rounded-lg p-3 text-xs shadow-lg" style={{ background: '#fff', border: '1px solid #e8e6e1', minWidth: 200 }}>
      <p className="font-semibold mb-2" style={{ color: '#1a1a1a' }}>Age {label} — Annual Income</p>
      {(payload as { name: string; value?: number; fill?: string }[]).map(p => (p.value || 0) > 0 && (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: p.fill }} />
            <span style={{ color: '#5c5c5c' }}>{p.name}</span>
          </div>
          <span className="font-medium" style={{ color: '#1a1a1a' }}>{formatCurrency(p.value || 0, true)}</span>
        </div>
      ))}
      {govt > 0 && (
        <div className="flex justify-between mt-1.5 pt-1.5" style={{ borderTop: '1px solid #f0ede8', color: '#2563eb' }}>
          <span className="text-[10px]">Govt. income</span>
          <span className="font-medium">{formatCurrency(govt, true)}</span>
        </div>
      )}
      {draw > 0 && (
        <div className="flex justify-between" style={{ color: '#c9964c' }}>
          <span className="text-[10px]">Portfolio drawdown</span>
          <span className="font-medium">{formatCurrency(draw, true)}</span>
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: '#e8e6e1', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <p className="text-xs font-semibold mb-0.5" style={{ color: '#1a1a1a' }}>{title}</p>
      {subtitle && <p className="text-[11px] mb-4" style={{ color: '#9a9a9a' }}>{subtitle}</p>}
      {children}
    </div>
  )
}

export default function CashFlowSection({ results, inputs, onRunSimulation }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#f3f2ef' }}>
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
  const { retirementAge, currentAge, lifeExpectancy } = inputs.person

  // Accumulation: current age → retirement (include retirement age row for continuity)
  const accumData = yearly
    .filter(r => r.phase === 'accumulation' || r.age === retirementAge)
    .map(r => ({
      age: r.age,
      RRSP: Math.round(r.rrspBalance),
      TFSA: Math.round(r.tfsaBalance),
      'Non-Reg': Math.round(r.nonRegBalance),
    }))

  // Distribution: retirement age → life expectancy
  const distData = yearly
    .filter(r => r.phase === 'retirement')
    .map(r => ({
      age: r.age,
      RRSP: Math.round(r.rrspBalance),
      TFSA: Math.round(r.tfsaBalance),
      'Non-Reg': Math.round(r.nonRegBalance),
      CPP: Math.round(r.cppIncome),
      OAS: Math.round(r.oasIncome),
      Pension: Math.round(r.pensionIncome),
      'RRSP Draw': Math.round(r.rrspWithdrawal),
      'TFSA Draw': Math.round(r.tfsaWithdrawal),
      'Non-Reg Draw': Math.round(r.nonRegWithdrawal),
    }))

  const accumXInterval = Math.max(1, Math.floor(accumData.length / 10))
  const distXInterval = Math.max(1, Math.floor(distData.length / 10))

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b" style={{ borderColor: '#e8e6e1', background: '#ffffff' }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: '#1a1a1a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Cash Flow
          </h2>
          <p className="text-[11px]" style={{ color: '#9a9a9a' }}>
            Accumulation (age {currentAge}–{retirementAge}) · Distribution (age {retirementAge}–{lifeExpectancy})
          </p>
        </div>
        <span className="text-[11px]" style={{ color: '#9a9a9a' }}>
          At retirement: <span className="font-semibold" style={{ color: '#1a1a1a' }}>{formatCurrency(results.retirementPortfolio, true)}</span>
        </span>
      </div>

      <div className="flex-1 panel-scroll px-5 py-4 flex flex-col gap-4" style={{ minHeight: 0, background: '#faf9f7' }}>

        {/* ── CHART 1: Accumulation ── */}
        {accumData.length > 1 && (
          <ChartCard
            title="Accumulation Phase"
            subtitle={`Portfolio growth — age ${currentAge} to retirement at ${retirementAge}`}
          >
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={accumData} margin={{ top: 4, right: 8, bottom: 4, left: 12 }}>
                <defs>
                  <linearGradient id="g-rrsp-a" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="g-tfsa-a" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5c5c5c" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#5c5c5c" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="g-nr-a" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9964c" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#c9964c" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
                <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} interval={accumXInterval} />
                <YAxis tickFormatter={fmtY} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} width={52} />
                <Tooltip content={<BalanceTooltip phase="accum" />} cursor={{ stroke: '#e8e6e1', strokeWidth: 1 }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#5c5c5c' }} iconType="square" />
                <Area type="monotone" dataKey="RRSP" stackId="a" fill="url(#g-rrsp-a)" stroke="#1a1a1a" strokeWidth={1.5} />
                <Area type="monotone" dataKey="TFSA" stackId="a" fill="url(#g-tfsa-a)" stroke="#5c5c5c" strokeWidth={1.5} />
                <Area type="monotone" dataKey="Non-Reg" stackId="a" fill="url(#g-nr-a)" stroke="#c9964c" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* ── CHART 2: Distribution ── */}
        {distData.length > 0 && (
          <ChartCard
            title="Distribution Phase"
            subtitle={`Remaining portfolio balance (top) + annual income & drawdown by source (bottom) — age ${retirementAge} to ${lifeExpectancy}`}
          >
            {/* 2a: Portfolio balance during retirement */}
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={distData} margin={{ top: 4, right: 8, bottom: 0, left: 12 }}>
                <defs>
                  <linearGradient id="g-rrsp-d" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0.15} />
                  </linearGradient>
                  <linearGradient id="g-tfsa-d" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5c5c5c" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#5c5c5c" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="g-nr-d" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9964c" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#c9964c" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
                <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} interval={distXInterval} />
                <YAxis tickFormatter={fmtY} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} width={52} />
                <Tooltip content={<BalanceTooltip phase="dist" />} cursor={{ stroke: '#e8e6e1', strokeWidth: 1 }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#5c5c5c' }} iconType="square" />
                <Area type="monotone" dataKey="RRSP" stackId="d" fill="url(#g-rrsp-d)" stroke="#1a1a1a" strokeWidth={1.5} />
                <Area type="monotone" dataKey="TFSA" stackId="d" fill="url(#g-tfsa-d)" stroke="#5c5c5c" strokeWidth={1.5} />
                <Area type="monotone" dataKey="Non-Reg" stackId="d" fill="url(#g-nr-d)" stroke="#c9964c" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>

            {/* 2b: Annual income breakdown */}
            <div className="mt-3 pt-4" style={{ borderTop: '1px solid #f0ede8' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#9a9a9a' }}>
                Annual Income by Source
              </p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={distData} margin={{ top: 0, right: 8, bottom: 4, left: 12 }} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
                  <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} interval={distXInterval} />
                  <YAxis tickFormatter={fmtY} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip content={<IncomeTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#5c5c5c' }} iconType="square" />
                  <Bar dataKey="CPP" stackId="i" fill={INCOME_COLORS.CPP} maxBarSize={22} />
                  <Bar dataKey="OAS" stackId="i" fill={INCOME_COLORS.OAS} maxBarSize={22} />
                  <Bar dataKey="Pension" stackId="i" fill={INCOME_COLORS.Pension} maxBarSize={22} />
                  <Bar dataKey="RRSP Draw" stackId="i" fill={INCOME_COLORS['RRSP Draw']} maxBarSize={22} />
                  <Bar dataKey="TFSA Draw" stackId="i" fill={INCOME_COLORS['TFSA Draw']} maxBarSize={22} />
                  <Bar dataKey="Non-Reg Draw" stackId="i" fill={INCOME_COLORS['Non-Reg Draw']} radius={[2, 2, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>

              {/* colour key */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 pt-3" style={{ borderTop: '1px solid #f0ede8' }}>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9a9a9a', width: '100%' }}>Government income</span>
                {(['CPP', 'OAS', 'Pension'] as const).map(k => (
                  <div key={k} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: INCOME_COLORS[k] }} />
                    <span className="text-[10px]" style={{ color: '#5c5c5c' }}>{k}</span>
                  </div>
                ))}
                <span className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: '#9a9a9a', width: '100%' }}>Portfolio drawdown</span>
                {(['RRSP Draw', 'TFSA Draw', 'Non-Reg Draw'] as const).map(k => (
                  <div key={k} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: INCOME_COLORS[k] }} />
                    <span className="text-[10px]" style={{ color: '#5c5c5c' }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        )}

        <p className="text-[10px] leading-relaxed px-1" style={{ color: '#b0aca6' }}>
          Illustrative projection only. This calculator uses simplified growth and drawdown logic. It does not model income taxes, RRIF minimum
          withdrawals, OAS clawback, GIS eligibility, inflation, benefit indexation, or account sequencing. Results are for educational purposes
          and are not personalized financial advice. Consult a qualified financial planner before making decisions.
        </p>
      </div>
    </div>
  )
}
