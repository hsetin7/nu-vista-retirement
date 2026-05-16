'use client'

import { useState, useCallback } from 'react'
import type { ActiveSection, ActiveInputTab, RetirementInputs, ProjectionResults } from '@/types/retirement'
import { DEFAULT_INPUTS } from '@/lib/defaults'
import { runProjection } from '@/lib/calculations'
import Sidebar from './layout/Sidebar'
import Header from './layout/Header'
import InputsSection from './inputs/InputsSection'
import ProjectionsSection from './projections/ProjectionsSection'
import ReportSection from './report/ReportSection'

export default function AppShell() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('inputs')
  const [activeTab, setActiveTab] = useState<ActiveInputTab>('people')
  const [inputs, setInputs] = useState<RetirementInputs>(DEFAULT_INPUTS)
  const [results, setResults] = useState<ProjectionResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  const handleRunSimulation = useCallback(() => {
    setIsRunning(true)
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      try {
        const projection = runProjection(inputs)
        setResults(projection)
        setLastRun(new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }))
        setActiveSection('projections')
      } catch (e) {
        console.error('Simulation error:', e)
      } finally {
        setIsRunning(false)
      }
    }, 50)
  }, [inputs])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onRunSimulation={handleRunSimulation}
          isRunning={isRunning}
          hasResults={results !== null}
          lastRun={lastRun}
        />

        <main className="flex-1 overflow-hidden bg-gray-50">
          {activeSection === 'inputs' && (
            <InputsSection
              inputs={inputs}
              onChange={setInputs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
          {activeSection === 'projections' && (
            <ProjectionsSection
              results={results}
              inputs={inputs}
              onRunSimulation={handleRunSimulation}
            />
          )}
          {activeSection === 'report' && (
            <ReportSection
              results={results}
              inputs={inputs}
              onRunSimulation={handleRunSimulation}
            />
          )}
        </main>
      </div>
    </div>
  )
}
