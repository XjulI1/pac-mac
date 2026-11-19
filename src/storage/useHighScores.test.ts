import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHighScores } from './useHighScores'

function fakeStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }
}

const entry = (name: string, score: number) => ({ name, score, level: 3, date: '2026-11-19T12:00:00.000Z' })

afterEach(() => {
  vi.unstubAllGlobals()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: undefined })
})

describe('high scores', () => {
  it('reads the stored table and the last name', () => {
    vi.stubGlobal('localStorage', fakeStorage({ 'pacmac:high-scores': JSON.stringify([entry('Alex', 500)]), 'pacmac:last-name': '"Alex"' }))
    const highScores = createHighScores()
    expect(highScores.scores.value).toEqual([entry('Alex', 500)])
    expect(highScores.best.value).toBe(500)
    expect(highScores.lastName.value).toBe('Alex')
    expect(highScores.storageAvailable.value).toBe(true)
  })

  it('records a score, the last name, and stores both', () => {
    const storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
    const highScores = createHighScores()
    expect(highScores.record(entry('  Sam ', 1200))).toBe(0)
    expect(highScores.scores.value.map((line) => line.name)).toEqual(['Sam'])
    expect(highScores.lastName.value).toBe('Sam')
    expect(JSON.parse(storage.values.get('pacmac:high-scores')!)).toHaveLength(1)
    expect(storage.values.get('pacmac:last-name')).toBe('"Sam"')
  })

  it('refuses an empty name', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    const highScores = createHighScores()
    expect(highScores.record(entry('   ', 1200))).toBeNull()
    expect(highScores.scores.value).toEqual([])
  })

  it('clears the table but keeps the last name', () => {
    const storage = fakeStorage({ 'pacmac:high-scores': JSON.stringify([entry('Alex', 500)]), 'pacmac:last-name': '"Alex"' })
    vi.stubGlobal('localStorage', storage)
    const highScores = createHighScores()
    highScores.clear()
    expect(highScores.scores.value).toEqual([])
    expect(storage.values.get('pacmac:high-scores')).toBe('[]')
    expect(highScores.lastName.value).toBe('Alex')
  })

  it('scores 0 as best with an empty table', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    expect(createHighScores().best.value).toBe(0)
  })

  it('keeps the table in memory when storage is blocked', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError')
      },
    })
    const highScores = createHighScores()
    expect(highScores.storageAvailable.value).toBe(false)
    highScores.record(entry('Alex', 300))
    expect(highScores.scores.value).toHaveLength(1)
  })
})
