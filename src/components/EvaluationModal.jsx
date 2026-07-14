import { useEffect, useState } from 'react'

export default function EvaluationModal({
  job,
  result,
  model,
  regenerating = false,
  regenerateError = null,
  onRegenerate,
  showRegenerate = true,
  showFooter = false,
  footerConfirmLabel = 'Save',
  footerCancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  onSave,
}) {
  const [eligibilityItems, setEligibilityItems] = useState(() =>
    (result.requirements ?? []).map(item => ({
      criticalRequirement: item.criticalRequirement,
      mentionedInJobDescription: Boolean(item.mentionedInJobDescription),
      evaluationGuideline: item.evaluationGuideline ?? '',
    }))
  )

  const [additionalItems, setAdditionalItems] = useState(() =>
    (result.additionalRequirements ?? []).map(item => ({
      additionalRequirement: item.additionalRequirement,
      mentionedInJobDescription: Boolean(item.mentionedInJobDescription),
      strongfitguideline: item.strongfitguideline ?? '',
      partialfitguideline: item.partialfitguideline ?? '',
    }))
  )

  useEffect(() => {
    setEligibilityItems(
      (result.requirements ?? []).map(item => ({
        criticalRequirement: item.criticalRequirement,
        mentionedInJobDescription: Boolean(item.mentionedInJobDescription),
        evaluationGuideline: item.evaluationGuideline ?? '',
      }))
    )

    setAdditionalItems(
      (result.additionalRequirements ?? []).map(item => ({
        additionalRequirement: item.additionalRequirement,
        mentionedInJobDescription: Boolean(item.mentionedInJobDescription),
        strongfitguideline: item.strongfitguideline ?? '',
        partialfitguideline: item.partialfitguideline ?? '',
      }))
    )
  }, [result])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  const buildUpdated = () => ({
    ...result,
    requirements: eligibilityItems,
    additionalRequirements: additionalItems,
  })

  const handleClose = () => {
    if (showFooter && onCancel) {
      onCancel()
      return
    }
    const updated = buildUpdated()
    onSave?.(updated)
    onClose?.()
  }

  const handleConfirm = () => {
    const updated = buildUpdated()
    onSave?.(updated)
    onConfirm?.(updated)
    onClose?.()
  }

  const updateSummary = (i, value) => {
    setEligibilityItems(prev => prev.map((item, idx) => idx === i ? { ...item, evaluationGuideline: value } : item))
  }

  const updateAdditional = (i, field, value) => {
    setAdditionalItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const moveToAdditional = (i) => {
    const item = eligibilityItems[i]
    if (!item) return

    setEligibilityItems(prev => prev.filter((_, idx) => idx !== i))
    setAdditionalItems(prev => ([
      ...prev,
      {
        additionalRequirement: item.criticalRequirement,
        mentionedInJobDescription: item.mentionedInJobDescription,
        strongfitguideline: item.evaluationGuideline ?? '',
        partialfitguideline: '',
      },
    ]))
  }

  const moveToEligibility = (i) => {
    const item = additionalItems[i]
    if (!item) return

    setAdditionalItems(prev => prev.filter((_, idx) => idx !== i))
    setEligibilityItems(prev => ([
      ...prev,
      {
        criticalRequirement: item.additionalRequirement,
        mentionedInJobDescription: item.mentionedInJobDescription,
        evaluationGuideline: item.strongfitguideline || item.partialfitguideline || '',
      },
    ]))
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Evaluation Criteria</h2>
            <p className="modal-subtitle">{job.title}</p>
            {regenerateError && <p className="modal-error">{regenerateError}</p>}
          </div>
          <div className="modal-header-actions">
            {showRegenerate && !!onRegenerate && (
              <button
                type="button"
                className={`btn-generate ${regenerating ? 'loading' : ''}`}
                onClick={onRegenerate}
                disabled={regenerating}
              >
                {regenerating ? <><span className="spinner" />Regenerating…</> : 'Regenerate'}
              </button>
            )}
            <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="modal-body">
          {/* ── Eligibility Requirements ── */}
          {(eligibilityItems.length > 0) && (
            <>
              <p className="criteria-section-label">Eligibility Requirements</p>
              <div className="criteria-list">
                {eligibilityItems.map((item, i) => (
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
                          value={item.evaluationGuideline}
                          placeholder="Enter evaluation guideline…"
                          rows={2}
                          onChange={e => updateSummary(i, e.target.value)}
                        />
                        <button type="button" className="btn-move" onClick={() => moveToAdditional(i)}>
                          Move to Additional
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Additional Requirements ── */}
          {(additionalItems.length > 0) && (
            <>
              <div className="criteria-section-divider" />
              <p className="criteria-section-label">Additional Requirements</p>
              <div className="criteria-list">
                {additionalItems.map((item, i) => (
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
                            value={item.strongfitguideline ?? ''}
                            placeholder="Strong fit guideline…"
                            rows={2}
                            onChange={e => updateAdditional(i, 'strongfitguideline', e.target.value)}
                          />
                        </div>
                        <div className="fit-field">
                          <span className="fit-label fit-label--partial">Partial fit</span>
                          <textarea
                            className="criteria-summary-input"
                            value={item.partialfitguideline ?? ''}
                            placeholder="Partial fit guideline…"
                            rows={2}
                            onChange={e => updateAdditional(i, 'partialfitguideline', e.target.value)}
                          />
                        </div>
                        <button type="button" className="btn-move" onClick={() => moveToEligibility(i)}>
                          Move to Eligibility
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {(!eligibilityItems.length && !additionalItems.length) && (
            <p className="modal-empty">No requirements were found to evaluate.</p>
          )}
        </div>
        {showFooter && (
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>{footerCancelLabel}</button>
            <button type="button" className="btn-primary" onClick={handleConfirm}>{footerConfirmLabel}</button>
          </div>
        )}
      </div>
    </div>
  )
}
