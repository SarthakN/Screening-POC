import { useState, useRef } from 'react'
import AddJobForm from './components/AddJobForm'
import JobList from './components/JobList'
import ApplicationsPage from './components/ApplicationsPage'
import DevMode from './components/DevMode'
import { getPrompts } from './services/prompts'
import { getDevFeatures } from './services/devFeatures'

const MODELS = ['gpt-4o', 'gpt-5.4', 'gpt-5.5']

export default function App() {
  const [jobs, setJobs] = useState([])
  const [evaluationResults, setEvaluationResults] = useState({})  // jobId -> criteria
  const [applications, setApplications] = useState([])
  const [activePage, setActivePage] = useState('jobs')
  const [model, setModel] = useState(import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o')
  const [prompts, setPrompts] = useState(() => getPrompts())
  const [devFeatures, setDevFeatures] = useState(() => getDevFeatures())
  const [devMode, setDevMode] = useState(false)
  const logoClickTimes = useRef([])

  const handleLogoClick = () => {
    const now = Date.now()
    logoClickTimes.current = [...logoClickTimes.current, now].filter(t => now - t < 800)
    if (logoClickTimes.current.length >= 3) {
      logoClickTimes.current = []
      setDevMode(prev => !prev)
      setActivePage(d => d === 'dev' ? 'jobs' : 'dev')
    }
  }

  const handleAddJob = (job, initialCriteria) => {
    setJobs(prev => [job, ...prev])
    if (initialCriteria) {
      setEvaluationResults(prev => ({ ...prev, [job.id]: initialCriteria }))
    }
  }

  const handleAddApplication = (app) => {
    setApplications(prev => [app, ...prev])
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'default' }}>
            <span className="logo-icon">⚡</span>
            <span className="logo-text">JobBoard</span>
          </div>
          <nav className="header-nav">
            <button
              className={`nav-tab ${activePage === 'jobs' ? 'nav-tab--active' : ''}`}
              onClick={() => setActivePage('jobs')}
            >
              Jobs
            </button>
            <button
              className={`nav-tab ${activePage === 'applications' ? 'nav-tab--active' : ''}`}
              onClick={() => setActivePage('applications')}
            >
              Applications
            </button>
            {devMode && (
              <button
                className={`nav-tab nav-tab--dev ${activePage === 'dev' ? 'nav-tab--active' : ''}`}
                onClick={() => setActivePage('dev')}
              >
                Dev Mode
              </button>
            )}
          </nav>
          <div className="model-selector">
            <span className="model-selector-label">Model</span>
            <select
              className="model-select"
              value={model}
              onChange={e => setModel(e.target.value)}
            >
              {MODELS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {activePage === 'jobs' ? (
            <>
              <AddJobForm
                onAddJob={handleAddJob}
                jobs={jobs}
                evaluationResults={evaluationResults}
                criteriaReuseEnabled={!!devFeatures.criteriaReuseEnabled}
                model={model}
              />
              <div className="divider" />
              <JobList
                jobs={jobs}
                model={model}
                evaluationResults={evaluationResults}
                setEvaluationResults={setEvaluationResults}
              />
            </>
          ) : activePage === 'applications' ? (
            <ApplicationsPage
              jobs={jobs}
              applications={applications}
              onAddApplication={handleAddApplication}
              evaluationResults={evaluationResults}
              model={model}
            />
          ) : activePage === 'dev' ? (
            <DevMode
              prompts={prompts}
              onPromptsChange={setPrompts}
              features={devFeatures}
              onFeaturesChange={setDevFeatures}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
