'use client'

import type { RetirementInputs, IncomeInputs } from '@/types/retirement'

interface Props {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
}

export default function IncomeTab({ inputs, onChange }: Props) {
  const inc = inputs.income
  const update = (patch: Partial<IncomeInputs>) =>
    onChange({ ...inputs, income: { ...inc, ...patch } })

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Employment Income</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Annual Employment Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min={0}
                step={5000}
                value={inc.employmentIncome || ''}
                placeholder="0"
                onChange={(e) => update({ employmentIncome: Math.max(0, +e.target.value) })}
                className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Annual Income</label>
            <p className="text-xs text-gray-400 mb-1">Rental, dividends, side income</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={inc.otherIncome || ''}
                placeholder="0"
                onChange={(e) => update({ otherIncome: Math.max(0, +e.target.value) })}
                className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">CPP — Canada Pension Plan</h3>
        <p className="text-sm text-gray-500">
          CPP is estimated based on your income history and the age you choose to start.
          Taking CPP early (60) reduces your benefit; deferring to 70 increases it by 42%.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPP Start Age</label>
            <select
              value={inc.cppStartAge}
              onChange={(e) => update({ cppStartAge: +e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70].map((age) => (
                <option key={age} value={age}>
                  Age {age}{age === 65 ? ' (standard)' : age < 65 ? ' (reduced)' : ' (enhanced)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of CPP Contributions
            </label>
            <p className="text-xs text-gray-400 mb-1">Years you've contributed to CPP</p>
            <input
              type="number"
              min={0}
              max={45}
              value={inc.cppContributionYears || ''}
              placeholder="35"
              onChange={(e) => update({ cppContributionYears: Math.min(45, Math.max(0, +e.target.value)) })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800 font-medium mb-1">OAS — Old Age Security</p>
        <p className="text-sm text-blue-700">
          OAS is automatically modelled at age 65 (~$700/month in 2026). Clawback applies if
          net income exceeds ~$86,000/year.
        </p>
      </div>
    </div>
  )
}
