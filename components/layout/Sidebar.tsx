'use client'

import { BarChart2, FileText, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActiveSection } from '@/types/retirement'

interface SidebarProps {
  activeSection: ActiveSection
  onNavigate: (section: ActiveSection) => void
}

const navItems: { id: ActiveSection; label: string; icon: React.ReactNode }[] = [
  { id: 'inputs', label: 'Inputs', icon: <Settings2 size={18} /> },
  { id: 'projections', label: 'Projections', icon: <BarChart2 size={18} /> },
  { id: 'report', label: 'Report', icon: <FileText size={18} /> },
]

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className="flex flex-col w-48 shrink-0 bg-[#111827] h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">NV</span>
        </div>
        <span className="text-white text-sm font-semibold leading-tight">
          Nu Vista<br />
          <span className="text-gray-400 text-xs font-normal">Analytics</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full text-left transition-colors',
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-gray-500 text-xs">v1.0 · Canada</p>
      </div>
    </aside>
  )
}
