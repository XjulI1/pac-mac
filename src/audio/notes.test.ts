import { describe, expect, it } from 'vitest'
import { noteFrequency } from './notes'

describe('noteFrequency', () => {
  it('converts scientific pitch names into frequencies', () => {
    expect(noteFrequency('A4')).toBe(440)
    expect(noteFrequency('C5')).toBeCloseTo(523.25, 2)
    expect(noteFrequency('A2')).toBeCloseTo(110, 6)
  })

  it('reads sharps and flats', () => {
    expect(noteFrequency('C#5')).toBeCloseTo(noteFrequency('Db5'), 6)
    expect(noteFrequency('A#4')).toBeGreaterThan(440)
    expect(noteFrequency('Ab4')).toBeLessThan(440)
  })

  it('rejects an invalid note', () => {
    expect(() => noteFrequency('H4')).toThrow()
  })
})
