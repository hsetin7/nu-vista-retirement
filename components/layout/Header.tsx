'use client'

import { Play, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onRunSimulation: () => void
  onSavePdf: () => void
  isRunning: boolean
  lastRun: string | null
}

export default function Header({ onRunSimulation, onSavePdf, isRunning, lastRun }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 py-2.5 shrink-0 border-b border-white/10"
      style={{ background: '#0d1117' }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-white font-semibold text-sm">Retirement Forecast</span>
        <span style={{ color: '#374151' }}>·</span>
        <span className="text-xs" style={{ color: '#6b7280' }}>
          {lastRun ? `Last run: ${lastRun}` : 'Run simulation to see projections'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSavePdf}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-white/20 transition-colors hover:bg-white/10"
          style={{ color: '#d1d5db' }}
          title="Download PDF report"
        >
          <Download size={12} />
          Save PDF
        </button>

        <button
          onClick={onRunSimulation}
          disabled={isRunning}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded text-white text-xs font-semibold transition-colors',
            isRunning ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
          )}
          style={{ background: '#2563eb' }}
        >
          <Play size={12} fill="currentColor" />
          {isRunning ? 'Running…' : 'Run Simulation'}
        </button>
      </div>
    </header>
  )
}
