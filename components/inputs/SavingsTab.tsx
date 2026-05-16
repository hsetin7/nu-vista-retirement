'use client'

import type { RetirementInputs, SavingsInputs } from '@/types/retirement'

interface Props {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
}

function NumberInput({
  label,
  hint,
  value,
  onChange,
  prefix = '$',
  step = 1000,
}: {
  label: string
  hint?: string
  value: number
  onChange: (v: number) => void
  prefix?: string
  step?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>
        )}
        <input
          type="number"
          min={0}
          step={step}
          value={value || ''}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, +e.target.value))}
          className={`w-full rounded-md border border-gray-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
        />
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {children}
    </div>
  )
}

export default function SavingsTab({ inputs, onChange }: Props) {
  const s = inputs.savings
  const update = (patch: Partial<SavingsInputs>) =>
    onChange({ ...inputs, savings: { ...s, ...patch } })

  return (
    <div className="space-y-4">
      <SectionCard title="RRSP — Registered Retirement Savings Plan">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Current Balance"
            value={s.rrspBalance}
            onChange={(v) => update({ rrspBalance: v })}
          />
          <NumberInput
            label="Available Contribution Room"
            hint="Check your CRA My Account"
            value={s.rrspRoom}
            onChange={(v) => update({ rrspRoom: v })}
          />
          <NumberInput
            label="Annual Contribution"
            hint="Amount you contribute each year"
            value={s.rrspAnnualContribution}
            onChange={(v) => update({ rrspAnnualContribution: v })}
          />
        </div>
      </SectionCard>

      <SectionCard title="TFSA — Tax-Free Savings Account">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Current Balance"
            value={s.tfsaBalance}
            onChange={(v) => update({ tfsaBalance: v })}
          />
          <NumberInput
            label="Available Contribution Room"
            hint="Check your CRA My Account"
            value={s.tfsaRoom}
            onChange={(v) => update({ tfsaRoom: v })}
          />
          <NumberInput
            label="Annual Contribution"
            value={s.tfsaAnnualContribution}
            onChange={(v) => update({ tfsaAnnualContribution: v })}
          />
        </div>
      </SectionCard>

      <SectionCard title="Other Accounts">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Non-Registered Investment Balance"
            value={s.nonRegBalance}
            onChange={(v) => update({ nonRegBalance: v })}
          />
          <NumberInput
            label="Employer Pension (monthly at retirement)"
            hint="Leave $0 if no DB pension"
            value={s.pensionMonthly}
            onChange={(v) => update({ pensionMonthly: v })}
          />
        </div>
      </SectionCard>
    </div>
  )
}
