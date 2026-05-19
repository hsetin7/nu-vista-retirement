'use client'

import { BarChart2, DollarSign, Settings2, FileText, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActiveSection } from '@/types/retirement'

interface SidebarProps {
  activeSection: ActiveSection
  onNavigate: (section: ActiveSection) => void
}

const navItems: { id: ActiveSection; label: string; icon: React.ReactNode }[] = [
  { id: 'inputs', label: 'Inputs', icon: <Settings2 size={16} /> },
  { id: 'projections', label: 'Projections', icon: <BarChart2 size={16} /> },
  { id: 'cashflow', label: 'Cash Flow', icon: <DollarSign size={16} /> },
  { id: 'release-notes', label: 'Release Notes', icon: <Info size={16} /> },
]

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className="flex flex-col w-44 shrink-0 h-full" style={{ background: '#0d1117' }}>
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: '#2563eb' }}>
          <span className="text-white text-[10px] font-bold">NV</span>
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-semibold leading-tight">Nu Vista</div>
          <div className="text-[11px] leading-tight" style={{ color: '#8b949e' }}>Analytics</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium w-full text-left transition-colors',
              activeSection === item.id
                ? 'text-white'
                : 'hover:text-white'
            )}
            style={
              activeSection === item.id
                ? { background: '#2563eb', color: '#fff' }
                : { color: '#8b949e' }
            }
            onMouseEnter={(e) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.background = '#1c2128'
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-[10px]" style={{ color: '#6b7280' }}>v2.0 · Canada 2026</p>
      </div>
    </aside>
  )
}
