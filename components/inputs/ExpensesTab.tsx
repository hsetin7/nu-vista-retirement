'use client'

import type { RetirementInputs, ExpenseCategory } from '@/types/retirement'

interface Props {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
}

export default function ExpensesTab({ inputs, onChange }: Props) {
  const cats = inputs.expenses.categories

  const updateCategory = (index: number, patch: Partial<ExpenseCategory>) => {
    const updated = cats.map((c, i) => (i === index ? { ...c, ...patch } : c))
    onChange({ ...inputs, expenses: { categories: updated } })
  }

  const copyCurrentToRetirement = () => {
    const updated = cats.map((c) => ({ ...c, retirement: c.current }))
    onChange({ ...inputs, expenses: { categories: updated } })
  }

  const totalCurrent = cats.reduce((sum, c) => sum + c.current, 0)
  const totalRetirement = cats.reduce((sum, c) => sum + c.retirement, 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Annual Spending by Category</h3>
          <button
            onClick={copyCurrentToRetirement}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Copy current → retirement
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-right px-5 py-3 font-medium">Current Annual</th>
              <th className="text-right px-5 py-3 font-medium">Retirement Annual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cats.map((cat, i) => (
              <tr key={cat.label} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-700 font-medium">{cat.label}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <div className="relative w-36">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={cat.current || ''}
                        placeholder="0"
                        onChange={(e) => updateCategory(i, { current: Math.max(0, +e.target.value) })}
                        className="w-full rounded-md border border-gray-300 pl-6 pr-2 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <div className="relative w-36">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={cat.retirement || ''}
                        placeholder="0"
                        onChange={(e) => updateCategory(i, { retirement: Math.max(0, +e.target.value) })}
                        className="w-full rounded-md border border-gray-300 pl-6 pr-2 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold text-gray-800">
              <td className="px-5 py-3">Total</td>
              <td className="px-5 py-3 text-right">
                ${totalCurrent.toLocaleString('en-CA')}
              </td>
              <td className="px-5 py-3 text-right">
                ${totalRetirement.toLocaleString('en-CA')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
