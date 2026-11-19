import { afterEach, describe, expect, it, vi } from 'vitest'
import { isStorageAvailable, neutralizeBlockedStorage, readJson, removeKey, writeJson } from './localStore'

function fakeStorage(options: { quota?: boolean } = {}) {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options.quota) throw new Error('QuotaExceededError')
      values.set(key, value)
    },
    removeItem: (key: string) => values.delete(key),
  }
}

function blockStorage() {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('SecurityError')
    },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: undefined })
})

describe('readJson', () => {
  it('reads a stored value', () => {
    const storage = fakeStorage()
    storage.values.set('pacmac:sound', '{"muted":true}')
    vi.stubGlobal('localStorage', storage)
    expect(readJson('pacmac:sound')).toEqual({ muted: true })
  })

  it('gives undefined for a missing key or a corrupted value', () => {
    const storage = fakeStorage()
    storage.values.set('pacmac:sound', '{muted')
    vi.stubGlobal('localStorage', storage)
    expect(readJson('pacmac:other')).toBeUndefined()
    expect(readJson('pacmac:sound')).toBeUndefined()
  })

  it('gives undefined when storage is blocked', () => {
    blockStorage()
    expect(readJson('pacmac:sound')).toBeUndefined()
  })
})

describe('writeJson', () => {
  it('stores a value as JSON', () => {
    const storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
    expect(writeJson('pacmac:sound', { muted: false })).toBe(true)
    expect(storage.values.get('pacmac:sound')).toBe('{"muted":false}')
  })

  it('answers false when storage is full or blocked', () => {
    vi.stubGlobal('localStorage', fakeStorage({ quota: true }))
    expect(writeJson('pacmac:sound', { muted: false })).toBe(false)
    blockStorage()
    expect(writeJson('pacmac:sound', { muted: false })).toBe(false)
    expect(removeKey('pacmac:sound')).toBe(false)
  })
})

describe('storage availability', () => {
  it('is available when a probe key can be written and removed', () => {
    const storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
    expect(isStorageAvailable()).toBe(true)
    expect(storage.values.size).toBe(0)
  })

  it('replaces a blocked storage by null', () => {
    blockStorage()
    neutralizeBlockedStorage()
    expect(globalThis.localStorage).toBeNull()
    expect(isStorageAvailable()).toBe(false)
  })

  it('leaves a healthy storage alone', () => {
    const storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
    neutralizeBlockedStorage()
    expect(globalThis.localStorage).toBe(storage)
  })
})
