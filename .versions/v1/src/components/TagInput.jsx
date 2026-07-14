import { useState } from 'react'
import { generateSkillSuggestions } from '../services/llm'

const PRESET_TAGS = ['Education', 'Experience', 'Certification', 'Location', 'Background Verification', 'Skills']

export default function TagInput({ label, tags, onChange, jobTitle, jobDescription, disabled = false }) {
  const [inputValue, setInputValue] = useState('')
  const [skillSuggestions, setSkillSuggestions] = useState([])
  const [loadingSkills, setLoadingSkills] = useState(false)
  const [skillError, setSkillError] = useState(null)

  const togglePreset = (tag) => {
    if (disabled) return
    const exists = tags.find(t => t.value === tag && t.preset)
    if (exists) {
      onChange(tags.filter(t => !(t.value === tag && t.preset)))
    } else {
      onChange([...tags, { value: tag, preset: true }])
    }
  }

  const handleGenerateSkills = async () => {
    if (disabled) return
    if (!jobDescription?.trim()) {
      setSkillError('Add a job description first.')
      return
    }
    setLoadingSkills(true)
    setSkillError(null)
    setSkillSuggestions([])
    try {
      const skills = await generateSkillSuggestions(jobTitle || '', jobDescription)
      setSkillSuggestions(skills)
    } catch (err) {
      setSkillError(err.message)
    } finally {
      setLoadingSkills(false)
    }
  }

  const toggleSuggestion = (skill) => {
    if (disabled) return
    const exists = tags.find(t => t.value === skill)
    if (exists) {
      onChange(tags.filter(t => t.value !== skill))
    } else {
      onChange([...tags, { value: skill, preset: false }])
    }
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault()
      const val = inputValue.trim().replace(/,$/, '')
      if (val && !tags.find(t => t.value === val)) {
        onChange([...tags, { value: val, preset: false }])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (index) => {
    if (disabled) return
    onChange(tags.filter((_, i) => i !== index))
  }

  const isPresetActive = (tag) => tags.some(t => t.value === tag && t.preset)

  return (
    <div className={`tag-input-section ${disabled ? 'tag-input-section--disabled' : ''}`}>
      <h3 className="section-label">{label}</h3>

      <div className="preset-tags">
        {PRESET_TAGS.map(tag => (
          <button
            key={tag}
            type="button"
            className={`preset-tag ${isPresetActive(tag) ? 'active' : ''}`}
            onClick={() => togglePreset(tag)}
            disabled={disabled}
          >
            {isPresetActive(tag) && <span className="check-icon">✓</span>}
            {tag}
            {tag === 'Skills' && (
              <span
                className={`skill-ai-btn ${loadingSkills ? 'skill-ai-btn--loading' : ''}`}
                title="Generate skill suggestions from job description"
                onClick={e => { e.stopPropagation(); if (!disabled) handleGenerateSkills() }}
              >
                {loadingSkills ? <span className="spinner spinner--xs" /> : '✨'}
              </span>
            )}
          </button>
        ))}
      </div>

      {skillSuggestions.length > 0 && (
        <div className="skill-suggestions">
          <p className="skill-suggestions-label">Suggested skills — click to add</p>
          <div className="skill-suggestions-list">
            {skillSuggestions.map(skill => {
              const selected = !!tags.find(t => t.value === skill)
              return (
                <button
                  key={skill}
                  type="button"
                  className={`skill-suggestion-tag ${selected ? 'selected' : ''}`}
                  onClick={() => toggleSuggestion(skill)}
                  disabled={disabled}
                >
                  {selected && <span>✓ </span>}{skill}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {skillError && <p className="skill-error">{skillError}</p>}

      <div className="custom-tag-input-wrapper">
        <div className="tag-pills-container">
          {tags.filter(t => !t.preset).map((tag, i) => (
            <span key={i} className="tag-pill">
              {tag.value}
              <button
                type="button"
                className="tag-remove"
                onClick={() => removeTag(tags.indexOf(tag))}
                aria-label={`Remove ${tag.value}`}
                disabled={disabled}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            className="tag-text-input"
            placeholder={tags.filter(t => !t.preset).length === 0 ? 'Type keywords…' : ''}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>
        <p className="input-hint">
          {disabled ? 'Keyword selection is disabled while criteria reuse is selected' : 'Press Enter or comma to add a keyword'}
        </p>
      </div>
    </div>
  )
}
