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
          style={{ background: '#f3f2ef' }}
        >
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-base font-semibold mb-2" style={{ color: '#1a1a1a' }}>No forecast yet</h2>
        <p className="text-xs mb-5 max-w-xs" style={{ color: '#5c5c5c' }}>
          Fill in your profile, then click{' '}
          <span className="font-medium" style={{ color: '#1a1a1a' }}>Run Analysis</span>{' '}
          in the left panel.
        </p>
        <button onClick={onRunSimulation} className="btn-3d btn-primary-3d">
          Run Analysis
        </button>
      </div>
    )
  }

  const runwayNeeded = inputs.person.lifeExpectancy - inputs.person.retirementAge
  const meetsGoal = results.portfolioRunwayYears >= runwayNeeded
  const displayName = inputs.person.name || 'your portfolio'

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Goal banner */}
      <div
        className="mx-4 mt-3 mb-0 px-3 py-2 rounded-lg text-xs font-medium"
        style={{
          background: meetsGoal ? '#e6f5ed' : '#fde8e8',
          border: `1px solid ${meetsGoal ? '#a3d9b8' : '#f4b8b8'}`,
          color: meetsGoal ? '#2d6a4f' : '#b83535',
        }}
      >
        {meetsGoal
          ? `On track — ${displayName}'s portfolio is projected to last ${results.portfolioRunwayYears} years through retirement (${runwayNeeded} years needed).`
          : `At risk — ${displayName}'s portfolio may deplete after ${results.portfolioRunwayYears} years, but ${runwayNeeded} years are needed. Consider increasing contributions or adjusting retirement age.`}
      </div>

      <div className="flex-1 overflow-y-auto panel-scroll px-4 py-3 flex flex-col gap-3"style={{ minHeight: 0 }}>
        <KeyMetrics results={results} inputs={inputs} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PortfolioChart results={results} inputs={inputs} />
          <SensitivityPanel baseInputs={inputs} />
        </div>
      </div>
    </div>
  )
}
