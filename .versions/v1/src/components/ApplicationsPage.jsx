import { useState } from 'react'
import { generateRecommendation } from '../services/llm'
import RecommendationModal from './RecommendationModal'

const OVERALL_LABEL = {
  strong_fit:  { label: 'FastTrack',    cls: 'overall-strong',  icon: '\u2713' },
  partial_fit: { label: 'Eligible',     cls: 'overall-partial', icon: '\u2248' },
  no_fit:      { label: 'Needs Review', cls: 'overall-none',    icon: '!' },
}

function RecSummaryCell({ rec }) {
  const overall = OVERALL_LABEL[rec.overallRecommendation] ?? OVERALL_LABEL.no_fit
  const criticalFit  = rec.criticalFit  ?? []
  const additionalFit = rec.additionalFit ?? []
  const metCount = criticalFit.filter(i => i.fit === 'met').length

  return (
    <div className="rec-report">
      <div className={`rec-report-header ${overall.cls}`}>
        <span className="rec-report-icon">{overall.icon}</span>
        <span className="rec-report-label">{overall.label}</span>
      </div>
      {criticalFit.length > 0 && (
        <div className="rec-bar-row">
          <div className="rec-bar">
            {criticalFit.map((item, i) => (
              <div
                key={i}
                className={`rec-bar-seg ${item.fit === 'met' ? 'rec-bar-met' : 'rec-bar-not-met'}`}
                title={`${item.requirement}: ${item.fit === 'met' ? 'met' : 'not met'}`}
              />
            ))}
          </div>
          <span className="rec-bar-count">{metCount}/{criticalFit.length}</span>
        </div>
      )}
      {additionalFit.length > 0 && (
        <div className="rec-dots-row">
          {additionalFit.map((item, i) => (
            <span
              key={i}
              className={`rec-dot rec-dot--${item.fit}`}
              title={`${item.requirement}: ${item.fit}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ApplicationsPage({ jobs, applications, onAddApplication, evaluationResults, model }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ jobId: '', applicantName: '', text: '' })
  const [recommendations, setRecommendations] = useState({})  // appId -> result
  const [loadingId, setLoadingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [modalApp, setModalApp] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.jobId || !form.text.trim()) return
    const app = {
      id: Date.now(),
      jobId: Number(form.jobId),
      applicantName: form.applicantName.trim() || 'Unnamed Applicant',
      text: form.text.trim(),
    }
    onAddApplication(app)
    setForm({ jobId: '', applicantName: '', text: '' })
    setShowAddForm(false)
  }

  const handleRecommend = async (app) => {
    const job = jobs.find(j => j.id === app.jobId)
    if (!job) return
    setLoadingId(app.id)
    setErrors(prev => ({ ...prev, [app.id]: null }))
    try {
      const criteria = evaluationResults[app.jobId] || null
      const result = await generateRecommendation(app.text, job, criteria, model)
      setRecommendations(prev => ({ ...prev, [app.id]: result }))
      setModalApp(app)
    } catch (err) {
      setErrors(prev => ({ ...prev, [app.id]: err.message }))
    } finally {
      setLoadingId(null)
    }
  }

  const openModal = (app) => {
    if (recommendations[app.id]) setModalApp(app)
  }

  return (
    <div className="applications-page">
      <div className="applications-header">
        <h2 className="list-title">
          Applications <span className="job-count">{applications.length}</span>
        </h2>
        <button className="btn-add-application" onClick={() => setShowAddForm(true)}>
          + Add Application
        </button>
      </div>

      {showAddForm && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowAddForm(false)}>
          <div className="modal modal--wide" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Add Application</h2>
                <p className="modal-subtitle">Paste an application and select a job</p>
              </div>
              <button className="modal-close" aria-label="Close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="add-app-form">
                <div className="form-field">
                  <label className="form-label">Job *</label>
                  {jobs.length === 0 ? (
                    <p className="form-hint">No jobs added yet. Go to the Jobs page to add a job first.</p>
                  ) : (
                    <select
                      className="form-select"
                      value={form.jobId}
                      onChange={e => setForm(f => ({ ...f, jobId: e.target.value }))}
                      required
                    >
                      <option value="">Select a job…</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-label">Applicant Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Jane Doe"
                    value={form.applicantName}
                    onChange={e => setForm(f => ({ ...f, applicantName: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Application Text *</label>
                  <textarea
                    className="form-textarea app-text-area"
                    placeholder="Paste resume, cover letter, or application responses here…"
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    rows={12}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!form.jobId || !form.text.trim()}
                  >
                    Add Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="job-list-empty">
          <div className="empty-icon">📄</div>
          <p>No applications yet. Click "+ Add Application" to get started.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="job-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>Application Preview</th>
                <th>Result</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const job = jobs.find(j => j.id === app.jobId)
                const rec = recommendations[app.id]
                return (
                  <tr key={app.id}>
                    <td className="col-title">{app.applicantName}</td>
                    <td className="col-title">{job?.title ?? '—'}</td>
                    <td className="col-desc">
                      <span className="desc-preview">
                        {app.text.length > 120 ? app.text.slice(0, 120) + '…' : app.text}
                      </span>
                    </td>
                    <td className="col-result">
                      {rec ? <RecSummaryCell rec={rec} /> : <span className="rec-pending">—</span>}
                    </td>
                    <td className="col-action">
                      <div className="action-cell">
                        {rec && (
                          <button className="btn-view" onClick={() => openModal(app)}>
                            View
                          </button>
                        )}
                        <button
                          className={`btn-generate ${loadingId === app.id ? 'loading' : ''}`}
                          onClick={() => handleRecommend(app)}
                          disabled={loadingId !== null}
                        >
                          {loadingId === app.id ? (
                            <><span className="spinner" />Evaluating…</>
                          ) : (
                            rec ? 'Re-evaluate' : 'AI Recommendation'
                          )}
                        </button>
                        {errors[app.id] && (
                          <span className="table-error" title={errors[app.id]}>⚠ Error</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalApp && recommendations[modalApp.id] && (
        <RecommendationModal
          app={modalApp}
          job={jobs.find(j => j.id === modalApp.jobId)}
          recommendation={recommendations[modalApp.id]}
          onClose={() => setModalApp(null)}
        />
      )}
    </div>
  )
}
