/** Prefix of every key the application stores. */
export const STORAGE_PREFIX = 'pacmac:'

const PROBE_KEY = `${STORAGE_PREFIX}probe`

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/** Value stored as JSON under a key; undefined when missing, unreadable or when storage is unavailable. */
export function readJson(key: string): unknown {
  try {
    const raw = storage()?.getItem(key)
    return raw === null || raw === undefined ? undefined : (JSON.parse(raw) as unknown)
  } catch {
    return undefined
  }
}

/** Stores a value as JSON; false instead of an error when storage is unavailable or full. */
export function writeJson(key: string, value: unknown): boolean {
  try {
    const target = storage()
    if (!target) return false
    target.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** Removes a key; false instead of an error when storage is unavailable. */
export function removeKey(key: string): boolean {
  try {
    const target = storage()
    if (!target) return false
    target.removeItem(key)
    return true
  } catch {
    return false
  }
}

/** Whether storage accepts writing and removing a probe key. */
export function isStorageAvailable(): boolean {
  try {
    const target = storage()
    if (!target) return false
    target.setItem(PROBE_KEY, '1')
    target.removeItem(PROBE_KEY)
    return true
  } catch {
    return false
  }
}

/** Replaces by null a storage whose mere access throws (site data blocked), so that nothing else throws later. */
export function neutralizeBlockedStorage(): void {
  try {
    void globalThis.localStorage
  } catch {
    Object.defineProperty(globalThis, 'localStorage', { value: null, configurable: true, writable: true })
  }
}
