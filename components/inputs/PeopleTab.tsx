'use client'

import type { RetirementInputs, Person } from '@/types/retirement'
import { CURRENT_YEAR } from '@/lib/utils'

interface Props {
  inputs: RetirementInputs
  onChange: (inputs: RetirementInputs) => void
}

function PersonCard({
  title,
  person,
  onChange,
  onRemove,
  showRemove,
}: {
  title: string
  person: Person
  onChange: (p: Person) => void
  onRemove?: () => void
  showRemove?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            type="text"
            placeholder="e.g. Alex"
            value={person.name}
            onChange={(e) => onChange({ ...person, name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Birth Year</label>
          <input
            type="number"
            min={1940}
            max={CURRENT_YEAR - 18}
            value={person.birthYear || ''}
            onChange={(e) => onChange({ ...person, birthYear: +e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Current Annual Income</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={person.birthYear ? '' : ''}
              placeholder="0"
              className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Target Retirement Age</label>
          <input
            type="number"
            min={50}
            max={75}
            value={person.retirementAge}
            onChange={(e) => onChange({ ...person, retirementAge: +e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Life Expectancy</label>
          <input
            type="number"
            min={70}
            max={105}
            value={person.lifeExpectancy}
            onChange={(e) => onChange({ ...person, lifeExpectancy: +e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

export default function PeopleTab({ inputs, onChange }: Props) {
  const updatePerson1 = (p: Person) => onChange({ ...inputs, person1: p })
  const updatePerson2 = (p: Person) => onChange({ ...inputs, person2: p })
  const removePerson2 = () => onChange({ ...inputs, person2: null })
  const addPerson2 = () =>
    onChange({
      ...inputs,
      person2: {
        name: '',
        birthYear: CURRENT_YEAR - 40,
        retirementAge: 65,
        lifeExpectancy: 90,
      },
    })

  return (
    <div className="space-y-4">
      <PersonCard
        title="Person 1"
        person={inputs.person1}
        onChange={updatePerson1}
      />

      {inputs.person2 ? (
        <PersonCard
          title="Person 2 (Spouse / Partner)"
          person={inputs.person2}
          onChange={updatePerson2}
          onRemove={removePerson2}
          showRemove
        />
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-5">
          <p className="text-sm text-gray-500 mb-3">Planning as a couple?</p>
          <button
            onClick={addPerson2}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            + Add Person 2
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-1">Planning Horizon</h3>
        <p className="text-sm text-gray-500">
          Projection runs from today ({CURRENT_YEAR}) to age {inputs.person1.lifeExpectancy} (
          {CURRENT_YEAR + (inputs.person1.lifeExpectancy - (CURRENT_YEAR - inputs.person1.birthYear))}
          ).
        </p>
      </div>
    </div>
  )
}
