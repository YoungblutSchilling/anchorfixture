import { ChangeEvent, useMemo, useRef, useState } from 'react'
import {
  Braces,
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  Download,
  FileJson,
  Github,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Upload,
} from 'lucide-react'
import sampleIdl from '../fixtures/counter-idl.json'
import { generateFixturePack, generateVitestSource, parseIdl } from './core'
import type { FixtureScenario } from './types'
import './styles.css'

type OutputMode = 'json' | 'vitest'
type ScenarioFilter = 'all' | FixtureScenario['kind']

const sampleSource = JSON.stringify(sampleIdl, null, 2)

function downloadFile(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function compactKey(value: string) {
  return value.length > 22 ? `${value.slice(0, 9)}...${value.slice(-7)}` : value
}

export default function App() {
  const [source, setSource] = useState(sampleSource)
  const [seed, setSeed] = useState('anchorfixture')
  const [instruction, setInstruction] = useState('all')
  const [outputMode, setOutputMode] = useState<OutputMode>('json')
  const [filter, setFilter] = useState<ScenarioFilter>('all')
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('initialize.success')
  const [copied, setCopied] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const result = useMemo(() => {
    try {
      const idl = parseIdl(source)
      const pack = generateFixturePack(idl, {
        seed,
        instruction: instruction === 'all' ? undefined : instruction,
      })
      return { idl, pack, error: '' }
    } catch (error) {
      return {
        idl: null,
        pack: null,
        error: error instanceof Error ? error.message : 'Invalid IDL',
      }
    }
  }, [instruction, seed, source])

  const scenarios = result.pack?.instructions.flatMap((item) => item.scenarios) ?? []
  const visibleScenarios = filter === 'all' ? scenarios : scenarios.filter((item) => item.kind === filter)
  const selectedScenario = scenarios.find((item) => item.id === selectedScenarioId) ?? visibleScenarios[0]
  const jsonOutput = result.pack ? JSON.stringify(result.pack, null, 2) : ''
  const vitestOutput = result.pack ? generateVitestSource(result.pack) : ''
  const output = outputMode === 'json' ? jsonOutput : vitestOutput

  function resetSample() {
    setSource(sampleSource)
    setInstruction('all')
    setSeed('anchorfixture')
    setSelectedScenarioId('initialize.success')
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setSource(await file.text())
    setInstruction('all')
    event.target.value = ''
  }

  async function copyOutput() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  function downloadOutput() {
    if (!output) return
    const isJson = outputMode === 'json'
    downloadFile(
      isJson ? 'anchorfixture.pack.json' : 'anchorfixture.pack.spec.ts',
      output,
      isJson ? 'application/json' : 'text/typescript',
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#workbench" aria-label="AnchorFixture home">
          <span className="brand-mark" aria-hidden="true"><Braces size={19} strokeWidth={2.4} /></span>
          <span>AnchorFixture</span>
          <span className="version">v0.1</span>
        </a>
        <div className="topbar-status">
          <span className="status-dot" aria-hidden="true" />
          <span>Local-only compiler</span>
        </div>
        <a className="icon-link" href="https://github.com/YoungblutSchilling/anchorfixture" target="_blank" rel="noreferrer" title="Open GitHub repository" aria-label="Open GitHub repository">
          <Github size={18} />
        </a>
      </header>

      <main id="workbench" className="workbench">
        <section className="workspace-head">
          <div>
            <p className="eyebrow">ANCHOR IDL / SCENARIO COMPILER</p>
            <h1>Compile the contract before the transaction.</h1>
          </div>
          <div className="summary-strip" aria-label="Fixture summary">
            <SummaryMetric label="Instructions" value={result.pack?.summary.instructions ?? 0} />
            <SummaryMetric label="Scenarios" value={result.pack?.summary.scenarios ?? 0} />
            <SummaryMetric label="Negative" value={result.pack?.summary.negativeScenarios ?? 0} accent />
            <SummaryMetric label="Signers" value={result.pack?.summary.signerAccounts ?? 0} />
          </div>
        </section>

        <section className="control-rail" aria-label="Compiler controls">
          <label className="field seed-field">
            <span>Deterministic seed</span>
            <div className="input-with-icon">
              <KeyRound size={15} />
              <input value={seed} onChange={(event) => setSeed(event.target.value)} spellCheck={false} />
            </div>
          </label>
          <label className="field instruction-field">
            <span>Instruction scope</span>
            <div className="select-wrap">
              <select value={instruction} onChange={(event) => setInstruction(event.target.value)} disabled={!result.idl}>
                <option value="all">All instructions</option>
                {result.idl?.instructions.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </label>
          <div className="control-actions">
            <input ref={fileInput} className="sr-only" type="file" accept=".json,application/json" onChange={loadFile} />
            <button className="button secondary" onClick={() => fileInput.current?.click()}><Upload size={16} /> Import IDL</button>
            <button className="icon-button" onClick={resetSample} title="Reset sample IDL" aria-label="Reset sample IDL"><RefreshCw size={17} /></button>
          </div>
        </section>

        <div className="workspace-grid">
          <section className="panel source-panel">
            <PanelHeader icon={<FileJson size={16} />} title="IDL source" detail={result.error || result.pack?.idlFingerprint || ''} error={Boolean(result.error)} />
            <textarea
              className="source-editor"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              aria-label="Anchor IDL JSON source"
            />
          </section>

          <section className="panel scenario-panel">
            <div className="panel-titlebar scenario-titlebar">
              <div className="panel-title"><Sparkles size={16} /><span>Scenario matrix</span></div>
              <div className="segmented compact" aria-label="Scenario filter">
                {(['all', 'success', 'negative', 'boundary'] as ScenarioFilter[]).map((item) => (
                  <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>
                ))}
              </div>
            </div>
            <div className="scenario-list">
              {visibleScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  className={`scenario-row ${selectedScenario?.id === scenario.id ? 'selected' : ''}`}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                >
                  <span className={`kind-mark ${scenario.kind}`} aria-hidden="true">
                    {scenario.kind === 'success' ? <Check size={13} /> : scenario.kind === 'negative' ? <ShieldAlert size={13} /> : <Braces size={13} />}
                  </span>
                  <span className="scenario-copy">
                    <strong>{scenario.title}</strong>
                    <small>{scenario.instruction} / {scenario.mutation.type}</small>
                  </span>
                  <span className={`outcome ${scenario.expectedOutcome}`}>{scenario.expectedOutcome}</span>
                </button>
              ))}
              {!visibleScenarios.length && <div className="empty-state">No scenarios</div>}
            </div>
            {selectedScenario && (
              <div className="scenario-inspector">
                <div className="inspector-head">
                  <span>Selected contract</span>
                  <code>{selectedScenario.id}</code>
                </div>
                <dl>
                  <div><dt>Expected</dt><dd>{selectedScenario.expectedError ?? 'Transaction accepted'}</dd></div>
                  <div><dt>Signers</dt><dd>{selectedScenario.signers.length || 'None'}</dd></div>
                  <div><dt>Accounts</dt><dd>{selectedScenario.accounts.length}</dd></div>
                </dl>
                <div className="account-keys">
                  {selectedScenario.accounts.slice(0, 4).map((account) => (
                    <div key={account.path}>
                      <span>{account.path}</span>
                      <code title={account.publicKey}>{compactKey(account.publicKey)}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="panel output-panel">
            <div className="panel-titlebar output-titlebar">
              <div className="segmented" aria-label="Output format">
                <button className={outputMode === 'json' ? 'active' : ''} onClick={() => setOutputMode('json')}><Braces size={15} /> JSON pack</button>
                <button className={outputMode === 'vitest' ? 'active' : ''} onClick={() => setOutputMode('vitest')}><Code2 size={15} /> Vitest</button>
              </div>
              <div className="output-actions">
                <button className="icon-button" onClick={copyOutput} disabled={!output} title="Copy output" aria-label="Copy output">
                  {copied ? <Check size={17} /> : <Clipboard size={17} />}
                </button>
                <button className="button primary" onClick={downloadOutput} disabled={!output}><Download size={16} /> Download</button>
              </div>
            </div>
            <pre className="output-code"><code>{output || result.error}</code></pre>
          </section>
        </div>

        <footer className="footer-bar">
          <span>IDL data stays in this browser.</span>
          <span>Anchor 0.30 + legacy field support</span>
          <span>MIT licensed</span>
        </footer>
      </main>
    </div>
  )
}

function SummaryMetric({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return <div className={accent ? 'summary-metric accent' : 'summary-metric'}><strong>{value.toString().padStart(2, '0')}</strong><span>{label}</span></div>
}

function PanelHeader({ icon, title, detail, error }: { icon: React.ReactNode; title: string; detail: string; error?: boolean }) {
  return (
    <div className="panel-titlebar">
      <div className="panel-title">{icon}<span>{title}</span></div>
      <code className={error ? 'panel-detail error' : 'panel-detail'} title={detail}>{detail}</code>
    </div>
  )
}
