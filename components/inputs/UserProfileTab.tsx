'use client'

import { HelpCircle } from 'lucide-react'
import type { RetirementInputs } from '@/types/retirement'

interface Props {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
}

const INPUT_STYLE: React.CSSProperties = {
  borderColor: '#e8e6e1',
  background: '#ffffff',
  color: '#1a1a1a',
  fontFamily: 'var(--font-dm-sans)',
}

function formatWithCommas(n: number): string {
  if (n === 0) return ''
  return new Intl.NumberFormat('en-CA').format(n)
}

function Label({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <span className="text-[12px] font-medium" style={{ color: '#5c5c5c' }}>{children}</span>
      {tooltip && (
        <div className="tooltip">
          <HelpCircle size={11} style={{ color: '#b0aca6', cursor: 'help' }} />
          <div className="tooltip-content">{tooltip}</div>
        </div>
      )}
    </div>
  )
}

/** Plain number or text input — no comma formatting */
function Input({
  value,
  onChange,
  type = 'number',
  prefix,
  min,
  max,
  step = 1,
  placeholder,
}: {
  value: string | number
  onChange: (v: number | string) => void
  type?: 'number' | 'text'
  prefix?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
}) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-2.5 text-[13px] pointer-events-none select-none" style={{ color: '#9a9a9a' }}>
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(type === 'number' ? (e.target.value === '' ? 0 : Number(e.target.value)) : e.target.value)
        }
        className="w-full rounded-md border text-[13px] py-1.5 outline-none focus:ring-1 transition-shadow"
        style={{
          paddingLeft: prefix ? '1.5rem' : '0.625rem',
          paddingRight: '0.625rem',
          ...INPUT_STYLE,
        }}
        onFocus={(e) => (e.target.style.borderColor = '#1a1a1a')}
        onBlur={(e) => (e.target.style.borderColor = '#e8e6e1')}
      />
    </div>
  )
}

/** Dollar input with comma formatting on blur */
function DollarInput({
  value,
  onChange,
  min = 0,
  step = 1000,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
}) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-2.5 text-[13px] pointer-events-none select-none" style={{ color: '#9a9a9a' }}>$</span>
      <input
        type="text"
        inputMode="numeric"
        defaultValue={formatWithCommas(value)}
        key={value} // re-mount when value changes externally
        className="w-full rounded-md border text-[13px] py-1.5 outline-none transition-shadow"
        style={{ paddingLeft: '1.25rem', paddingRight: '0.625rem', ...INPUT_STYLE }}
        onFocus={(e) => {
          e.target.style.borderColor = '#1a1a1a'
          // show raw number on focus
          e.target.value = value === 0 ? '' : String(value)
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e8e6e1'
          const raw = Number(e.target.value.replace(/[^0-9.]/g, ''))
          const clamped = min !== undefined ? Math.max(min, isNaN(raw) ? 0 : raw) : (isNaN(raw) ? 0 : raw)
          onChange(clamped)
          // format with commas on blur
          e.target.value = formatWithCommas(clamped)
        }}
        onChange={(e) => {
          // strip non-numeric while typing (allow digits and dot)
          const stripped = e.target.value.replace(/[^0-9.]/g, '')
          e.target.value = stripped
        }}
        placeholder="0"
      />
    </div>
  )
}

function SliderInput({
  value,
  onChange,
  min,
  max,
  step = 500,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1"
        style={{ accentColor: '#1a1a1a' }}
      />
      {/* Number box on slider also shows commas on blur */}
      <input
        type="text"
        inputMode="numeric"
        key={value}
        defaultValue={formatWithCommas(value)}
        className="w-20 rounded-md border text-[13px] py-1 px-1.5 text-right outline-none"
        style={{ borderColor: '#e8e6e1', background: '#ffffff', color: '#1a1a1a' }}
        onFocus={(e) => {
          e.target.style.borderColor = '#1a1a1a'
          e.target.value = value === 0 ? '' : String(value)
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e8e6e1'
          const raw = Number(e.target.value.replace(/[^0-9.]/g, ''))
          const clamped = Math.max(min, Math.min(max, isNaN(raw) ? 0 : raw))
          onChange(clamped)
          e.target.value = formatWithCommas(clamped)
        }}
        onChange={(e) => {
          e.target.value = e.target.value.replace(/[^0-9.]/g, '')
        }}
        placeholder="0"
      />
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3 h-full"
      style={{ borderColor: '#e8e6e1', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <h3 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#9a9a9a' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function UserProfileTab({ inputs, onChange }: Props) {
  const { person, savings, desiredRetirementIncome } = inputs

  function setPerson<K extends keyof typeof person>(key: K, value: typeof person[K]) {
    onChange({ ...inputs, person: { ...person, [key]: value } })
  }

  function setSavings<K extends keyof typeof savings>(key: K, value: typeof savings[K]) {
    onChange({ ...inputs, savings: { ...savings, [key]: value } })
  }

  const yearsToRetirement = Math.max(0, person.retirementAge - person.currentAge)

  return (
    <div className="grid grid-cols-2 gap-4 h-full" style={{ minHeight: 0 }}>
      {/* LEFT — Personal & Income */}
      <SectionCard title="Personal & Income">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              value={person.name}
              onChange={(v) => setPerson('name', v as string)}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label>Current Age</Label>
            <Input value={person.currentAge} onChange={(v) => setPerson('currentAge', v as number)} min={18} max={80} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Retirement Age</Label>
            <Input value={person.retirementAge} onChange={(v) => setPerson('retirementAge', v as number)} min={person.currentAge + 1} max={80} />
          </div>
          <div>
            <Label>Life Expectancy</Label>
            <Input value={person.lifeExpectancy} onChange={(v) => setPerson('lifeExpectancy', v as number)} min={person.retirementAge + 1} max={105} />
          </div>
        </div>

        <div>
          <Label
            tooltip={`CPP is based on years you contributed (worked and paid into CPP). OAS is based on years of Canadian residency after age 18. If either will be fewer than 40 years by retirement age ${person.retirementAge}, enter the lower number. 40 years residency = full OAS (~$727/mo at 65). 39+ contribution years = near-full CPP (~$1,365/mo at 65).`}
          >
            CPP Contribution Years / OAS Residency Years by Retirement (if less than 40)
          </Label>
          <Input value={person.cppContributionYears} onChange={(v) => setPerson('cppContributionYears', v as number)} min={0} max={40} />
          <p className="text-[11px] mt-1" style={{ color: '#b0aca6' }}>
            {yearsToRetirement > 0
              ? `~${yearsToRetirement} working years until retirement.`
              : 'At or past retirement age.'}{' '}
            40 years = full OAS · 39+ years = full CPP.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Current Annual Income</Label>
            <DollarInput value={person.currentIncome} onChange={(v) => setPerson('currentIncome', v)} />
          </div>
          <div>
            <Label>Desired Retirement Income</Label>
            <DollarInput value={desiredRetirementIncome} onChange={(v) => onChange({ ...inputs, desiredRetirementIncome: v })} />
          </div>
        </div>
      </SectionCard>

      {/* RIGHT — Account Balances & Targets */}
      <SectionCard title="Account Balances & Annual Savings">
        <div className="overflow-x-auto">
          <table style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '64px' }} />
              <col style={{ width: '112px' }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left text-[10px] font-semibold pb-2 pr-2" style={{ color: '#9a9a9a' }}>Account</th>
                <th className="text-left text-[10px] font-semibold pb-2 pr-2" style={{ color: '#9a9a9a' }}>Balance</th>
                <th className="text-left text-[10px] font-semibold pb-2" style={{ color: '#9a9a9a' }}>Annual Contribution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 pr-2"><span className="text-[13px] font-semibold" style={{ color: '#1a1a1a' }}>RRSP</span></td>
                <td className="py-1.5 pr-2"><DollarInput value={savings.rrspBalance} onChange={(v) => setSavings('rrspBalance', v)} /></td>
                <td className="py-1.5"><SliderInput value={savings.rrspAnnualContribution} onChange={(v) => setSavings('rrspAnnualContribution', v)} min={0} max={31560} step={500} /></td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2"><span className="text-[13px] font-semibold" style={{ color: '#1a1a1a' }}>TFSA</span></td>
                <td className="py-1.5 pr-2"><DollarInput value={savings.tfsaBalance} onChange={(v) => setSavings('tfsaBalance', v)} /></td>
                <td className="py-1.5"><SliderInput value={savings.tfsaAnnualContribution} onChange={(v) => setSavings('tfsaAnnualContribution', v)} min={0} max={20000} step={500} /></td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2"><span className="text-[13px] font-semibold" style={{ color: '#1a1a1a' }}>Non-Reg</span></td>
                <td className="py-1.5 pr-2"><DollarInput value={savings.nonRegBalance} onChange={(v) => setSavings('nonRegBalance', v)} /></td>
                <td className="py-1.5"><SliderInput value={savings.nonRegAnnualContribution} onChange={(v) => setSavings('nonRegAnnualContribution', v)} min={0} max={50000} step={500} /></td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2">
                  <div className="tooltip">
                    <span className="text-[13px] font-semibold underline decoration-dotted cursor-help" style={{ color: '#1a1a1a' }}>Other*</span>
                    <div className="tooltip-content">Pensions, spousal pensions, or any guaranteed income available after retirement.</div>
                  </div>
                </td>
                <td className="py-1.5 pr-2">
                  <Label>$/month</Label>
                  <DollarInput value={savings.otherPostRetirementMonthly} onChange={(v) => setSavings('otherPostRetirementMonthly', v)} />
                </td>
                <td className="py-1.5">
                  <Label>Start age</Label>
                  <Input value={savings.otherPostRetirementStartAge} onChange={(v) => setSavings('otherPostRetirementStartAge', v as number)} min={55} max={80} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[10px] leading-relaxed" style={{ color: '#b0aca6' }}>
          * Other: pensions, spousal pensions, or guaranteed post-retirement income. RRSP max $31,560 · TFSA $7,000 (2026 limits).
        </p>
      </SectionCard>
    </div>
  )
}
