import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSoundPreference, saveSoundPreference } from './soundPreference'

function fakeStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('sound preference', () => {
  it('means sound on when missing or unreadable', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    expect(loadSoundPreference()).toEqual({ muted: false })
    vi.stubGlobal('localStorage', fakeStorage({ 'pacmac:sound': '"oui"' }))
    expect(loadSoundPreference()).toEqual({ muted: false })
  })

  it('is kept under pacmac:sound', () => {
    const storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
    expect(saveSoundPreference({ muted: true })).toBe(true)
    expect(storage.values.get('pacmac:sound')).toBe('{"muted":true}')
    expect(loadSoundPreference()).toEqual({ muted: true })
  })
})
