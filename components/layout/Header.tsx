'use client'

import { Play, Save, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onRunSimulation: () => void
  isRunning: boolean
  hasResults: boolean
  lastRun: string | null
}

export default function Header({ onRunSimulation, isRunning, hasResults, lastRun }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#111827] border-b border-white/10 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-white font-semibold text-sm">Retirement Planner</span>
        <span className="text-gray-500 text-xs">·</span>
        <span className="text-gray-400 text-xs">
          {lastRun ? `Last run: ${lastRun}` : 'Last run: Never run'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/20 text-gray-300 text-xs font-medium hover:bg-white/10 transition-colors"
          title="Save inputs"
        >
          <Save size={13} />
          Save
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/20 text-gray-300 text-xs font-medium hover:bg-white/10 transition-colors"
          title="Import saved inputs"
        >
          <Upload size={13} />
          Import
        </button>

        <button
          onClick={onRunSimulation}
          disabled={isRunning}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-white text-xs font-semibold transition-colors',
            isRunning
              ? 'bg-blue-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
          )}
        >
          <Play size={13} fill="currentColor" />
          {isRunning ? 'Running…' : 'Run Simulation'}
        </button>
      </div>
    </header>
  )
}
