'use client'

import type { RetirementInputs, AssumptionsInputs } from '@/types/retirement'

interface Props {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-blue-700">
          {value.toFixed(step < 1 ? 1 : 0)}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-2 rounded-full bg-gray-200 appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  )
}

function NumberRow({
  label,
  value,
  onChange,
  suffix = '%',
  step = 0.5,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
  step?: number
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500 w-4">{suffix}</span>
      </div>
    </div>
  )
}

export default function AssumptionsTab({ inputs, onChange }: Props) {
  const a = inputs.assumptions
  const update = (patch: Partial<AssumptionsInputs>) =>
    onChange({ ...inputs, assumptions: { ...a, ...patch } })

  const allocationTotal = a.equityPct + a.bondPct + a.cashPct

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Portfolio Allocation</h3>
          <span className={`text-sm font-semibold ${allocationTotal === 100 ? 'text-green-600' : 'text-red-500'}`}>
            {allocationTotal}% total
          </span>
        </div>

        <SliderField
          label="🔵 Equity"
          value={a.equityPct}
          min={0} max={100} step={5} suffix="%"
          onChange={(v) => update({ equityPct: v })}
        />
        <SliderField
          label="🟡 Bonds"
          value={a.bondPct}
          min={0} max={100} step={5} suffix="%"
          onChange={(v) => update({ bondPct: v })}
        />
        <SliderField
          label="⚪ Cash"
          value={a.cashPct}
          min={0} max={100} step={5} suffix="%"
          onChange={(v) => update({ cashPct: v })}
        />

        {allocationTotal !== 100 && (
          <p className="text-xs text-red-500">Allocation must total 100%</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="font-semibold text-gray-800">Return & Inflation Assumptions</h3>
        <NumberRow label="Equity Mean Return" value={a.equityMeanReturn} onChange={(v) => update({ equityMeanReturn: v })} />
        <NumberRow label="Equity Volatility (σ)" value={a.equityVolatility} onChange={(v) => update({ equityVolatility: v })} />
        <NumberRow label="Bond Mean Return" value={a.bondMeanReturn} onChange={(v) => update({ bondMeanReturn: v })} />
        <NumberRow label="Bond Volatility (σ)" value={a.bondVolatility} onChange={(v) => update({ bondVolatility: v })} />
        <NumberRow label="Cash / HISA Return" value={a.cashReturn} onChange={(v) => update({ cashReturn: v })} />
        <div className="border-t border-gray-100 pt-3">
          <NumberRow label="Inflation Rate" value={a.inflationRate} onChange={(v) => update({ inflationRate: v })} />
        </div>
      </div>
    </div>
  )
}
