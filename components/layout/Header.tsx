'use client'

interface HeaderProps {
  lastRun: string | null
}

export default function Header({ lastRun }: HeaderProps) {
  return (
    <header
      className="flex items-center px-5 py-3 shrink-0 border-b"
      style={{ background: '#ffffff', borderColor: '#e8e6e1' }}
    >
      <div className="flex items-center gap-2.5">
        <h1
          className="font-serif text-base font-semibold"
          style={{ color: '#1a1a1a', fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Retirement Planner
        </h1>
        <span style={{ color: '#d1cec8' }}>·</span>
        <span className="text-xs" style={{ color: '#9a9a9a' }}>
          {lastRun ? `Last run: ${lastRun}` : 'Run analysis to see your forecast'}
        </span>
      </div>
    </header>
  )
}
