'use client'

import { useState, useMemo } from 'react'
import type { RetirementInputs } from '@/types/retirement'
import { runProjection } from '@/lib/calculations'
import { formatCurrency } from '@/lib/utils'

interface Props {
  baseInputs: RetirementInputs
}

const SCENARIOS = [
  { label: 'Bear', delta: -3, color: '#dc2626' },
  { label: 'Mild Bear', delta: -1.5, color: '#d97706' },
  { label: 'Base', delta: 0, color: '#2563eb' },
  { label: 'Mild Bull', delta: 1.5, color: '#059669' },
  { label: 'Bull', delta: 3, color: '#047857' },
]

function applyDelta(inputs: RetirementInputs, delta: number): RetirementInputs {
  const a = inputs.assumptions
  return {
    ...inputs,
    assumptions: {
      ...a,
      equityMeanReturn: Math.max(0, a.equityMeanReturn + delta),
      bondMeanReturn: Math.max(0, a.bondMeanReturn + delta * 0.4),
      inflationRate: Math.max(0, a.inflationRate - delta * 0.25),
    },
  }
}

export default function SensitivityPanel({ baseInputs }: Props) {
  const [sliderValue, setSliderValue] = useState(2) // index into SCENARIOS

  const activeScenario = SCENARIOS[sliderValue]

  const results = useMemo(() => {
    return SCENARIOS.map((s) => {
      const adjusted = applyDelta(baseInputs, s.delta)
      const r = runProjection(adjusted)
      return {
        ...s,
        retirementPortfolio: r.retirementPortfolio,
        runway: r.portfolioRunwayYears,
        successRate: r.monteCarlo.successRate,
      }
    })
  }, [baseInputs])

  const active = results[sliderValue]
  const base = results[2]

  const runwayNeeded = baseInputs.person.lifeExpectancy - baseInputs.person.retirementAge

  function diffText(val: number, baseVal: number, prefix = '') {
    const diff = val - baseVal
    if (Math.abs(diff) < 1) return null
    return (
      <span className="text-[11px] ml-1" style={{ color: diff > 0 ? '#059669' : '#dc2626' }}>
        ({diff > 0 ? '+' : ''}{prefix}{diff >= 1000 ? `${(diff / 1000).toFixed(0)}K` : diff.toFixed(0)})
      </span>
    )
  }

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: '#e5e7eb', background: '#fff' }}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>Sensitivity Analysis</h3>
        <p className="text-[12px]" style={{ color: '#6b7280' }}>
          Drag to see how return assumptions impact your plan
        </p>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-1.5 mb-4">
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: activeScenario.color }}
        />
        <div className="flex justify-between">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSliderValue(i)}
              className="text-[11px] font-medium transition-colors"
              style={{ color: i === sliderValue ? s.color : '#9ca3af' }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active scenario assumption deltas */}
      <div
        className="rounded p-2.5 mb-4 text-[11px] flex flex-wrap gap-3"
        style={{ background: '#f6f8fa', border: '1px solid #e5e7eb' }}
      >
        <span className="font-semibold" style={{ color: activeScenario.color }}>{activeScenario.label} Scenario</span>
        <span style={{ color: '#374151' }}>
          Equity return: {(baseInputs.assumptions.equityMeanReturn + activeScenario.delta).toFixed(1)}%
          {activeScenario.delta !== 0 && (
            <span style={{ color: activeScenario.delta > 0 ? '#059669' : '#dc2626' }}>
              {' '}({activeScenario.delta > 0 ? '+' : ''}{activeScenario.delta}%)
            </span>
          )}
        </span>
        <span style={{ color: '#374151' }}>
          Inflation: {Math.max(0, baseInputs.assumptions.inflationRate - activeScenario.delta * 0.25).toFixed(2)}%
        </span>
      </div>

      {/* Metrics table */}
      <div className="overflow-x-auto">
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '80px' }} />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className="text-left text-[10px] font-semibold pb-2 pr-2" style={{ color: '#6b7280' }}>Scenario</th>
              <th className="text-right text-[10px] font-semibold pb-2 pr-2" style={{ color: '#6b7280' }}>Portfolio at Retirement</th>
              <th className="text-right text-[10px] font-semibold pb-2 pr-2" style={{ color: '#6b7280' }}>Runway (yrs)</th>
              <th className="text-right text-[10px] font-semibold pb-2" style={{ color: '#6b7280' }}>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const isActive = i === sliderValue
              const isBase = i === 2
              return (
                <tr
                  key={r.label}
                  onClick={() => setSliderValue(i)}
                  className="cursor-pointer transition-colors"
                  style={{ background: isActive ? '#eff6ff' : 'transparent' }}
                >
                  <td className="py-1.5 pr-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: r.color }}
                    >
                      {r.label}{isBase ? ' ★' : ''}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2 text-right text-xs" style={{ color: '#111827' }}>
                    {formatCurrency(r.retirementPortfolio, true)}
                    {!isBase && diffText(r.retirementPortfolio, base.retirementPortfolio, '$')}
                  </td>
                  <td className="py-1.5 pr-2 text-right text-xs" style={{ color: r.runway >= runwayNeeded ? '#059669' : '#dc2626' }}>
                    {r.runway}
                    {!isBase && diffText(r.runway, base.runway)}
                  </td>
                  <td className="py-1.5 text-right text-xs" style={{ color: r.successRate >= 65 ? '#059669' : '#dc2626' }}>
                    {r.successRate.toFixed(0)}%
                    {!isBase && diffText(r.successRate, base.successRate)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] mt-3" style={{ color: '#9ca3af' }}>
        Bear/Bull scenarios adjust equity return ±3%, bonds ±1.2%, inflation ∓0.75% from base assumptions. Click any row to focus it.
      </p>
    </div>
  )
}
