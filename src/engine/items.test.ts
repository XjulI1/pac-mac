import { describe, expect, it } from 'vitest'
import { gameWith, runTicks } from './testing/builders'
import type { GameEvent, Tile } from './types'

const onlyItems = (...tiles: { tile: Tile; item: 'pellet' | 'prism' }[]) => ({
  clearItems: 'all' as const,
  addItems: tiles,
})

const ofType = <T extends GameEvent['type']>(events: GameEvent[], type: T) =>
  events.filter((event): event is Extract<GameEvent, { type: T }> => event.type === type)

describe('pellets and prisms', () => {
  it('eats a pellet as soon as its center enters the tile', () => {
    const state = gameWith({
      hero: { tile: { col: 1, row: 1 }, direction: 'right' },
      ...onlyItems({ tile: { col: 2, row: 1 }, item: 'pellet' }, { tile: { col: 9, row: 1 }, item: 'pellet' }),
    })
    const after4 = runTicks(state, 4)
    expect(after4.state.items[1 * 21 + 2]).toBe('pellet')
    const after5 = runTicks(state, 5)
    expect(after5.state.items[1 * 21 + 2]).toBeNull()
    expect(after5.state.score).toBe(10)
    expect(after5.state.itemsLeft).toBe(1)
    expect(after5.state.itemsEatenInLevel).toBe(1)
    expect(ofType(after5.events, 'pelletEaten')).toEqual([{ type: 'pelletEaten', tile: { col: 2, row: 1 } }])
  })

  it('eats a prism for 50 points', () => {
    const state = gameWith({
      hero: { tile: { col: 1, row: 4 }, direction: 'up' },
      ...onlyItems({ tile: { col: 1, row: 3 }, item: 'prism' }, { tile: { col: 9, row: 1 }, item: 'pellet' }),
    })
    const { state: after, events } = runTicks(state, 10)
    expect(after.score).toBe(50)
    expect(ofType(events, 'prismEaten')).toEqual([{ type: 'prismEaten', tile: { col: 1, row: 3 } }])
  })

  it('does nothing in empty corridors', () => {
    const state = gameWith({
      hero: { tile: { col: 7, row: 13 }, direction: 'right' },
      ...onlyItems({ tile: { col: 1, row: 1 }, item: 'pellet' }),
    })
    const { state: after, events } = runTicks(state, 40)
    expect(after.score).toBe(0)
    expect(events).toEqual([])
  })
})

describe('bonus', () => {
  const nearPellets = (eatenBefore: number, level = 1) =>
    gameWith({
      level,
      itemsEatenInLevel: eatenBefore,
      bonusesShown: eatenBefore >= 70 ? 1 : 0,
      hero: { tile: { col: 1, row: 25 }, direction: 'right' },
      ...onlyItems(
        { tile: { col: 2, row: 25 }, item: 'pellet' },
        { tile: { col: 3, row: 25 }, item: 'pellet' },
        { tile: { col: 1, row: 1 }, item: 'pellet' },
      ),
    })

  it('appears at the 70th item of the level', () => {
    const { state, events } = runTicks(nearPellets(69), 5)
    expect(state.bonus).toEqual({ kind: 'crystal', points: 100, ticksLeft: 540 })
    expect(state.bonusesShown).toBe(1)
    expect(ofType(events, 'bonusAppeared')).toEqual([{ type: 'bonusAppeared', kind: 'crystal' }])
  })

  it('appears again at the 150th item, never a third time', () => {
    expect(runTicks(nearPellets(149), 5).state.bonusesShown).toBe(2)
    const third = gameWith({
      itemsEatenInLevel: 150,
      bonusesShown: 2,
      hero: { tile: { col: 1, row: 25 }, direction: 'right' },
      ...onlyItems({ tile: { col: 2, row: 25 }, item: 'pellet' }, { tile: { col: 1, row: 1 }, item: 'pellet' }),
    })
    const { state, events } = runTicks(third, 5)
    expect(state.bonus).toBeNull()
    expect(ofType(events, 'bonusAppeared')).toEqual([])
  })

  it('depends on the level', () => {
    expect(runTicks(nearPellets(69, 3), 5).state.bonus).toMatchObject({ kind: 'lightning', points: 400 })
    expect(runTicks(nearPellets(69, 11), 5).state.bonus).toMatchObject({ kind: 'star', points: 2500 })
  })

  it('is eaten when Mac enters its tile', () => {
    const state = gameWith({
      bonus: { kind: 'crystal', points: 100, ticksLeft: 540 },
      hero: { tile: { col: 8, row: 13 }, direction: 'right' },
      ...onlyItems({ tile: { col: 1, row: 1 }, item: 'pellet' }),
    })
    const { state: after, events } = runTicks(state, 15)
    expect(after.score).toBe(100)
    expect(after.bonus).toBeNull()
    expect(ofType(events, 'bonusEaten')).toEqual([
      { type: 'bonusEaten', kind: 'crystal', points: 100, tile: { col: 10, row: 13 } },
    ])
  })

  it('disappears after 540 ticks', () => {
    const appeared = runTicks(nearPellets(69), 5).state
    const parked = { ...appeared, hero: { ...appeared.hero, moving: false } }
    const almost = runTicks(parked, 539)
    expect(almost.state.bonus?.ticksLeft).toBe(1)
    const { state, events } = runTicks(parked, 540)
    expect(state.bonus).toBeNull()
    expect(ofType(events, 'bonusExpired')).toHaveLength(1)
  })
})

describe('extra lives', () => {
  const beforePellet = (score: number, lives: number, nextExtraLifeAt: number, item: 'pellet' | 'prism' = 'pellet') =>
    gameWith({
      score,
      lives,
      nextExtraLifeAt,
      hero: { tile: { col: 1, row: 25 }, direction: 'right' },
      ...onlyItems({ tile: { col: 2, row: 25 }, item }, { tile: { col: 1, row: 1 }, item: 'pellet' }),
    })

  it('gives a life at 10 000 points', () => {
    const { state, events } = runTicks(beforePellet(9990, 3, 10_000), 5)
    expect(state.score).toBe(10_000)
    expect(state.lives).toBe(4)
    expect(state.nextExtraLifeAt).toBe(35_000)
    expect(ofType(events, 'extraLife')).toEqual([{ type: 'extraLife', lives: 4 }])
  })

  it('gives the next one 25 000 points later', () => {
    const { state } = runTicks(beforePellet(34_950, 3, 35_000, 'prism'), 5)
    expect(state.lives).toBe(4)
    expect(state.nextExtraLifeAt).toBe(60_000)
  })

  it('never goes beyond 5 lives', () => {
    const { state, events } = runTicks(beforePellet(9990, 5, 10_000), 5)
    expect(state.lives).toBe(5)
    expect(state.nextExtraLifeAt).toBe(35_000)
    expect(ofType(events, 'extraLife')).toEqual([])
  })
})
