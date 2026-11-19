import { describe, expect, it } from 'vitest'
import { createGame } from './setup'

describe('createGame', () => {
  it('starts at level 1 with no score, 3 lives and every item in place', () => {
    const state = createGame({ seed: 42 })
    expect(state.level).toBe(1)
    expect(state.score).toBe(0)
    expect(state.lives).toBe(3)
    expect(state.nextExtraLifeAt).toBe(10_000)
    expect(state.tickCount).toBe(0)
    expect(state.itemsLeft).toBe(219)
    expect(state.itemsEatenInLevel).toBe(0)
    expect(state.bonus).toBeNull()
    expect(state.bonusesShown).toBe(0)
    expect(state.phase).toEqual({ kind: 'ready', ticksLeft: 240 })
  })

  it('lays out the items of the maze', () => {
    const state = createGame({ seed: 42 })
    expect(state.items).toHaveLength(21 * 27)
    expect(state.items[1 * 21 + 1]).toBe('pellet')
    expect(state.items[3 * 21 + 1]).toBe('prism')
    expect(state.items[17 * 21 + 10]).toBeNull()
    expect(state.items.filter((item) => item !== null)).toHaveLength(219)
  })

  it('places Mac at his start, facing left, stopped, with no wanted direction', () => {
    expect(createGame({ seed: 42 }).hero).toEqual({
      position: { x: 1260, y: 2100 },
      direction: 'left',
      wantedDirection: null,
      wantedTicksLeft: 0,
      moving: false,
      carry: 0,
    })
  })

  it('creates identical games from the same seed', () => {
    expect(createGame({ seed: 7 })).toEqual(createGame({ seed: 7 }))
  })

  it('seeds the generator differently for different seeds', () => {
    expect(createGame({ seed: 7 }).rngState).not.toBe(createGame({ seed: 8 }).rngState)
  })
})
