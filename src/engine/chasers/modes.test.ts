import { describe, expect, it } from 'vitest'
import { createGame } from '../setup'
import { gameWith, runTicks, withoutChasers, type ChasersSetup } from '../testing/builders'
import type { GameEvent } from '../types'
import { initialMode } from './modes'

const modeChanges = (events: GameEvent[]) => events.filter((event) => event.type === 'modeChanged')

describe('mode schedule', () => {
  it('starts in patrol for 6 seconds at level 1 and 5 seconds at level 2', () => {
    expect(initialMode(1)).toEqual({ kind: 'patrol', step: 0, ticksLeft: 360 })
    expect(initialMode(2)).toEqual({ kind: 'patrol', step: 0, ticksLeft: 300 })
  })

  it('switches to chase after « Prêt ? » and 360 ticks of play', () => {
    const { state, events } = runTicks(withoutChasers(createGame({ seed: 1 })), 240 + 360)
    expect(state.mode).toEqual({ kind: 'chase', step: 1, ticksLeft: 1080 })
    expect(modeChanges(events)).toEqual([{ type: 'modeChanged', mode: 'chase' }])
  })

  it('does not count down outside the playing phase', () => {
    const { state } = runTicks(withoutChasers(createGame({ seed: 1 })), 200)
    expect(state.mode.ticksLeft).toBe(360)
  })

  it('stays in chase for good after 80 seconds at level 1', () => {
    const { state, events } = runTicks(gameWith(), 80 * 60)
    expect(state.mode).toEqual({ kind: 'chase', step: 7, ticksLeft: null })
    expect(modeChanges(events).map((event) => event.mode)).toEqual([
      'chase',
      'patrol',
      'chase',
      'patrol',
      'chase',
      'patrol',
      'chase',
    ])
    expect(runTicks(state, 600).state.mode).toEqual(state.mode)
  })

  it('is suspended during a surcharge', () => {
    const state = gameWith({ mode: { kind: 'patrol', step: 0, ticksLeft: 200 }, surcharge: { ticksLeft: 5000, chain: 0 } })
    expect(runTicks(state, 300).state.mode.ticksLeft).toBe(200)
  })
})

describe('reversal on a mode switch', () => {
  const switching = (setup: ChasersSetup) =>
    gameWith({ mode: { kind: 'patrol', step: 0, ticksLeft: 1 }, chasers: setup, hero: { tile: { col: 1, row: 1 }, moving: false } })

  it('turns an active chaser back', () => {
    const { state } = runTicks(switching({ hound: { tile: { col: 3, row: 25 }, direction: 'left' } }), 1)
    expect(state.chasers[0]!.direction).toBe('right')
  })

  it('leaves vulnerable chasers and chasers in the nest alone', () => {
    const { state } = runTicks(
      switching({ hound: { tile: { col: 3, row: 25 }, direction: 'left', vulnerable: true }, prowler: {} }),
      1,
    )
    expect(state.chasers[0]!.direction).toBe('left')
    expect(state.chasers[1]!.direction).toBe('up')
  })
})
