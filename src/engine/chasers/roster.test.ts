import { describe, expect, it } from 'vitest'
import { createGame } from '../setup'
import { CHASER_IDS, NEST_ORDER, PATROL_CORNERS, startingChasers } from './roster'

describe('roster', () => {
  it('lists the chasers in the order Limier, Coupeur, Gardien, Fureteur', () => {
    expect(CHASER_IDS).toEqual(['hound', 'cutter', 'warden', 'prowler'])
  })

  it('lets them out of the nest in the order Coupeur, Gardien, Fureteur', () => {
    expect(NEST_ORDER).toEqual(['cutter', 'warden', 'prowler'])
  })

  it('gives each chaser its patrol corner outside the maze', () => {
    expect(PATROL_CORNERS).toEqual({
      hound: { col: 20, row: -2 },
      cutter: { col: 0, row: -2 },
      warden: { col: 20, row: 28 },
      prowler: { col: 0, row: 28 },
    })
  })

  it('starts the Limier outside the nest and the three others inside', () => {
    expect(startingChasers()).toEqual([
      { id: 'hound', position: { x: 1260, y: 1020 }, direction: 'left', carry: 0, status: 'active', vulnerable: false },
      { id: 'cutter', position: { x: 1260, y: 1380 }, direction: 'up', carry: 0, status: 'inNest', vulnerable: false },
      { id: 'warden', position: { x: 1140, y: 1380 }, direction: 'up', carry: 0, status: 'inNest', vulnerable: false },
      { id: 'prowler', position: { x: 1380, y: 1380 }, direction: 'up', carry: 0, status: 'inNest', vulnerable: false },
    ])
  })
})

describe('initial state of the chasers', () => {
  it('starts a game in patrol, with no surcharge and empty nest counters', () => {
    const state = createGame({ seed: 1 })
    expect(state.chasers).toEqual(startingChasers())
    expect(state.mode).toEqual({ kind: 'patrol', step: 0, ticksLeft: 360 })
    expect(state.surcharge).toBeNull()
    expect(state.nest).toEqual({ itemsEatenSinceRestart: 0, ticksSinceLastItem: 0 })
  })
})
