const STORAGE_KEY = 'devmode_features'

export const DEFAULT_FEATURES = {
  criteriaReuseEnabled: false,
}

let _cache = null

export function getDevFeatures() {
  if (_cache) return _cache
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      _cache = { ...DEFAULT_FEATURES, ...JSON.parse(stored) }
      return _cache
    }
  } catch {}
  _cache = { ...DEFAULT_FEATURES }
  return _cache
}

export function saveDevFeatures(features) {
  _cache = { ...DEFAULT_FEATURES, ...features }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(_cache))
}

export function resetDevFeatures() {
  _cache = null
  localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_FEATURES }
}
