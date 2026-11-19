import { describe, expect, it } from 'vitest'
import { seedRng } from '../rng'
import { steer } from './steering'

describe('steering towards a target', () => {
  it('takes the direction whose neighbour is closest to the target', () => {
    const result = steer(seedRng(1), { col: 5, row: 4 }, 'right', { kind: 'target', target: { col: 5, row: -2 } })
    expect(result.direction).toBe('up')
  })

  it('breaks ties in the order up, right, down, left', () => {
    const result = steer(seedRng(1), { col: 5, row: 4 }, 'right', { kind: 'target', target: { col: 6, row: 3 } })
    expect(result.direction).toBe('up')
  })

  it('never turns back, even with the target behind', () => {
    const result = steer(seedRng(1), { col: 2, row: 25 }, 'right', { kind: 'target', target: { col: 0, row: 25 } })
    expect(result.direction).toBe('right')
  })

  it('treats the nest door as a wall', () => {
    const result = steer(seedRng(1), { col: 10, row: 8 }, 'right', { kind: 'target', target: { col: 10, row: 20 } })
    expect(result.direction).toBe('right')
  })

  it('does not draw a random number while following a target', () => {
    const state = seedRng(1)
    expect(steer(state, { col: 5, row: 4 }, 'right', { kind: 'target', target: { col: 0, row: 0 } }).rngState).toBe(state)
  })
})

describe('random steering', () => {
  it('draws among the open directions, never back', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 300; seed++) {
      const { direction } = steer(seedRng(seed), { col: 5, row: 4 }, 'right', { kind: 'random' })
      expect(['up', 'right', 'down']).toContain(direction)
      seen.add(direction)
    }
    expect([...seen].sort()).toEqual(['down', 'right', 'up'])
  })

  it('does not draw in a corridor with a single way', () => {
    const state = seedRng(9)
    const result = steer(state, { col: 3, row: 25 }, 'right', { kind: 'random' })
    expect(result.direction).toBe('right')
    expect(result.rngState).toBe(state)
  })
})
