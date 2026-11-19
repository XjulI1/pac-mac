import { describe, expect, it } from 'vitest'
import { createGame, type GameEvent, type GameState } from '../engine'
import { collectBonuses, hudOf, sameHud } from './hud'
import { createSeed } from './seed'

const game = (patch: Partial<GameState>): GameState => ({ ...createGame({ seed: 1 }), ...patch })

describe('hudOf', () => {
  it('shows the score, the level and the lives in reserve', () => {
    expect(hudOf(game({ score: 12_450, level: 3, lives: 3 }), [])).toEqual({
      score: 12_450,
      level: 3,
      reserveLives: 2,
      bonuses: [],
    })
  })

  it('keeps the life in reserve while Mac falls apart, and drops it once lost', () => {
    expect(hudOf(game({ lives: 3, phase: { kind: 'dying', ticksLeft: 60, by: 'hound' } }), []).reserveLives).toBe(2)
    expect(hudOf(game({ lives: 2 }), []).reserveLives).toBe(1)
  })

  it('counts an extra life and never goes below zero', () => {
    expect(hudOf(game({ lives: 4 }), []).reserveLives).toBe(3)
    expect(hudOf(game({ lives: 0 }), []).reserveLives).toBe(0)
  })
})

describe('collectBonuses', () => {
  const eaten = (kind: 'crystal' | 'ring'): GameEvent => ({ type: 'bonusEaten', kind, points: 100, tile: { col: 10, row: 13 } })

  it('adds the bonuses eaten, oldest first', () => {
    expect(collectBonuses([], [eaten('crystal'), { type: 'bonusExpired' }, eaten('ring')])).toEqual(['crystal', 'ring'])
  })

  it('keeps the last seven', () => {
    const nine = Array.from({ length: 9 }, (_, index) => eaten(index % 2 === 0 ? 'crystal' : 'ring'))
    const kept = collectBonuses([], nine)
    expect(kept).toHaveLength(7)
    expect(kept[0]).toBe('crystal')
    expect(kept.at(-1)).toBe('crystal')
  })
})

describe('sameHud', () => {
  it('tells identical HUD data apart from changed ones', () => {
    const base = hudOf(game({}), ['crystal'])
    expect(sameHud(base, hudOf(game({}), ['crystal']))).toBe(true)
    expect(sameHud(base, hudOf(game({ score: 10 }), ['crystal']))).toBe(false)
    expect(sameHud(base, hudOf(game({}), ['crystal', 'ring']))).toBe(false)
    expect(sameHud(null, base)).toBe(false)
  })
})

describe('createSeed', () => {
  it('derives the seed of a game from the time', () => {
    expect(createSeed(1_700_000_000_000)).toBe(1_700_000_000_000 >>> 0)
  })
})
