import { useEffect } from 'react'

const FIT_CONFIG = {
  met:     { label: 'Met',          cls: 'badge-met' },
  not_met: { label: 'Not Met',      cls: 'badge-not-met' },
  strong:  { label: 'Strong Fit',   cls: 'badge-strong' },
  partial: { label: 'Partial Fit',  cls: 'badge-partial' },
  none:    { label: 'No Fit',       cls: 'badge-none' },
}

const OVERALL_CONFIG = {
  strong_fit:  { label: 'FastTrack',   cls: 'overall-strong' },
  partial_fit: { label: 'Eligible',    cls: 'overall-partial' },
  no_fit:      { label: 'Needs Review', cls: 'overall-none' },
}

export default function RecommendationModal({ app, job, recommendation, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const overall = OVERALL_CONFIG[recommendation.overallRecommendation] ?? OVERALL_CONFIG.no_fit

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">AI Recommendation</h2>
            <p className="modal-subtitle">{app.applicantName} · {job?.title}</p>
          </div>
          <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="rec-overall">
            <span className={`overall-badge ${overall.cls}`}>{overall.label}</span>
            {recommendation.summary && (
              <p className="rec-summary">{recommendation.summary}</p>
            )}
          </div>

          {recommendation.criticalFit?.length > 0 && (
            <>
              <p className="criteria-section-label">Eligibility Requirements</p>
              <div className="criteria-list">
                {recommendation.criticalFit.map((item, i) => {
                  const cfg = FIT_CONFIG[item.fit] ?? FIT_CONFIG.not_met
                  return (
                    <div key={i} className="criteria-card rec-card">
                      <div className="criteria-header">
                        <span className="criteria-index">{i + 1}</span>
                        <span className="criteria-requirement">{item.requirement}</span>
                        <span className={`criteria-badge ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <p className="rec-reasoning">{item.reasoning}</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {recommendation.additionalFit?.length > 0 && (
            <>
              <div className="criteria-section-divider" />
              <p className="criteria-section-label">Additional Requirements</p>
              <div className="criteria-list">
                {recommendation.additionalFit.map((item, i) => {
                  const cfg = FIT_CONFIG[item.fit] ?? FIT_CONFIG.none
                  return (
                    <div key={i} className="criteria-card rec-card">
                      <div className="criteria-header">
                        <span className="criteria-index">{i + 1}</span>
                        <span className="criteria-requirement">{item.requirement}</span>
                        <span className={`criteria-badge ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <p className="rec-reasoning">{item.reasoning}</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
