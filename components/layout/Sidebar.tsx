'use client'

import { BarChart2, DollarSign, Settings2, GitBranch, Play, Download } from 'lucide-react'
import type { ActiveSection } from '@/types/retirement'

interface SidebarProps {
  activeSection: ActiveSection
  onNavigate: (section: ActiveSection) => void
  onRunAnalysis: () => void
  onDownloadResults: () => void
  isRunning: boolean
  hasResults: boolean
}

const navItems: { id: ActiveSection; label: string; icon: React.ReactNode }[] = [
  { id: 'inputs', label: 'Profile Data', icon: <Settings2 size={15} /> },
  { id: 'projections', label: 'Forecast', icon: <BarChart2 size={15} /> },
  { id: 'cashflow', label: 'Cash Flow', icon: <DollarSign size={15} /> },
  { id: 'release-notes', label: 'Version Control', icon: <GitBranch size={15} /> },
]

export default function Sidebar({
  activeSection,
  onNavigate,
  onRunAnalysis,
  onDownloadResults,
  isRunning,
  hasResults,
}: SidebarProps) {
  return (
    <aside
      className="flex flex-col w-48 shrink-0 h-full"
      style={{ background: '#1c1c1e' }}
    >
      {/* Brand */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="font-serif text-white text-base font-semibold leading-tight">Nu Vista</div>
        <div className="text-xs mt-0.5" style={{ color: '#c9964c', fontFamily: 'var(--font-dm-sans)' }}>
          Analytics
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-medium w-full text-left transition-colors"
              style={{
                background: isActive ? '#3a3a3c' : 'transparent',
                color: isActive ? '#ffffff' : '#9a9a9a',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#2c2c2e'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Action Buttons */}
      <div className="px-3 pb-4 flex flex-col gap-2.5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={onRunAnalysis}
          disabled={isRunning}
          className="btn-3d btn-primary-3d w-full"
          style={{ opacity: isRunning ? 0.65 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}
        >
          <Play size={12} fill="currentColor" />
          {isRunning ? 'Running…' : 'Run Analysis'}
        </button>

        <button
          onClick={onDownloadResults}
          disabled={!hasResults}
          className="btn-3d btn-secondary-3d w-full"
          style={{
            opacity: hasResults ? 1 : 0.45,
            cursor: hasResults ? 'pointer' : 'not-allowed',
            color: '#1a1a1a',
          }}
        >
          <Download size={12} />
          Download Results
        </button>
      </div>

      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px]" style={{ color: '#5c5c5c' }}>v2.1 · Canada 2026</p>
      </div>
    </aside>
  )
}
