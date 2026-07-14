import { useState } from 'react'
import { savePrompts, resetPrompts } from '../services/prompts'
import { saveDevFeatures, resetDevFeatures } from '../services/devFeatures'

export default function DevMode({ prompts, onPromptsChange, features = {}, onFeaturesChange = () => {} }) {
  const [saved, setSaved] = useState(false)

  const handleChange = (key, field, value) => {
    onPromptsChange({ ...prompts, [key]: { ...prompts[key], [field]: value } })
    setSaved(false)
  }

  const handleFeatureChange = (key, value) => {
    onFeaturesChange({ ...features, [key]: value })
    setSaved(false)
  }

  const handleSave = () => {
    savePrompts(prompts)
    saveDevFeatures(features)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    if (!window.confirm('Reset all Dev Mode settings to defaults? This cannot be undone.')) return
    const defaults = resetPrompts()
    const defaultFeatures = resetDevFeatures()
    onPromptsChange(defaults)
    onFeaturesChange(defaultFeatures)
  }

  return (
    <div className="devmode-page">
      <div className="devmode-header">
        <div>
          <h2 className="devmode-title">
            Dev Mode <span className="devmode-badge">FEATURES</span>
          </h2>
          <p className="devmode-subtitle">
            Enable experimental features and edit the prompts sent to the LLM. Save changes to persist them.
            Use <code className="devmode-code">{'{{variable}}'}</code> syntax for dynamic values.
          </p>
        </div>
        <div className="devmode-actions">
          <button className="btn-secondary" onClick={handleReset}>Reset to Defaults</button>
          <button className="btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="devmode-card devmode-feature-card">
        <div>
          <h3 className="devmode-prompt-label">Job Creation Features</h3>
          <p className="devmode-prompt-desc">
            Control experimental helpers available on the Add Job form.
          </p>
        </div>
        <label className="devmode-toggle-row">
          <input
            type="checkbox"
            checked={!!features.criteriaReuseEnabled}
            onChange={e => handleFeatureChange('criteriaReuseEnabled', e.target.checked)}
          />
          <span>
            <strong>Reuse criteria from similar previous jobs</strong>
            <small>Shows a checkbox on job creation that disables manual keywords and copies the matched job's criteria as is.</small>
          </span>
        </label>
      </div>

      <div className="devmode-prompts">
        {Object.entries(prompts).map(([key, prompt]) => (
          <div key={key} className="devmode-card">
            <div className="devmode-card-header">
              <h3 className="devmode-prompt-label">{prompt.label}</h3>
              <p className="devmode-prompt-desc">{prompt.description}</p>
              <p className="devmode-vars">
                <span className="devmode-vars-label">Variables:&nbsp;</span>
                {prompt.variables.split(', ').map(v => (
                  <code key={v} className="devmode-var-pill">{v}</code>
                ))}
              </p>
            </div>

            <div className="devmode-field">
              <label className="devmode-field-label">System</label>
              <textarea
                className="devmode-textarea devmode-textarea--system"
                value={prompt.system}
                onChange={e => handleChange(key, 'system', e.target.value)}
                rows={3}
              />
            </div>

            <div className="devmode-field">
              <label className="devmode-field-label">User</label>
              <textarea
                className="devmode-textarea devmode-textarea--user"
                value={prompt.user}
                onChange={e => handleChange(key, 'user', e.target.value)}
                rows={18}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
