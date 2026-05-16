'use client'

import type { ProjectionResults, RetirementInputs } from '@/types/retirement'
import { formatCurrency, formatPct, CURRENT_YEAR } from '@/lib/utils'

interface Props {
  results: ProjectionResults | null
  inputs: RetirementInputs
  onRunSimulation: () => void
}

export default function ReportSection({ results, inputs, onRunSimulation }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📄</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Report not generated yet</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          Run a simulation first to generate your personalized retirement report.
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

  const { person1, savings, income, assumptions } = inputs
  const currentAge = CURRENT_YEAR - person1.birthYear
  const retirementYear = CURRENT_YEAR + (person1.retirementAge - currentAge)
  const planName = person1.name ? `${person1.name}'s` : 'Your'

  const totalAnnualExpenses = inputs.expenses.categories.reduce((s, c) => s + c.retirement, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="bg-[#111827] text-white px-8 py-10 shrink-0">
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
          Nu Vista Analytics · Retirement Report
        </p>
        <h1 className="text-3xl font-bold leading-tight mb-2">Plan with clarity.</h1>
        <h1 className="text-3xl font-bold leading-tight text-blue-400 mb-6">Retire with confidence.</h1>
        <p className="text-gray-400 text-sm max-w-lg">
          {planName} illustrative retirement projection based on inputs provided. This is not financial
          advice. Generated {new Date().toLocaleDateString('en-CA')}.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Key Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 text-lg mb-4">Retirement Snapshot</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Retirement Year</p>
              <p className="text-xl font-bold text-gray-900">{retirementYear}</p>
              <p className="text-xs text-gray-400">Age {person1.retirementAge}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Portfolio at Retirement</p>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(results.retirementPortfolio, true)}
              </p>
              <p className="text-xs text-gray-400">RRSP + TFSA + Non-Reg</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Success Rate</p>
              <p
                className={`text-xl font-bold ${
                  results.monteCarlo.successRate >= 85
                    ? 'text-green-600'
                    : results.monteCarlo.successRate >= 65
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {results.monteCarlo.successRate.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400">Monte Carlo (1,000 runs)</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly CPP</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(results.cppMonthly)}</p>
              <p className="text-xs text-gray-400">Starts age {income.cppStartAge}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly OAS</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(results.oasMonthly)}</p>
              <p className="text-xs text-gray-400">Starts age 65</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg. Effective Tax</p>
              <p className="text-xl font-bold text-gray-900">
                {formatPct(results.effectiveTaxRate * 100)}
              </p>
              <p className="text-xs text-gray-400">In retirement (ON)</p>
            </div>
          </div>
        </div>

        {/* Key Figures & Assumptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 text-lg mb-4">Key Figures & Assumptions</h2>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">Current Age</span>
              <span className="font-medium text-gray-800">{currentAge}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">Retirement Age</span>
              <span className="font-medium text-gray-800">{person1.retirementAge}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">RRSP Balance</span>
              <span className="font-medium text-gray-800">{formatCurrency(savings.rrspBalance)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">TFSA Balance</span>
              <span className="font-medium text-gray-800">{formatCurrency(savings.tfsaBalance)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">Expected Return</span>
              <span className="font-medium text-gray-800">
                {formatPct(
                  (assumptions.equityPct / 100) * assumptions.equityMeanReturn +
                    (assumptions.bondPct / 100) * assumptions.bondMeanReturn +
                    (assumptions.cashPct / 100) * assumptions.cashReturn
                )}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">Inflation Rate</span>
              <span className="font-medium text-gray-800">{formatPct(assumptions.inflationRate)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">Annual Retirement Expenses</span>
              <span className="font-medium text-gray-800">{formatCurrency(totalAnnualExpenses)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">Life Expectancy</span>
              <span className="font-medium text-gray-800">Age {person1.lifeExpectancy}</span>
            </div>
          </div>
        </div>

        {/* RRSP Melt-Down Strategy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 text-lg mb-2">RRSP Melt-Down Strategy</h2>
          <p className="text-sm text-gray-500 mb-4">
            Strategic RRSP withdrawals before age 71 (RRIF conversion) can reduce lifetime tax.
          </p>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Withdraw RRSP in lower-income years</p>
                <p className="text-xs text-gray-500">
                  If you retire before CPP/OAS starts, your income drops — ideal time to withdraw
                  RRSP at a lower marginal rate (e.g., filling the 20.5% federal bracket).
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Use TFSA to supplement tax-free</p>
                <p className="text-xs text-gray-500">
                  TFSA withdrawals don't increase taxable income, so they won't trigger OAS
                  clawback. Prioritize TFSA after RRSP is reduced.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">3</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Protect OAS — watch the clawback threshold</p>
                <p className="text-xs text-gray-500">
                  OAS clawback starts at ~$86,912 net income (2026). Keep total retirement income
                  below this by blending RRSP and TFSA withdrawals strategically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Built by{' '}
            <span className="font-semibold text-gray-600">Nu Vista Analytics</span> ·
            Illustrative projections only · Not financial advice
          </p>
        </div>
      </div>
    </div>
  )
}
