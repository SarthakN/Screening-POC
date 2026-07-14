const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech'
const CHUNK_SIZE = 4000

/**
 * Split text into chunks at sentence boundaries, keeping each chunk under CHUNK_SIZE chars.
 */
export function splitIntoChunks(text, maxChars = CHUNK_SIZE) {
  const sentences = text.match(/[^.!?\n]+[.!?\n]+|\s*\n\s*\n\s*|[^.!?\n]+$/g) || [text]
  const chunks = []
  let current = ''

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxChars && current.length > 0) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

/**
 * Convert a single text chunk to audio using OpenAI TTS API.
 * Returns an ArrayBuffer of the audio data.
 */
async function convertChunkToSpeech(text, model, voice) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key is not configured. Set VITE_OPENAI_API_KEY in your .env file.')
  }

  const response = await fetch(OPENAI_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: text, voice }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `TTS API error ${response.status}`)
  }

  return response.arrayBuffer()
}

/**
 * Concatenate multiple ArrayBuffers into one.
 */
function concatBuffers(buffers) {
  const totalLength = buffers.reduce((sum, b) => sum + b.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset)
    offset += buf.byteLength
  }
  return result.buffer
}

/**
 * Convert a full script to speech, in batches.
 * Calls onProgress(completed, total) after each chunk.
 * Returns a Blob of the final concatenated MP3 audio.
 */
export async function scriptToSpeech(script, model, voice, onProgress) {
  const chunks = splitIntoChunks(script)
  const total = chunks.length
  const audioBuffers = []

  for (let i = 0; i < chunks.length; i++) {
    const buffer = await convertChunkToSpeech(chunks[i], model, voice)
    audioBuffers.push(buffer)
    onProgress(i + 1, total)
  }

  const combined = concatBuffers(audioBuffers)
  return new Blob([combined], { type: 'audio/mpeg' })
}
