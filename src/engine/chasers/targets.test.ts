import { describe, expect, it } from 'vitest'
import { gameWith } from '../testing/builders'
import type { Direction, Tile } from '../types'
import { cutterTarget, houndTarget, patrolTarget, prowlerTarget, steeringFor, wardenTarget } from './targets'

const macAt = (tile: Tile, direction: Direction = 'left', moving = true) =>
  gameWith({ hero: { tile, direction, moving } })

describe('patrol', () => {
  it('sends each chaser to its corner', () => {
    expect(['hound', 'cutter', 'warden', 'prowler'].map((id) => patrolTarget(id as never))).toEqual([
      { col: 20, row: -2 },
      { col: 0, row: -2 },
      { col: 20, row: 28 },
      { col: 0, row: 28 },
    ])
  })
})

describe('Limier', () => {
  it('aims at the tile of Mac', () => {
    expect(houndTarget(macAt({ col: 3, row: 19 }))).toEqual({ col: 3, row: 19 })
  })
})

describe('Coupeur', () => {
  it('aims at the next intersection ahead of Mac', () => {
    expect(cutterTarget(macAt({ col: 10, row: 17 }, 'left'))).toEqual({ col: 9, row: 17 })
  })

  it('follows a straight corridor up to 8 tiles', () => {
    expect(cutterTarget(macAt({ col: 1, row: 25 }, 'right'))).toEqual({ col: 9, row: 25 })
  })

  it('takes the bends of a corridor', () => {
    expect(cutterTarget(macAt({ col: 2, row: 21 }, 'left'))).toEqual({ col: 3, row: 19 })
  })

  it('stops after 8 tiles without an intersection', () => {
    expect(cutterTarget(macAt({ col: 9, row: 25 }, 'left'))).toEqual({ col: 1, row: 25 })
  })

  it('aims at Mac when he is stopped', () => {
    expect(cutterTarget(macAt({ col: 1, row: 25 }, 'left', false))).toEqual({ col: 1, row: 25 })
  })
})

describe('Gardien', () => {
  it('charges Mac within 5 tiles', () => {
    expect(wardenTarget(macAt({ col: 8, row: 6 }), { col: 5, row: 4 })).toEqual({ col: 8, row: 6 })
  })

  it('defends the richest quarter otherwise, bottom left winning a tie', () => {
    expect(wardenTarget(macAt({ col: 9, row: 6 }), { col: 5, row: 4 })).toEqual({ col: 5, row: 21 })
  })

  it('moves to the other quarter once it is richer', () => {
    const state = gameWith({ hero: { tile: { col: 9, row: 6 } }, clearItems: [{ col: 1, row: 25 }] })
    expect(wardenTarget(state, { col: 5, row: 4 })).toEqual({ col: 15, row: 21 })
  })
})

describe('Fureteur', () => {
  it('sees Mac along a corridor', () => {
    expect(prowlerTarget(macAt({ col: 7, row: 25 }), { col: 1, row: 25 })).toEqual({ col: 7, row: 25 })
  })

  it('sees Mac along a column', () => {
    expect(prowlerTarget(macAt({ col: 5, row: 15 }), { col: 5, row: 4 })).toEqual({ col: 5, row: 15 })
  })

  it('does not see through a wall', () => {
    expect(prowlerTarget(macAt({ col: 5, row: 21 }), { col: 1, row: 21 })).toBeNull()
  })

  it('does not see through the tunnel', () => {
    expect(prowlerTarget(macAt({ col: 19, row: 11 }), { col: 1, row: 11 })).toBeNull()
  })
})

describe('steeringFor', () => {
  const chase = { kind: 'chase' as const, step: 1, ticksLeft: 100 }

  it('follows the patrol corner while patrolling', () => {
    const state = gameWith({ hero: { tile: { col: 3, row: 19 } }, chasers: { hound: { tile: { col: 5, row: 4 } } } })
    expect(steeringFor(state, state.chasers[0]!, { col: 5, row: 4 })).toEqual({ kind: 'target', target: { col: 20, row: -2 } })
  })

  it('follows its own target while chasing', () => {
    const state = gameWith({ mode: chase, hero: { tile: { col: 3, row: 19 } }, chasers: { hound: { tile: { col: 5, row: 4 } } } })
    expect(steeringFor(state, state.chasers[0]!, { col: 5, row: 4 })).toEqual({ kind: 'target', target: { col: 3, row: 19 } })
  })

  it('wanders while vulnerable, and when the Fureteur does not see Mac', () => {
    const state = gameWith({
      mode: chase,
      hero: { tile: { col: 3, row: 19 } },
      chasers: { hound: { tile: { col: 5, row: 4 }, vulnerable: true }, prowler: { tile: { col: 15, row: 4 } } },
    })
    expect(steeringFor(state, state.chasers[0]!, { col: 5, row: 4 })).toEqual({ kind: 'random' })
    expect(steeringFor(state, state.chasers[1]!, { col: 15, row: 4 })).toEqual({ kind: 'random' })
  })

  it('sends a spark back to the nest exit', () => {
    const state = gameWith({ chasers: { hound: { tile: { col: 5, row: 4 }, status: 'spark' } } })
    expect(steeringFor(state, state.chasers[0]!, { col: 5, row: 4 })).toEqual({ kind: 'target', target: { col: 10, row: 8 } })
  })
})
