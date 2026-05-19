'use client'

import type { RetirementInputs, AssumptionsInputs } from '@/types/retirement'

interface Props {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  color,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  color?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] w-28 shrink-0 font-medium" style={{ color: '#374151' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="flex-1 h-1"
        style={{ accentColor: color || '#2563eb' }}
      />
      <span className="text-[13px] font-semibold w-14 text-right" style={{ color: color || '#2563eb' }}>
        {value.toFixed(1)}{suffix}
      </span>
    </div>
  )
}

function NumRow({
  label,
  value,
  onChange,
  step = 0.5,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px]" style={{ color: '#374151' }}>{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="w-16 rounded border text-xs py-1 px-2 text-right outline-none focus:ring-1 focus:ring-blue-500"
          style={{ borderColor: '#e5e7eb', background: '#fff', color: '#111827' }}
        />
        <span className="text-xs w-3" style={{ color: '#6b7280' }}>%</span>
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-3"
      style={{ borderColor: '#e5e7eb', background: '#fff' }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function InvestmentAssumptionsTab({ inputs, onChange }: Props) {
  const a = inputs.assumptions
  const update = (patch: Partial<AssumptionsInputs>) =>
    onChange({ ...inputs, assumptions: { ...a, ...patch } })

  const total = a.equityPct + a.bondPct + a.cashPct

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"style={{ minHeight: 0 }}>
      {/* LEFT: Asset Allocation */}
      <SectionCard title="Portfolio Asset Allocation">
        <div className="flex flex-col gap-4">
          <SliderRow
            label="Equity"
            value={a.equityPct}
            min={0} max={100} step={5} suffix="%"
            color="#1a1a1a"
            onChange={(v) => update({ equityPct: v })}
          />
          <SliderRow
            label="Bonds"
            value={a.bondPct}
            min={0} max={100} step={5} suffix="%"
            color="#5c5c5c"
            onChange={(v) => update({ bondPct: v })}
          />
          <SliderRow
            label="Cash / HISA"
            value={a.cashPct}
            min={0} max={100} step={5} suffix="%"
            color="#c9964c"
            onChange={(v) => update({ cashPct: v })}
          />

          {/* Allocation bar */}
          <div className="h-3 rounded-full overflow-hidden flex">
            <div style={{ width: `${a.equityPct}%`, background: '#1a1a1a' }} />
            <div style={{ width: `${a.bondPct}%`, background: '#5c5c5c' }} />
            <div style={{ width: `${a.cashPct}%`, background: '#c9964c' }} />
          </div>

          <div
            className={`text-xs font-semibold text-center py-1 rounded ${total === 100 ? '' : ''}`}
            style={{
              background: total === 100 ? '#f0fdf4' : '#fef2f2',
              color: total === 100 ? '#059669' : '#dc2626',
              border: `1px solid ${total === 100 ? '#bbf7d0' : '#fecaca'}`,
            }}
          >
            {total === 100 ? '✓ Allocation sums to 100%' : `⚠ Total is ${total}% — must equal 100%`}
          </div>

          <div className="flex justify-between text-[10px]" style={{ color: '#9ca3af' }}>
            <span>Equity: {a.equityPct}%</span>
            <span>Bonds: {a.bondPct}%</span>
            <span>Cash: {a.cashPct}%</span>
          </div>
        </div>
      </SectionCard>

      {/* RIGHT: Return & Inflation */}
      <SectionCard title="Return & Inflation Assumptions">
        <div className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#9ca3af' }}>
            Equity
          </div>
          <NumRow label="Mean Annual Return" value={a.equityMeanReturn} onChange={(v) => update({ equityMeanReturn: v })} />
          <NumRow label="Volatility (σ)" value={a.equityVolatility} onChange={(v) => update({ equityVolatility: v })} />

          <div className="border-t pt-2" style={{ borderColor: '#f3f4f6' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#9ca3af' }}>
              Fixed Income
            </div>
            <NumRow label="Bond Mean Return" value={a.bondMeanReturn} onChange={(v) => update({ bondMeanReturn: v })} />
            <div className="mt-2">
              <NumRow label="Bond Volatility (σ)" value={a.bondVolatility} onChange={(v) => update({ bondVolatility: v })} />
            </div>
          </div>

          <div className="border-t pt-2" style={{ borderColor: '#f3f4f6' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: '#9ca3af' }}>
              Other
            </div>
            <NumRow label="Cash / HISA Return" value={a.cashReturn} onChange={(v) => update({ cashReturn: v })} />
            <div className="mt-2">
              <NumRow label="Inflation Rate" value={a.inflationRate} onChange={(v) => update({ inflationRate: v })} />
            </div>
          </div>

          <p className="text-[11px] leading-relaxed mt-1" style={{ color: '#9ca3af' }}>
            Blended return = weighted average of all asset class returns. Volatility drives Monte Carlo simulation spread.
          </p>
        </div>
      </SectionCard>
    </div>
  )
}
