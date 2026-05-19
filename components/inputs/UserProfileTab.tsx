'use client'

import { HelpCircle } from 'lucide-react'
import type { RetirementInputs } from '@/types/retirement'

interface Props {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
}

const CURRENT_YEAR = new Date().getFullYear()

function Label({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <span className="text-[11px] font-medium" style={{ color: '#374151' }}>{children}</span>
      {tooltip && (
        <div className="tooltip">
          <HelpCircle size={11} style={{ color: '#9ca3af', cursor: 'help' }} />
          <div className="tooltip-content">{tooltip}</div>
        </div>
      )}
    </div>
  )
}

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
        <span
          className="absolute left-2.5 text-xs pointer-events-none select-none"
          style={{ color: '#6b7280' }}
        >
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
        className="w-full rounded border text-xs py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
        style={{
          paddingLeft: prefix ? '1.5rem' : '0.5rem',
          paddingRight: '0.5rem',
          borderColor: '#e5e7eb',
          background: '#fff',
          color: '#111827',
        }}
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
    <div className="flex items-center gap-1.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1"
        style={{ accentColor: '#2563eb' }}
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded border text-xs py-1 px-1.5 text-right outline-none focus:ring-1 focus:ring-blue-500"
        style={{ borderColor: '#e5e7eb', background: '#fff', color: '#111827' }}
      />
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-3 h-full"
      style={{ borderColor: '#e5e7eb', background: '#fff' }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function UserProfileTab({ inputs, onChange }: Props) {
  const { person, savings, desiredRetirementIncome } = inputs
  const currentAge = CURRENT_YEAR - person.birthYear

  function setPerson<K extends keyof typeof person>(key: K, value: typeof person[K]) {
    onChange({ ...inputs, person: { ...person, [key]: value } })
  }

  function setSavings<K extends keyof typeof savings>(key: K, value: typeof savings[K]) {
    onChange({ ...inputs, savings: { ...savings, [key]: value } })
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full" style={{ minHeight: 0 }}>
      {/* LEFT: Personal & Income */}
      <SectionCard title="Personal & Income">
        {/* Name + Birth Year */}
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
            <Label>Birth Year</Label>
            <Input
              value={person.birthYear}
              onChange={(v) => setPerson('birthYear', v as number)}
              min={1940}
              max={CURRENT_YEAR - 18}
            />
          </div>
        </div>

        {/* Age display + Retirement Age */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Current Age</Label>
            <div
              className="rounded border px-2.5 py-1.5 text-xs"
              style={{ borderColor: '#e5e7eb', background: '#f6f8fa', color: '#6b7280' }}
            >
              {currentAge} years old
            </div>
          </div>
          <div>
            <Label>Retirement Age</Label>
            <Input
              value={person.retirementAge}
              onChange={(v) => setPerson('retirementAge', v as number)}
              min={currentAge + 1}
              max={80}
            />
          </div>
        </div>

        {/* Life Expectancy + CPP Years */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Life Expectancy</Label>
            <Input
              value={person.lifeExpectancy}
              onChange={(v) => setPerson('lifeExpectancy', v as number)}
              min={person.retirementAge + 1}
              max={105}
            />
          </div>
          <div>
            <Label
              tooltip="38–39 years of contributions = full CPP/OAS benefits. Fewer years = proportionally reduced benefit."
            >
              CPP/OAS Years
            </Label>
            <Input
              value={person.cppContributionYears}
              onChange={(v) => setPerson('cppContributionYears', v as number)}
              min={0}
              max={39}
            />
          </div>
        </div>

        {/* Income */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Current Annual Income</Label>
            <Input
              value={person.currentIncome}
              onChange={(v) => setPerson('currentIncome', v as number)}
              prefix="$"
              min={0}
              step={1000}
            />
          </div>
          <div>
            <Label>Desired Retirement Income</Label>
            <Input
              value={desiredRetirementIncome}
              onChange={(v) => onChange({ ...inputs, desiredRetirementIncome: v as number })}
              prefix="$"
              min={0}
              step={1000}
            />
          </div>
        </div>

        <p className="text-[10px] leading-relaxed" style={{ color: '#9ca3af' }}>
          38 years of CPP/OAS contributions = full benefits (~$1,365/mo CPP + $713/mo OAS).
        </p>
      </SectionCard>

      {/* RIGHT: Account Balances & Targets */}
      <SectionCard title="Account Balances & Annual Savings Targets">
        <div className="overflow-x-auto">
          <table style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: '110px' }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left text-[10px] font-semibold pb-2 pr-1" style={{ color: '#6b7280' }}>Account</th>
                <th className="text-left text-[10px] font-semibold pb-2 pr-2" style={{ color: '#6b7280' }}>Current Balance</th>
                <th className="text-left text-[10px] font-semibold pb-2" style={{ color: '#6b7280' }}>Annual Contribution</th>
              </tr>
            </thead>
            <tbody>
              {/* RRSP */}
              <tr>
                <td className="py-1.5 pr-1">
                  <span className="text-xs font-medium" style={{ color: '#111827' }}>RRSP</span>
                </td>
                <td className="py-1.5 pr-2">
                  <Input
                    value={savings.rrspBalance}
                    onChange={(v) => setSavings('rrspBalance', v as number)}
                    prefix="$"
                    min={0}
                    step={1000}
                  />
                </td>
                <td className="py-1.5">
                  <SliderInput
                    value={savings.rrspAnnualContribution}
                    onChange={(v) => setSavings('rrspAnnualContribution', v)}
                    min={0}
                    max={31560}
                    step={500}
                  />
                </td>
              </tr>
              {/* TFSA */}
              <tr>
                <td className="py-1.5 pr-1">
                  <span className="text-xs font-medium" style={{ color: '#111827' }}>TFSA</span>
                </td>
                <td className="py-1.5 pr-2">
                  <Input
                    value={savings.tfsaBalance}
                    onChange={(v) => setSavings('tfsaBalance', v as number)}
                    prefix="$"
                    min={0}
                    step={1000}
                  />
                </td>
                <td className="py-1.5">
                  <SliderInput
                    value={savings.tfsaAnnualContribution}
                    onChange={(v) => setSavings('tfsaAnnualContribution', v)}
                    min={0}
                    max={20000}
                    step={500}
                  />
                </td>
              </tr>
              {/* Non-Reg */}
              <tr>
                <td className="py-1.5 pr-1">
                  <span className="text-xs font-medium" style={{ color: '#111827' }}>Non-Reg</span>
                </td>
                <td className="py-1.5 pr-2">
                  <Input
                    value={savings.nonRegBalance}
                    onChange={(v) => setSavings('nonRegBalance', v as number)}
                    prefix="$"
                    min={0}
                    step={1000}
                  />
                </td>
                <td className="py-1.5">
                  <SliderInput
                    value={savings.nonRegAnnualContribution}
                    onChange={(v) => setSavings('nonRegAnnualContribution', v)}
                    min={0}
                    max={50000}
                    step={500}
                  />
                </td>
              </tr>
              {/* Other Post-Retirement */}
              <tr>
                <td className="py-1.5 pr-1">
                  <div className="tooltip">
                    <span className="text-xs font-medium underline decoration-dotted cursor-help" style={{ color: '#111827' }}>Other*</span>
                    <div className="tooltip-content">
                      Other Post-Retirement Income: pensions, spousal pensions, or any guaranteed income available after retirement.
                    </div>
                  </div>
                </td>
                <td className="py-1.5 pr-2">
                  <div>
                    <Label>$/month</Label>
                    <Input
                      value={savings.otherPostRetirementMonthly}
                      onChange={(v) => setSavings('otherPostRetirementMonthly', v as number)}
                      prefix="$"
                      min={0}
                      step={100}
                    />
                  </div>
                </td>
                <td className="py-1.5">
                  <div>
                    <Label>Starts at age</Label>
                    <Input
                      value={savings.otherPostRetirementStartAge}
                      onChange={(v) => setSavings('otherPostRetirementStartAge', v as number)}
                      min={55}
                      max={80}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[10px] leading-relaxed" style={{ color: '#9ca3af' }}>
          * Other Post-Retirement Income: pensions, spousal pensions, or guaranteed income sources available after retirement.
          Annual contribution sliders max at RRSP $31,560 and TFSA $7,000 (2026 limits).
        </p>
      </SectionCard>
    </div>
  )
}
