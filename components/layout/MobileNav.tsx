'use client'

import { CircleUser, TrendingUp, Wallet, Clock, Play } from 'lucide-react'
import type { ActiveSection } from '@/types/retirement'

interface Props {
  activeSection: ActiveSection
  onNavigate: (s: ActiveSection) => void
  onRunAnalysis: () => void
  isRunning: boolean
}

const LEFT_ITEMS: { id: ActiveSection; label: string; Icon: React.ElementType }[] = [
  { id: 'inputs',      label: 'Profile',   Icon: CircleUser },
  { id: 'projections', label: 'Forecast',  Icon: TrendingUp },
]
const RIGHT_ITEMS: { id: ActiveSection; label: string; Icon: React.ElementType }[] = [
  { id: 'cashflow',       label: 'Cash Flow', Icon: Wallet },
  { id: 'release-notes',  label: 'Version',   Icon: Clock  },
]

function NavBtn({
  id, label, Icon, activeSection, onNavigate,
}: { id: ActiveSection; label: string; Icon: React.ElementType; activeSection: ActiveSection; onNavigate: (s: ActiveSection) => void }) {
  const active = activeSection === id
  return (
    <button
      onClick={() => onNavigate(id)}
      className="flex flex-col items-center justify-center flex-1 py-1 gap-0.5"
    >
      <Icon size={19} color={active ? '#ffffff' : '#6b6b6b'} />
      <span className="text-[10px] font-medium" style={{ color: active ? '#ffffff' : '#6b6b6b' }}>
        {label}
      </span>
    </button>
  )
}

export default function MobileNav({ activeSection, onNavigate, onRunAnalysis, isRunning }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center border-t"
      style={{ background: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', height: 58 }}
    >
      {LEFT_ITEMS.map((item) => (
        <NavBtn key={item.id} {...item} activeSection={activeSection} onNavigate={onNavigate} />
      ))}

      {/* Centre Run button */}
      <button
        onClick={onRunAnalysis}
        disabled={isRunning}
        className="flex flex-col items-center justify-center flex-1 py-1 gap-0.5"
        style={{ opacity: isRunning ? 0.6 : 1 }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: '#1a1a1a', border: '2px solid #c9964c' }}
        >
          <Play size={14} fill="#ffffff" color="#ffffff" />
        </div>
        <span className="text-[10px] font-medium" style={{ color: '#c9964c' }}>
          {isRunning ? 'Running…' : 'Run'}
        </span>
      </button>

      {RIGHT_ITEMS.map((item) => (
        <NavBtn key={item.id} {...item} activeSection={activeSection} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}
