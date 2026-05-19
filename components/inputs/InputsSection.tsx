'use client'

import { cn } from '@/lib/utils'
import type { RetirementInputs, ActiveInputTab } from '@/types/retirement'
import UserProfileTab from './UserProfileTab'
import InvestmentAssumptionsTab from './InvestmentAssumptionsTab'

interface InputsSectionProps {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
  activeTab: ActiveInputTab
  onTabChange: (tab: ActiveInputTab) => void
}

const TABS: { id: ActiveInputTab; label: string }[] = [
  { id: 'profile', label: 'User Profile' },
  { id: 'assumptions', label: 'Investments & Assumptions' },
]

export default function InputsSection({ inputs, onChange, activeTab, onTabChange }: InputsSectionProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="px-5 pt-4 pb-0 shrink-0 border-b" style={{ borderColor: '#e5e7eb', background: '#f6f8fa' }}>
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300'
              )}
              style={activeTab !== tab.id ? { color: '#6b7280' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto md:overflow-hidden p-4" style={{ background: '#f6f8fa', minHeight: 0 }}>
        {activeTab === 'profile' && (
          <UserProfileTab inputs={inputs} onChange={onChange} />
        )}
        {activeTab === 'assumptions' && (
          <InvestmentAssumptionsTab inputs={inputs} onChange={onChange} />
        )}
      </div>
    </div>
  )
}
