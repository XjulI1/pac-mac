import { describe, expect, it } from 'vitest'
import { startingChasers } from './chasers/roster'
import { gameWith, runTicks, type GameSetup } from './testing/builders'

const dying = (setup: GameSetup = {}) =>
  gameWith({
    phase: { kind: 'dying', ticksLeft: 120, by: 'hound' },
    hero: { tile: { col: 1, row: 25 }, direction: 'right' },
    chasers: { hound: { tile: { col: 2, row: 25 }, direction: 'left' } },
    ...setup,
  })

describe('losing a life', () => {
  it('freezes everything while Mac falls apart', () => {
    const start = dying()
    const { state } = runTicks(start, 119, { direction: 'up' })
    expect(state.hero).toEqual(start.hero)
    expect(state.chasers).toEqual(start.chasers)
    expect(state.phase).toEqual({ kind: 'dying', ticksLeft: 1, by: 'hound' })
  })

  it('puts everyone back in place, keeps the items, and waits 2 seconds', () => {
    const start = dying({
      lives: 3,
      clearItems: 'all',
      addItems: Array.from({ length: 19 }, (_, col) => ({ tile: { col: col + 1, row: 25 }, item: 'pellet' as const })),
      surcharge: { ticksLeft: 100, chain: 2 },
      bonus: { kind: 'crystal', points: 100, ticksLeft: 50 },
      mode: { kind: 'chase', step: 3, ticksLeft: 500 },
      nest: { itemsEatenSinceRestart: 50, ticksSinceLastItem: 30 },
    })
    const { state, events } = runTicks(start, 120)
    expect(state.lives).toBe(2)
    expect(events).toEqual([{ type: 'lifeLost', livesLeft: 2 }])
    expect(state.hero).toMatchObject({ position: { x: 1260, y: 2100 }, direction: 'left', moving: false })
    expect(state.chasers).toEqual(startingChasers())
    expect(state.mode).toEqual({ kind: 'patrol', step: 0, ticksLeft: 360 })
    expect(state.surcharge).toBeNull()
    expect(state.bonus).toBeNull()
    expect(state.nest).toEqual({ itemsEatenSinceRestart: 0, ticksSinceLastItem: 0 })
    expect(state.itemsLeft).toBe(19)
    expect(state.phase).toEqual({ kind: 'ready', ticksLeft: 120 })
  })

  it('waits for 15 new items before letting the Gardien out again', () => {
    const restarted = runTicks(dying({ nest: { itemsEatenSinceRestart: 50 } }), 120 + 120 + 1).state
    expect(restarted.chasers.find((chaser) => chaser.id === 'warden')?.status).toBe('inNest')
  })
})

describe('end of the game', () => {
  it('ends when the last life is lost', () => {
    const { state, events } = runTicks(dying({ lives: 1, score: 12_340, level: 3 }), 120)
    expect(state.lives).toBe(0)
    expect(state.phase).toEqual({ kind: 'gameOver' })
    expect(events).toEqual([
      { type: 'lifeLost', livesLeft: 0 },
      { type: 'gameOver', score: 12_340, level: 3 },
    ])
  })

  it('only counts ticks once over', () => {
    const over = runTicks(dying({ lives: 1 }), 120).state
    const { state, events } = runTicks(over, 100, { direction: 'up' })
    expect(events).toEqual([])
    expect({ ...state, tickCount: over.tickCount }).toEqual(over)
    expect(state.tickCount).toBe(over.tickCount + 100)
  })
})
