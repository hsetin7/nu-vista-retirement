'use client'

import type { ProjectionResults, RetirementInputs } from '@/types/retirement'
import KeyMetrics from './KeyMetrics'
import PortfolioChart from './PortfolioChart'
import SensitivityPanel from './SensitivityPanel'

interface Props {
  results: ProjectionResults | null
  inputs: RetirementInputs
  onRunSimulation: () => void
}

export default function ProjectionsSection({ results, inputs, onRunSimulation }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: '#eff6ff' }}
        >
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-base font-semibold mb-2" style={{ color: '#111827' }}>No projections yet</h2>
        <p className="text-xs mb-5 max-w-xs" style={{ color: '#6b7280' }}>
          Fill in your profile on the Inputs tab, then click{' '}
          <span className="font-medium" style={{ color: '#2563eb' }}>Run Simulation</span>.
        </p>
        <button
          onClick={onRunSimulation}
          className="px-4 py-2 text-white text-xs font-semibold rounded transition-colors hover:opacity-90"
          style={{ background: '#2563eb' }}
        >
          Run Simulation
        </button>
      </div>
    )
  }

  const runwayNeeded = inputs.person.lifeExpectancy - inputs.person.retirementAge
  const meetsGoal = results.portfolioRunwayYears >= runwayNeeded

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Goal banner */}
      <div
        className="mx-4 mt-3 mb-0 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
        style={{
          background: meetsGoal ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${meetsGoal ? '#bbf7d0' : '#fecaca'}`,
          color: meetsGoal ? '#059669' : '#dc2626',
        }}
      >
        <span>{meetsGoal ? '✓' : '✗'}</span>
        {meetsGoal
          ? `On track — portfolio projected to last ${results.portfolioRunwayYears} years through retirement (${runwayNeeded} years needed).`
          : `At risk — portfolio may deplete after ${results.portfolioRunwayYears} years, but you need ${runwayNeeded} years. Consider increasing contributions or adjusting retirement age.`}
      </div>

      <div className="flex-1 overflow-y-auto panel-scroll px-4 py-3 flex flex-col gap-3" style={{ minHeight: 0 }}>
        <KeyMetrics results={results} inputs={inputs} />
        <div className="grid grid-cols-2 gap-3">
          <PortfolioChart results={results} inputs={inputs} />
          <SensitivityPanel baseInputs={inputs} />
        </div>
      </div>
    </div>
  )
}
