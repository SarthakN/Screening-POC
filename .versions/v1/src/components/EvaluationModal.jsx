import { useEffect, useState } from 'react'
import { generateEvaluationGuideline, generateAdditionalGuideline } from '../services/llm'

export default function EvaluationModal({ job, result, model, onClose, onSave }) {
  // Merge LLM-returned additional requirements with the job's own list so
  // items are always shown even if the LLM omits the field.
  const mergedAdditional = (() => {
    const llmItems = result.additionalRequirements ?? []
    const llmMap = Object.fromEntries(llmItems.map(i => [i.additionalRequirement?.toLowerCase(), i]))
    return job.additionalRequirements.map(tag => {
      const match = llmMap[tag.value.toLowerCase()]
      return match ?? { additionalRequirement: tag.value, mentionedInJobDescription: false, strongfitguideline: null, partialfitguideline: null }
    })
  })()

  const [summaries, setSummaries] = useState(
    () => (result.requirements ?? []).map(item => item.evaluationGuideline ?? '')
  )
  const [additionalGuidelines, setAdditionalGuidelines] = useState(
    () => mergedAdditional.map(item => ({
      strongfitguideline: item.strongfitguideline ?? '',
      partialfitguideline: item.partialfitguideline ?? '',
    }))
  )
  const [assisting, setAssisting] = useState({})
  const [assistingAdditional, setAssistingAdditional] = useState({})

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleClose = () => {
    const updated = {
      ...result,
      requirements: (result.requirements ?? []).map((item, i) => ({
        ...item,
        evaluationGuideline: summaries[i] ?? item.evaluationGuideline,
      })),
      additionalRequirements: mergedAdditional.map((item, i) => ({
        ...item,
        strongfitguideline: additionalGuidelines[i]?.strongfitguideline ?? item.strongfitguideline,
        partialfitguideline: additionalGuidelines[i]?.partialfitguideline ?? item.partialfitguideline,
      })),
    }
    onSave?.(updated)
    onClose()
  }

  const updateSummary = (i, value) => {
    setSummaries(prev => prev.map((s, idx) => idx === i ? value : s))
  }

  const updateAdditional = (i, field, value) => {
    setAdditionalGuidelines(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g))
  }

  const handleAssist = async (i, requirement) => {
    setAssisting(prev => ({ ...prev, [i]: true }))
    try {
      const summary = await generateEvaluationGuideline(job, requirement, model)
      updateSummary(i, summary ?? '')
    } catch (err) {
      console.error(err)
    } finally {
      setAssisting(prev => ({ ...prev, [i]: false }))
    }
  }

  const handleAssistAdditional = async (i, requirement) => {
    setAssistingAdditional(prev => ({ ...prev, [i]: true }))
    try {
      const result = await generateAdditionalGuideline(job, requirement, model)
      updateAdditional(i, 'strongfitguideline', result.strongfitguideline ?? '')
      updateAdditional(i, 'partialfitguideline', result.partialfitguideline ?? '')
    } catch (err) {
      console.error(err)
    } finally {
      setAssistingAdditional(prev => ({ ...prev, [i]: false }))
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Evaluation Criteria</h2>
            <p className="modal-subtitle">{job.title}</p>
          </div>
          <button className="modal-close" onClick={handleClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          {/* ── Eligibility Requirements ── */}
          {(result.requirements?.length > 0) && (
            <>
              <p className="criteria-section-label">Eligibility Requirements</p>
              <div className="criteria-list">
                {result.requirements.map((item, i) => (
                  <div key={i} className="criteria-card">
                    <div className="criteria-header">
                      <span className="criteria-index">{i + 1}</span>
                      <span className="criteria-requirement">{item.criticalRequirement}</span>
                      <span className={`criteria-badge ${item.mentionedInJobDescription ? 'badge-yes' : 'badge-no'}`}>
                        {item.mentionedInJobDescription ? 'In JD' : 'Not in JD'}
                      </span>
                    </div>
                    <div className="criteria-evaluation">
                      <div className="summary-input-row">
                        <textarea
                          className="criteria-summary-input"
                          value={summaries[i]}
                          placeholder="Enter evaluation guideline…"
                          rows={2}
                          onChange={e => updateSummary(i, e.target.value)}
                        />
                        <button
                          type="button"
                          className={`btn-assist ${assisting[i] ? 'loading' : ''}`}
                          onClick={() => handleAssist(i, item.criticalRequirement)}
                          disabled={assisting[i]}
                          title="Generate guideline from job description"
                        >
                          {assisting[i]
                            ? <><span className="spinner" />Generating…</>
                            : <><span className="assist-icon">✨</span>Assist</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Additional Requirements ── */}
          {(mergedAdditional.length > 0) && (
            <>
              <div className="criteria-section-divider" />
              <p className="criteria-section-label">Additional Requirements</p>
              <div className="criteria-list">
                {mergedAdditional.map((item, i) => (
                  <div key={i} className="criteria-card">
                    <div className="criteria-header">
                      <span className="criteria-index">{i + 1}</span>
                      <span className="criteria-requirement">{item.additionalRequirement}</span>
                      <span className={`criteria-badge ${item.mentionedInJobDescription ? 'badge-yes' : 'badge-no'}`}>
                        {item.mentionedInJobDescription ? 'In JD' : 'Not in JD'}
                      </span>
                    </div>
                    <div className="criteria-evaluation">
                      <div className="fit-row">
                        <div className="fit-field">
                          <span className="fit-label fit-label--strong">Strong fit</span>
                          <textarea
                            className="criteria-summary-input"
                            value={additionalGuidelines[i]?.strongfitguideline ?? ''}
                            placeholder="Strong fit guideline…"
                            rows={2}
                            onChange={e => updateAdditional(i, 'strongfitguideline', e.target.value)}
                          />
                        </div>
                        <div className="fit-field">
                          <span className="fit-label fit-label--partial">Partial fit</span>
                          <textarea
                            className="criteria-summary-input"
                            value={additionalGuidelines[i]?.partialfitguideline ?? ''}
                            placeholder="Partial fit guideline…"
                            rows={2}
                            onChange={e => updateAdditional(i, 'partialfitguideline', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className={`btn-assist fit-assist ${assistingAdditional[i] ? 'loading' : ''}`}
                          onClick={() => handleAssistAdditional(i, item.additionalRequirement)}
                          disabled={assistingAdditional[i]}
                          title="Generate strong and partial fit guidelines"
                        >
                          {assistingAdditional[i]
                            ? <><span className="spinner" />Generating…</>
                            : <><span className="assist-icon">✨</span>Assist</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {(!result.requirements?.length && !result.additionalRequirements?.length) && (
            <p className="modal-empty">No requirements were found to evaluate.</p>
          )}
        </div>
      </div>
    </div>
  )
}
