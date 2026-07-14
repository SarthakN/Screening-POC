import { useState } from 'react'
import { generateEvaluationCriteria } from '../services/llm'
import EvaluationModal from './EvaluationModal'

export default function JobList({ jobs, model, evaluationResults, setEvaluationResults }) {
  const [loadingId, setLoadingId] = useState(null)
  const [errors, setErrors] = useState({})     // jobId -> error message
  const [modalJob, setModalJob] = useState(null)

  const handleGenerate = async (job) => {
    setLoadingId(job.id)
    setErrors(prev => ({ ...prev, [job.id]: null }))
    try {
      const result = await generateEvaluationCriteria(job, model)
      setEvaluationResults(prev => ({ ...prev, [job.id]: result }))
      setModalJob(job)
    } catch (err) {
      setErrors(prev => ({ ...prev, [job.id]: err.message }))
    } finally {
      setLoadingId(null)
    }
  }

  const openModal = (job) => {
    if (evaluationResults[job.id]) setModalJob(job)
  }

  if (jobs.length === 0) {
    return (
      <div className="job-list-empty">
        <div className="empty-icon">📋</div>
        <p>No jobs added yet. Fill in the form above to get started.</p>
      </div>
    )
  }

  return (
    <div className="job-list">
      <h2 className="list-title">
        Jobs <span className="job-count">{jobs.length}</span>
      </h2>

      <div className="table-wrapper">
        <table className="job-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Description</th>
              <th>Eligibility Requirements</th>
              <th>Additional Requirements</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td className="col-title">{job.title}</td>
                <td className="col-desc">
                  <span className="desc-preview">
                    {job.description.length > 120
                      ? job.description.slice(0, 120) + '…'
                      : job.description}
                  </span>
                </td>
                <td className="col-tags">
                  <TagPills tags={job.criticalRequirements} variant="critical" />
                </td>
                <td className="col-tags">
                  <TagPills tags={job.additionalRequirements} variant="additional" />
                </td>
                <td className="col-action">
                  <div className="action-cell">
                    {evaluationResults[job.id] ? (
                      <button
                        className="btn-view"
                        onClick={() => openModal(job)}
                      >
                        View Criteria
                      </button>
                    ) : null}

                    <button
                      className={`btn-generate ${loadingId === job.id ? 'loading' : ''}`}
                      onClick={() => handleGenerate(job)}
                      disabled={loadingId !== null}
                    >
                      {loadingId === job.id ? (
                        <><span className="spinner" />Generating…</>
                      ) : (
                        evaluationResults[job.id] ? 'Regenerate' : 'Generate'
                      )}
                    </button>

                    {errors[job.id] && (
                      <span className="table-error" title={errors[job.id]}>⚠ Error</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalJob && evaluationResults[modalJob.id] && (
        <EvaluationModal
          job={modalJob}
          result={evaluationResults[modalJob.id]}
          model={model}
          onSave={(updated) => setEvaluationResults(prev => ({ ...prev, [modalJob.id]: updated }))}
          onClose={() => setModalJob(null)}
        />
      )}
    </div>
  )
}

function TagPills({ tags, variant }) {
  if (!tags.length) return <span className="no-tags">—</span>
  return (
    <div className="pill-group">
      {tags.map((tag, i) => (
        <span key={i} className={`tpill tpill-${variant}`}>{tag.value}</span>
      ))}
    </div>
  )
}
