import { useEffect, useState } from 'react'
import TagInput from './TagInput'
import EvaluationModal from './EvaluationModal'
import { findSimilarCriteriaJobs, generateEvaluationCriteria } from '../services/llm'

const emptyForm = {
  title: '',
  description: '',
  criticalRequirements: [],
  additionalRequirements: [],
}

export default function AddJobForm({
  onAddJob,
  jobs = [],
  evaluationResults = {},
  criteriaReuseEnabled = false,
  model,
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [reuseCriteria, setReuseCriteria] = useState(false)
  const [reusingCriteria, setReusingCriteria] = useState(false)
  const [generatingCriteria, setGeneratingCriteria] = useState(false)
  const [reuseChoices, setReuseChoices] = useState(null)
  const [selectedReuseJobId, setSelectedReuseJobId] = useState('')
  const [criteriaModal, setCriteriaModal] = useState(null)
  const reuseActive = criteriaReuseEnabled && reuseCriteria

  useEffect(() => {
    if (!criteriaReuseEnabled && reuseCriteria) {
      setReuseCriteria(false)
      setReuseChoices(null)
      setSelectedReuseJobId('')
    }
  }, [criteriaReuseEnabled, reuseCriteria])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Job title is required'
    if (!form.description.trim()) e.description = 'Job description is required'
    return e
  }

  const handleReuseChange = (checked) => {
    setReuseCriteria(checked)
    setErrors(prev => ({ ...prev, reuse: null }))
    setReuseChoices(null)
    setSelectedReuseJobId('')
    if (checked) {
      setForm(prev => ({
        ...prev,
        criticalRequirements: [],
        additionalRequirements: [],
      }))
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setReuseCriteria(false)
    setReuseChoices(null)
    setSelectedReuseJobId('')
    setErrors({})
  }

  const updateForm = (updates) => {
    setForm(prev => ({ ...prev, ...updates }))
    setReuseChoices(null)
    setSelectedReuseJobId('')
    setErrors(prev => ({ ...prev, reuse: null }))
  }

  const addJobWithCriteria = (draftJob, criteria) => {
    const requirements = criteria?.requirements ?? []
    const additionalRequirements = criteria?.additionalRequirements ?? []
    const job = {
      ...draftJob,
      id: Date.now(),
      criticalRequirements: requirements.map(item => ({
        value: item.criticalRequirement,
        preset: false,
        reused: true,
      })),
      additionalRequirements: additionalRequirements.map(item => ({
        value: item.additionalRequirement,
        preset: false,
        reused: true,
      })),
    }
    onAddJob(job, { requirements, additionalRequirements })
    resetForm()
    setCriteriaModal(null)
  }

  const openCriteriaModal = (draftJob, criteria) => {
    setCriteriaModal({ draftJob, criteria })
  }

  const handleGenerateFromDraft = async (draftJob) => {
    setGeneratingCriteria(true)
    setErrors(prev => ({ ...prev, criteria: null }))
    try {
      const result = await generateEvaluationCriteria(draftJob, model)
      openCriteriaModal(draftJob, result)
    } catch (err) {
      setErrors(prev => ({ ...prev, criteria: err.message }))
    } finally {
      setGeneratingCriteria(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    if (reuseActive) {
      setReusingCriteria(true)
      setErrors(prev => ({ ...prev, reuse: null }))
      try {
        const draftJob = {
          ...form,
          criticalRequirements: [],
          additionalRequirements: [],
        }
        const matches = findSimilarCriteriaJobs(draftJob, jobs, evaluationResults)

        if (!matches.length) {
          setErrors(prev => ({
            ...prev,
            reuse: 'No similar previous job with criteria was found. Uncheck reuse to enter keywords manually.',
          }))
          return
        }

        if (matches.length === 1) {
          openCriteriaModal(draftJob, matches[0].criteria)
          return
        }

        setReuseChoices({ draftJob, matches })
        setSelectedReuseJobId(String(matches[0].job.id))
      } catch (err) {
        setErrors(prev => ({ ...prev, reuse: err.message }))
      } finally {
        setReusingCriteria(false)
      }
      return
    }

    handleGenerateFromDraft({ ...form })
  }

  const handleConfirmReuseChoice = () => {
    const selectedMatch = reuseChoices?.matches.find(match => String(match.job.id) === selectedReuseJobId)
    if (!selectedMatch) {
      setErrors(prev => ({ ...prev, reuse: 'Select a previous job to import criteria from.' }))
      return
    }
    openCriteriaModal(reuseChoices.draftJob, selectedMatch.criteria)
    setReuseChoices(null)
  }

  return (
    <form className="add-job-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Add a Job</h2>

      <div className="form-group">
        <label htmlFor="job-title" className="form-label">Job Title</label>
        <input
          id="job-title"
          type="text"
          className={`form-input ${errors.title ? 'input-error' : ''}`}
          placeholder="e.g. Senior Product Designer"
          value={form.title}
          onChange={e => updateForm({ title: e.target.value })}
        />
        {errors.title && <span className="error-msg">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="job-desc" className="form-label">Job Description</label>
        <textarea
          id="job-desc"
          className={`form-textarea ${errors.description ? 'input-error' : ''}`}
          placeholder="Describe the role, responsibilities, and context…"
          rows={4}
          value={form.description}
          onChange={e => updateForm({ description: e.target.value })}
        />
        {errors.description && <span className="error-msg">{errors.description}</span>}
      </div>

      {criteriaReuseEnabled && (
        <div className="reuse-option">
          <label className="reuse-checkbox">
            <input
              type="checkbox"
              checked={reuseCriteria}
              onChange={e => handleReuseChange(e.target.checked)}
              disabled={reusingCriteria}
            />
            <span>
              <strong>Reuse criteria from similar previous jobs</strong>
              <small>Disables keyword selection and copies the matched job's criteria as is.</small>
            </span>
          </label>
          {errors.reuse && <p className="reuse-error">{errors.reuse}</p>}
          {reuseChoices && (
            <div className="reuse-choices">
              <p className="reuse-choices-title">Select the closest previous job</p>
              <div className="reuse-choice-list">
                {reuseChoices.matches.map(match => {
                  const selected = selectedReuseJobId === String(match.job.id)
                  return (
                  <label key={match.job.id} className={`reuse-choice ${selected ? 'reuse-choice--selected' : ''}`}>
                    <input
                      type="radio"
                      name="reuse-source-job"
                      value={match.job.id}
                      checked={selected}
                      onChange={e => setSelectedReuseJobId(e.target.value)}
                    />
                    <span className="reuse-choice-content">
                      <span className="reuse-choice-title">{match.job.title}</span>
                      <span className="reuse-choice-meta">
                        {match.criteria.requirements.length} eligibility, {match.criteria.additionalRequirements.length} additional
                      </span>
                      <span className="reuse-choice-desc">
                        {[
                          ...match.criteria.requirements.map(r => r.criticalRequirement),
                          ...match.criteria.additionalRequirements.map(r => r.additionalRequirement),
                        ].join(' · ')}
                      </span>
                    </span>
                  </label>
                  )
                })}
              </div>
              <div className="reuse-choice-actions">
                <button type="button" className="btn-secondary" onClick={() => setReuseChoices(null)}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleConfirmReuseChoice}>
                  Import Criteria
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="requirements-grid">
        <div className="requirement-card critical">
          <TagInput
            label="Eligibility Requirements"
            tags={form.criticalRequirements}
            onChange={tags => setForm({ ...form, criticalRequirements: tags })}
            jobTitle={form.title}
            jobDescription={form.description}
            disabled={reuseActive}
          />
        </div>
        <div className="requirement-card additional">
          <TagInput
            label="Additional Requirements"
            tags={form.additionalRequirements}
            onChange={tags => setForm({ ...form, additionalRequirements: tags })}
            jobTitle={form.title}
            jobDescription={form.description}
            disabled={reuseActive}
          />
        </div>
      </div>

      <div className="form-footer">
        <button type="submit" className="btn-primary" disabled={reusingCriteria || generatingCriteria}>
          {reusingCriteria
            ? 'Matching previous job...'
            : generatingCriteria
              ? 'Generating Criteria...'
              : 'Generate Criteria'}
        </button>
      </div>

      {errors.criteria && <p className="reuse-error">{errors.criteria}</p>}

      {criteriaModal && (
        <EvaluationModal
          job={criteriaModal.draftJob}
          result={criteriaModal.criteria}
          model={model}
          showRegenerate={false}
          showFooter={true}
          footerConfirmLabel="Add Job"
          footerCancelLabel="Cancel"
          onSave={(updated) => setCriteriaModal(prev => prev ? { ...prev, criteria: updated } : prev)}
          onConfirm={(updated) => addJobWithCriteria(criteriaModal.draftJob, updated)}
          onCancel={() => setCriteriaModal(null)}
          onClose={() => setCriteriaModal(null)}
        />
      )}
    </form>
  )
}
