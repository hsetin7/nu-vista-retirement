'use client'

import type { ProjectionResults, RetirementInputs } from '@/types/retirement'
import { CURRENT_YEAR } from '@/lib/utils'
import KeyMetrics from './KeyMetrics'
import PortfolioChart from './PortfolioChart'
import IncomeChart from './IncomeChart'
import MonteCarloChart from './MonteCarloChart'

interface Props {
  results: ProjectionResults | null
  inputs: RetirementInputs
  onRunSimulation: () => void
}

export default function ProjectionsSection({ results, inputs, onRunSimulation }: Props) {
  const currentAge = CURRENT_YEAR - inputs.person1.birthYear

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📊</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">No projections yet</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          Fill in your inputs on the Inputs tab, then click{' '}
          <span className="font-medium text-blue-600">Run Simulation</span> to see your
          personalized retirement projection.
        </p>
        <button
          onClick={onRunSimulation}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors"
        >
          Run Simulation
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-0 shrink-0">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Projections</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        <KeyMetrics results={results} />
        <PortfolioChart yearly={results.yearly} retirementAge={inputs.person1.retirementAge} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <IncomeChart yearly={results.yearly} retirementAge={inputs.person1.retirementAge} />
          <MonteCarloChart
            monteCarlo={results.monteCarlo}
            retirementAge={inputs.person1.retirementAge}
            currentAge={currentAge}
          />
        </div>
      </div>
    </div>
  )
}
