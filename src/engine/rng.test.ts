import { describe, expect, it } from 'vitest'
import { nextRandom, randomChoice, randomInt, seedRng } from './rng'

function sequence(seed: number, count: number): number[] {
  let state = seedRng(seed)
  const values: number[] = []
  for (let index = 0; index < count; index++) {
    const draw = nextRandom(state)
    values.push(draw.value)
    state = draw.state
  }
  return values
}

describe('rng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(sequence(42, 20)).toEqual(sequence(42, 20))
  })

  it('gives different sequences for different seeds', () => {
    expect(sequence(42, 5)).not.toEqual(sequence(43, 5))
  })

  it('draws values in [0, 1)', () => {
    for (const value of sequence(7, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('draws integers within the requested bound', () => {
    let state = seedRng(3)
    const seen = new Set<number>()
    for (let index = 0; index < 500; index++) {
      const draw = randomInt(state, 4)
      expect(Number.isInteger(draw.value)).toBe(true)
      expect(draw.value).toBeGreaterThanOrEqual(0)
      expect(draw.value).toBeLessThan(4)
      seen.add(draw.value)
      state = draw.state
    }
    expect(seen.size).toBe(4)
  })

  it('never draws outside the given list', () => {
    const options = ['up', 'right', 'down'] as const
    let state = seedRng(11)
    for (let index = 0; index < 300; index++) {
      const draw = randomChoice(state, options)
      expect(options).toContain(draw.value)
      state = draw.state
    }
  })

  it('keeps the state an unsigned 32-bit integer', () => {
    let state = seedRng(-5)
    for (let index = 0; index < 50; index++) {
      state = nextRandom(state).state
      expect(Number.isInteger(state)).toBe(true)
      expect(state).toBeGreaterThanOrEqual(0)
      expect(state).toBeLessThan(2 ** 32)
    }
  })
})
