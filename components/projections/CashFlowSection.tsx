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

const PORTFOLIO_COLORS = {
  RRSP: '#1a1a1a',
  TFSA: '#5c5c5c',
  'Non-Reg': '#c9964c',
}

const INCOME_COLORS = {
  CPP: '#2563eb',
  OAS: '#059669',
  Pension: '#7c3aed',
  'RRSP Drawdown': '#60a5fa',
  'TFSA Drawdown': '#34d399',
  'Non-Reg Drawdown': '#fbbf24',
}

function PortfolioTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string }>
  label?: number
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value || 0), 0)
  return (
    <div className="rounded-lg p-3 text-xs shadow-lg" style={{ background: '#fff', border: '1px solid #e8e6e1', minWidth: 170 }}>
      <p className="font-semibold mb-2" style={{ color: '#1a1a1a' }}>Age {label} — Portfolio</p>
      {payload.map((p) => p.value > 0 && (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: p.fill }} />
            <span style={{ color: '#5c5c5c' }}>{p.name}</span>
          </div>
          <span className="font-medium" style={{ color: '#1a1a1a' }}>{formatCurrency(p.value, true)}</span>
        </div>
      ))}
      <div className="flex justify-between font-semibold mt-2 pt-2" style={{ borderTop: '1px solid #e8e6e1', color: '#1a1a1a' }}>
        <span>Total</span>
        <span>{formatCurrency(total, true)}</span>
      </div>
    </div>
  )
}

function IncomeTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; fill: string }>
  label?: number
}) {
  if (!active || !payload?.length) return null
  const income = payload.filter(p => ['CPP', 'OAS', 'Pension'].includes(p.name)).reduce((s, p) => s + (p.value || 0), 0)
  const drawdown = payload.filter(p => p.name.includes('Drawdown')).reduce((s, p) => s + (p.value || 0), 0)
  return (
    <div className="rounded-lg p-3 text-xs shadow-lg" style={{ background: '#fff', border: '1px solid #e8e6e1', minWidth: 190 }}>
      <p className="font-semibold mb-2" style={{ color: '#1a1a1a' }}>Age {label} — Annual Income</p>
      {payload.map((p) => p.value > 0 && (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: p.fill }} />
            <span style={{ color: '#5c5c5c' }}>{p.name}</span>
          </div>
          <span className="font-medium" style={{ color: '#1a1a1a' }}>{formatCurrency(p.value, true)}</span>
        </div>
      ))}
      {income > 0 && (
        <div className="flex justify-between mt-1 pt-1.5" style={{ borderTop: '1px solid #e8e6e1', color: '#2563eb' }}>
          <span className="text-[10px]">Govt. income</span>
          <span className="font-medium">{formatCurrency(income, true)}</span>
        </div>
      )}
      {drawdown > 0 && (
        <div className="flex justify-between" style={{ color: '#c9964c' }}>
          <span className="text-[10px]">Portfolio drawdown</span>
          <span className="font-medium">{formatCurrency(drawdown, true)}</span>
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: '#e8e6e1', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <p className="text-xs font-semibold" style={{ color: '#1a1a1a' }}>{title}</p>
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
  const retirementAge = inputs.person.retirementAge

  // Portfolio balance data — all years
  const portfolioData = yearly.map((r) => ({
    age: r.age,
    RRSP: Math.round(r.rrspBalance),
    TFSA: Math.round(r.tfsaBalance),
    'Non-Reg': Math.round(r.nonRegBalance),
  }))

  // Income breakdown data — retirement years only
  const incomeData = yearly
    .filter((r) => r.phase === 'retirement')
    .map((r) => ({
      age: r.age,
      CPP: Math.round(r.cppIncome),
      OAS: Math.round(r.oasIncome),
      Pension: Math.round(r.pensionIncome),
      'RRSP Drawdown': Math.round(r.rrspWithdrawal),
      'TFSA Drawdown': Math.round(r.tfsaWithdrawal),
      'Non-Reg Drawdown': Math.round(r.nonRegWithdrawal),
    }))

  const peakPortfolio = Math.max(...yearly.map((r) => r.totalPortfolio))

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b" style={{ borderColor: '#e8e6e1', background: '#ffffff' }}>
        <div>
          <h2 className="text-sm font-semibold font-serif" style={{ color: '#1a1a1a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Cash Flow
          </h2>
          <p className="text-[11px]" style={{ color: '#9a9a9a' }}>
            Portfolio trajectory + income & drawdown breakdown during retirement
          </p>
        </div>
        <span className="text-[11px]" style={{ color: '#9a9a9a' }}>
          Peak: <span className="font-semibold" style={{ color: '#1a1a1a' }}>{formatCurrency(peakPortfolio, true)}</span>
        </span>
      </div>

      {/* Charts */}
      <div className="flex-1 panel-scroll px-5 py-4 flex flex-col gap-4" style={{ minHeight: 0, background: '#faf9f7' }}>
        {/* Chart 1: Portfolio balance over full lifetime */}
        <ChartCard
          title="Portfolio Balance Over Time"
          subtitle="Total balance by account type at each age — grows during accumulation, draws down in retirement"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={portfolioData} margin={{ top: 4, right: 8, bottom: 4, left: 12 }} barCategoryGap="12%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} interval={Math.floor(portfolioData.length / 12)} />
              <YAxis tickFormatter={fmtY} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} width={52} />
              <Tooltip content={<PortfolioTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '14px', color: '#5c5c5c' }} iconType="square" />
              <ReferenceLine x={retirementAge} stroke="#c9964c" strokeDasharray="4 4" strokeWidth={2}
                label={{ value: 'Retire', position: 'insideTopLeft', fontSize: 9, fill: '#c9964c', dy: -4 }} />
              <Bar dataKey="RRSP" stackId="p" fill={PORTFOLIO_COLORS.RRSP} maxBarSize={20} />
              <Bar dataKey="TFSA" stackId="p" fill={PORTFOLIO_COLORS.TFSA} maxBarSize={20} />
              <Bar dataKey="Non-Reg" stackId="p" fill={PORTFOLIO_COLORS['Non-Reg']} radius={[2, 2, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Annual income breakdown during retirement */}
        {incomeData.length > 0 && (
          <ChartCard
            title="Retirement Income & Drawdown Breakdown"
            subtitle="Annual income by source (CPP, OAS, pension) + portfolio withdrawals each year in retirement"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={incomeData} margin={{ top: 4, right: 8, bottom: 4, left: 12 }} barCategoryGap="12%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
                <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} interval={Math.floor(incomeData.length / 10)} />
                <YAxis tickFormatter={fmtY} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} width={52} />
                <Tooltip content={<IncomeTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '14px', color: '#5c5c5c' }} iconType="square" />
                <Bar dataKey="CPP" stackId="i" fill={INCOME_COLORS.CPP} maxBarSize={20} />
                <Bar dataKey="OAS" stackId="i" fill={INCOME_COLORS.OAS} maxBarSize={20} />
                <Bar dataKey="Pension" stackId="i" fill={INCOME_COLORS.Pension} maxBarSize={20} />
                <Bar dataKey="RRSP Drawdown" stackId="i" fill={INCOME_COLORS['RRSP Drawdown']} maxBarSize={20} />
                <Bar dataKey="TFSA Drawdown" stackId="i" fill={INCOME_COLORS['TFSA Drawdown']} maxBarSize={20} />
                <Bar dataKey="Non-Reg Drawdown" stackId="i" fill={INCOME_COLORS['Non-Reg Drawdown']} radius={[2, 2, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>

            {/* Colour key summary */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 pt-3" style={{ borderTop: '1px solid #f0ede8' }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9a9a9a', width: '100%' }}>Government income</span>
              {(['CPP', 'OAS', 'Pension'] as const).map((k) => (
                <div key={k} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: INCOME_COLORS[k] }} />
                  <span className="text-[10px]" style={{ color: '#5c5c5c' }}>{k}</span>
                </div>
              ))}
              <span className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: '#9a9a9a', width: '100%' }}>Portfolio drawdown</span>
              {(['RRSP Drawdown', 'TFSA Drawdown', 'Non-Reg Drawdown'] as const).map((k) => (
                <div key={k} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: INCOME_COLORS[k] }} />
                  <span className="text-[10px]" style={{ color: '#5c5c5c' }}>{k}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] leading-relaxed px-1" style={{ color: '#b0aca6' }}>
          Illustrative projection only. This calculator uses simplified growth and drawdown logic. It does not model income taxes, RRIF minimum
          withdrawals, OAS clawback, GIS eligibility, inflation, benefit indexation, or account sequencing. Results are for educational purposes
          and are not personalized financial advice. Consult a qualified financial planner before making decisions.
        </p>
      </div>
    </div>
  )
}
