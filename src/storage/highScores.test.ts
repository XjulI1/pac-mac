import { describe, expect, it } from 'vitest'
import { formatDate, insertHighScore, normalizeName, parseHighScores, qualifies, type HighScore } from './highScores'

const entry = (score: number, name = 'Alex'): HighScore => ({ name, score, level: 2, date: '2026-11-19T12:00:00.000Z' })
const table = (...scores: number[]) => scores.map((score, index) => entry(score, `J${index}`))

describe('qualifies', () => {
  it('lets in any positive score while the table is not full', () => {
    expect(qualifies(table(9000, 8000, 7000, 6000), 120)).toBe(true)
  })

  it('never lets in a score of zero', () => {
    expect(qualifies([], 0)).toBe(false)
  })

  it('asks a full table for more than its last score', () => {
    const full = table(9000, 8900, 8800, 8700, 8600, 8500, 8400, 8300, 8200, 5000)
    expect(qualifies(full, 5000)).toBe(false)
    expect(qualifies(full, 5010)).toBe(true)
  })
})

describe('insertHighScore', () => {
  it('places a new entry under the equal scores', () => {
    const result = insertHighScore(table(9000, 8000, 7000), entry(8000, 'Neuf'))
    expect(result.rank).toBe(2)
    expect(result.scores.map((line) => line.name)).toEqual(['J0', 'J1', 'Neuf', 'J2'])
  })

  it('keeps ten lines, the old tenth going out', () => {
    const full = table(9000, 8900, 8800, 8700, 8600, 8500, 8400, 8300, 8200, 5000)
    const result = insertHighScore(full, entry(8250, 'Neuf'))
    expect(result.scores).toHaveLength(10)
    expect(result.rank).toBe(8)
    expect(result.scores.at(-1)!.score).toBe(8200)
  })

  it('gives no rank to an entry left out', () => {
    const full = table(9000, 8900, 8800, 8700, 8600, 8500, 8400, 8300, 8200, 5000)
    expect(insertHighScore(full, entry(100)).rank).toBeNull()
  })
})

describe('normalizeName', () => {
  it('trims the spaces and cuts to ten characters', () => {
    expect(normalizeName('  Alex  ')).toBe('Alex')
    expect(normalizeName('Maximilienne')).toBe('Maximilien')
    expect(normalizeName('   ')).toBe('')
  })
})

describe('parseHighScores', () => {
  it('keeps the well-formed entries, best first', () => {
    const stored = [entry(100, 'B'), { name: '', score: 50, level: 1, date: '2026-11-19T12:00:00.000Z' }, { ...entry(300), score: '300' }, entry(200, 'A')]
    expect(parseHighScores(stored).map((line) => line.name)).toEqual(['A', 'B'])
  })

  it('gives an empty table for anything but an array', () => {
    expect(parseHighScores(42)).toEqual([])
    expect(parseHighScores(undefined)).toEqual([])
    expect(parseHighScores({ scores: [] })).toEqual([])
  })
})

describe('formatDate', () => {
  it('writes the date in the short French format', () => {
    expect(formatDate('2026-11-19T12:00:00.000Z')).toBe('19/11/2026')
  })
})
