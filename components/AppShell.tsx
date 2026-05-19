'use client'

import { useState, useCallback } from 'react'
import type { ActiveSection, ActiveInputTab, RetirementInputs, ProjectionResults } from '@/types/retirement'
import { DEFAULT_INPUTS } from '@/lib/defaults'
import { runProjection } from '@/lib/calculations'
import { exportPdf } from '@/lib/pdf-export'
import Sidebar from './layout/Sidebar'
import Header from './layout/Header'
import InputsSection from './inputs/InputsSection'
import ProjectionsSection from './projections/ProjectionsSection'
import CashFlowSection from './projections/CashFlowSection'
import ReleaseNotesSection from './ReleaseNotesSection'

export default function AppShell() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('inputs')
  const [activeTab, setActiveTab] = useState<ActiveInputTab>('profile')
  const [inputs, setInputs] = useState<RetirementInputs>(DEFAULT_INPUTS)
  const [results, setResults] = useState<ProjectionResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  const handleRunSimulation = useCallback(() => {
    setIsRunning(true)
    setTimeout(() => {
      try {
        const projection = runProjection(inputs)
        setResults(projection)
        setLastRun(
          new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })
        )
        setActiveSection('projections')
      } catch (e) {
        console.error('Simulation error:', e)
      } finally {
        setIsRunning(false)
      }
    }, 50)
  }, [inputs])

  const handleSavePdf = useCallback(async () => {
    if (!results) {
      alert('Run a simulation first to generate a PDF report.')
      return
    }
    try {
      await exportPdf(inputs, results)
    } catch (e) {
      console.error('PDF export error:', e)
      alert('PDF export failed. Please try again.')
    }
  }, [inputs, results])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f6f8fa' }}>
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onRunSimulation={handleRunSimulation}
          onSavePdf={handleSavePdf}
          isRunning={isRunning}
          lastRun={lastRun}
        />

        <main className="flex-1 overflow-hidden" style={{ background: '#f6f8fa' }}>
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
          {activeSection === 'cashflow' && (
            <CashFlowSection
              results={results}
              inputs={inputs}
              onRunSimulation={handleRunSimulation}
            />
          )}
          {activeSection === 'release-notes' && <ReleaseNotesSection />}
        </main>
      </div>
    </div>
  )
}
