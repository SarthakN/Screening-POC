import { useState, useRef } from 'react'
import { scriptToSpeech, splitIntoChunks } from '../services/tts'

const TTS_MODELS = ['tts-1', 'tts-1-hd']
const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

export default function TTSPage() {
  const [script, setScript] = useState('')
  const [ttsModel, setTtsModel] = useState('tts-1')
  const [voice, setVoice] = useState('alloy')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)
  const prevUrlRef = useRef(null)

  const chunkCount = script.trim() ? splitIntoChunks(script).length : 0

  const handleGenerate = async () => {
    if (!script.trim()) return
    setError(null)
    setLoading(true)
    setProgress({ done: 0, total: 0 })

    // Revoke previous blob URL
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = null
      setAudioUrl(null)
    }

    try {
      const blob = await scriptToSpeech(script, ttsModel, voice, (done, total) => {
        setProgress({ done, total })
      })
      const url = URL.createObjectURL(blob)
      prevUrlRef.current = url
      setAudioUrl(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = 'tts-output.mp3'
    a.click()
  }

  return (
    <div className="tts-page">
      <div className="tts-header">
        <h2 className="tts-title">Text to Speech</h2>
        <p className="tts-subtitle">Paste your script and convert it to audio using OpenAI TTS.</p>
      </div>

      <div className="tts-controls">
        <div className="tts-control-group">
          <label className="tts-label">Model</label>
          <select
            className="tts-select"
            value={ttsModel}
            onChange={e => setTtsModel(e.target.value)}
            disabled={loading}
          >
            {TTS_MODELS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="tts-control-group">
          <label className="tts-label">Voice</label>
          <select
            className="tts-select"
            value={voice}
            onChange={e => setVoice(e.target.value)}
            disabled={loading}
          >
            {VOICES.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="tts-script-area">
        <label className="tts-label">
          Script
          {chunkCount > 0 && (
            <span className="tts-chunk-badge">{chunkCount} batch{chunkCount !== 1 ? 'es' : ''}</span>
          )}
        </label>
        <textarea
          className="tts-textarea"
          placeholder="Paste your script here..."
          value={script}
          onChange={e => setScript(e.target.value)}
          disabled={loading}
          rows={16}
        />
      </div>

      {error && <div className="tts-error">{error}</div>}

      <div className="tts-actions">
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !script.trim()}
        >
          {loading ? 'Generating…' : 'Generate Speech'}
        </button>
      </div>

      {loading && progress.total > 0 && (
        <div className="tts-progress">
          <div className="tts-progress-label">
            Processing batch {progress.done} / {progress.total}
          </div>
          <div className="tts-progress-bar-track">
            <div
              className="tts-progress-bar-fill"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="tts-result">
          <audio ref={audioRef} controls src={audioUrl} className="tts-audio" />
          <button className="btn-secondary" onClick={handleDownload}>
            Download MP3
          </button>
        </div>
      )}
    </div>
  )
}
