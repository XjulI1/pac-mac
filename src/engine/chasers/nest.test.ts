import { describe, expect, it } from 'vitest'
import { createGame } from '../setup'
import { gameWith, runTicks } from '../testing/builders'
import type { ChaserId, GameEvent, GameState } from '../types'

const releases = (events: GameEvent[]) =>
  events.flatMap((event) => (event.type === 'chaserReleased' ? [event.chaser] : []))

const statusOf = (state: GameState, id: ChaserId) => state.chasers.find((chaser) => chaser.id === id)?.status

const farAway = { tile: { col: 19, row: 1 }, direction: 'left' as const }

describe('releases from the nest', () => {
  it('lets the Coupeur out on the first tick of play at level 1', () => {
    const ready = runTicks(createGame({ seed: 1 }), 240).state
    const { state, events } = runTicks(ready, 1)
    expect(releases(events)).toEqual(['cutter'])
    expect(statusOf(state, 'cutter')).toBe('leaving')
    expect(statusOf(state, 'warden')).toBe('inNest')
  })

  it('lets the Gardien out at the 15th item and the Fureteur at the 40th', () => {
    const beforePellet = (eaten: number, out: ChaserId[]) =>
      gameWith({
        nest: { itemsEatenSinceRestart: eaten },
        chasers: {
          cutter: farAway,
          warden: out.includes('warden') ? farAway : {},
          prowler: {},
        },
        hero: { tile: { col: 1, row: 25 }, direction: 'right' },
        clearItems: 'all',
        addItems: [
          { tile: { col: 2, row: 25 }, item: 'pellet' },
          { tile: { col: 9, row: 1 }, item: 'pellet' },
        ],
      })
    const warden = runTicks(beforePellet(14, []), 5)
    expect(releases(warden.events)).toEqual(['warden'])
    expect(statusOf(warden.state, 'prowler')).toBe('inNest')
    expect(releases(runTicks(beforePellet(13, []), 5).events)).toEqual([])
    expect(releases(runTicks(beforePellet(39, ['warden']), 5).events)).toEqual(['prowler'])
  })

  it('lets one chaser out per tick when the thresholds are zero', () => {
    const state = gameWith({ level: 3, chasers: 'start', hero: { tile: { col: 1, row: 1 }, moving: false } })
    const ticks = [1, 2, 3].map((count) => releases(runTicks(state, count).events))
    expect(ticks).toEqual([['cutter'], ['cutter', 'warden'], ['cutter', 'warden', 'prowler']])
  })

  it('lets the next chaser out after 4 seconds without eating, then waits 4 more seconds', () => {
    const state = gameWith({
      chasers: { warden: {}, prowler: {} },
      hero: { tile: { col: 1, row: 1 }, moving: false },
      clearItems: [{ col: 1, row: 1 }],
    })
    expect(releases(runTicks(state, 239).events)).toEqual([])
    expect(releases(runTicks(state, 240).events)).toEqual(['warden'])
    expect(releases(runTicks(state, 479).events)).toEqual(['warden'])
    expect(releases(runTicks(state, 480).events)).toEqual(['warden', 'prowler'])
  })
})

describe('return of the sparks', () => {
  it('guides a spark to the nest exit, down to the regeneration point, and out again', () => {
    const state = gameWith({
      chasers: { hound: { tile: { col: 7, row: 8 }, direction: 'right', status: 'spark' } },
      hero: { tile: { col: 1, row: 25 }, moving: false },
    })
    const atExit = runTicks(state, 15).state.chasers[0]!
    expect(atExit).toMatchObject({ status: 'entering', position: { x: 1260, y: 1020 } })
    const { state: revived, events } = runTicks(state, 25)
    expect(revived.chasers[0]).toMatchObject({ status: 'leaving', vulnerable: false, position: { x: 1260, y: 1260 } })
    expect(events).toContainEqual({ type: 'chaserRevived', chaser: 'hound' })
  })

  it('comes back out dangerous during a surcharge', () => {
    const state = gameWith({
      surcharge: { ticksLeft: 600, chain: 1 },
      chasers: { hound: { tile: { col: 10, row: 8 }, direction: 'down', status: 'entering' } },
      hero: { tile: { col: 1, row: 25 }, moving: false },
    })
    expect(runTicks(state, 10).state.chasers[0]).toMatchObject({ status: 'leaving', vulnerable: false })
  })
})
