'use client'

import { cn } from '@/lib/utils'
import type { RetirementInputs, ActiveInputTab } from '@/types/retirement'
import PeopleTab from './PeopleTab'
import SavingsTab from './SavingsTab'
import IncomeTab from './IncomeTab'
import ExpensesTab from './ExpensesTab'
import AssumptionsTab from './AssumptionsTab'

interface InputsSectionProps {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
  activeTab: ActiveInputTab
  onTabChange: (tab: ActiveInputTab) => void
}

const TABS: { id: ActiveInputTab; label: string }[] = [
  { id: 'people', label: 'People & Timeline' },
  { id: 'savings', label: 'Savings' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'assumptions', label: 'Assumptions' },
]

export default function InputsSection({ inputs, onChange, activeTab, onTabChange }: InputsSectionProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-0 shrink-0">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Inputs</h1>
        <div className="flex gap-0 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === 'people' && <PeopleTab inputs={inputs} onChange={onChange} />}
        {activeTab === 'savings' && <SavingsTab inputs={inputs} onChange={onChange} />}
        {activeTab === 'income' && <IncomeTab inputs={inputs} onChange={onChange} />}
        {activeTab === 'expenses' && <ExpensesTab inputs={inputs} onChange={onChange} />}
        {activeTab === 'assumptions' && <AssumptionsTab inputs={inputs} onChange={onChange} />}
      </div>
    </div>
  )
}
