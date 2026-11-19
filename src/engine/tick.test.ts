import { describe, expect, it } from 'vitest'
import { createGame } from './setup'
import { NO_INPUT, runTicks } from './testing/builders'
import { tick } from './tick'

describe('tick', () => {
  it('leaves the given state untouched', () => {
    const state = createGame({ seed: 42 })
    const copy = structuredClone(state)
    tick(state, { direction: 'right' })
    expect(state).toEqual(copy)
  })

  it('counts ticks in every phase', () => {
    expect(runTicks(createGame({ seed: 42 }), 10).state.tickCount).toBe(10)
  })
})

describe('ready phase', () => {
  it('stays frozen until the countdown ends, then plays from the next tick', () => {
    const almost = runTicks(createGame({ seed: 42 }), 239).state
    expect(almost.phase).toEqual({ kind: 'ready', ticksLeft: 1 })
    expect(almost.hero.position).toEqual({ x: 1260, y: 2100 })
    const playing = tick(almost, NO_INPUT).state
    expect(playing.phase).toEqual({ kind: 'playing' })
    expect(playing.hero.position).toEqual({ x: 1260, y: 2100 })
    expect(tick(playing, NO_INPUT).state.hero.position).toEqual({ x: 1260, y: 2100 })
  })

  it('remembers a direction given during « Prêt ? » and takes it once playing', () => {
    const inputs = [{ direction: 'right' as const }]
    const state = runTicks(createGame({ seed: 42 }), 241, inputs).state
    expect(state.hero.position).toEqual({ x: 1272, y: 2100 })
    expect(state.hero.direction).toBe('right')
  })

  it('does not count down the wanted direction during « Prêt ? »', () => {
    const state = runTicks(createGame({ seed: 42 }), 200, [{ direction: 'up' }]).state
    expect(state.hero.wantedDirection).toBe('up')
    expect(state.hero.wantedTicksLeft).toBe(30)
  })
})
