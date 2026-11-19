import { describe, expect, it } from 'vitest'
import { gameWith, runTicks } from './testing/builders'

const lastPellet = () =>
  gameWith({
    score: 2490,
    lives: 2,
    bonus: { kind: 'crystal', points: 100, ticksLeft: 300 },
    bonusesShown: 1,
    itemsEatenInLevel: 218,
    hero: { tile: { col: 1, row: 1 }, direction: 'right' },
    clearItems: 'all',
    addItems: [{ tile: { col: 2, row: 1 }, item: 'pellet' }],
  })

describe('end of a level', () => {
  it('flashes for 2 seconds once the last item is eaten, without the bonus', () => {
    const { state, events } = runTicks(lastPellet(), 5)
    expect(state.itemsLeft).toBe(0)
    expect(state.phase).toEqual({ kind: 'levelClear', ticksLeft: 120 })
    expect(state.bonus).toBeNull()
    expect(events).toContainEqual({ type: 'levelCleared', level: 1 })
  })

  it('freezes Mac and ignores inputs while flashing', () => {
    const cleared = runTicks(lastPellet(), 5).state
    const { state } = runTicks(cleared, 60, { direction: 'up' })
    expect(state.hero.position).toEqual(cleared.hero.position)
    expect(state.hero.wantedDirection).toBe(cleared.hero.wantedDirection)
    expect(state.phase).toEqual({ kind: 'levelClear', ticksLeft: 60 })
  })
})

describe('next level', () => {
  it('starts level 2 with every item back, Mac at his start, score and lives kept', () => {
    const cleared = runTicks(lastPellet(), 5).state
    const { state, events } = runTicks(cleared, 120)
    expect(state.level).toBe(2)
    expect(state.itemsLeft).toBe(219)
    expect(state.items.filter((item) => item !== null)).toHaveLength(219)
    expect(state.itemsEatenInLevel).toBe(0)
    expect(state.bonusesShown).toBe(0)
    expect(state.bonus).toBeNull()
    expect(state.hero).toEqual({
      position: { x: 1260, y: 2100 },
      direction: 'left',
      wantedDirection: null,
      wantedTicksLeft: 0,
      moving: false,
      carry: 0,
    })
    expect(state.phase).toEqual({ kind: 'ready', ticksLeft: 120 })
    expect(state.score).toBe(2500)
    expect(state.lives).toBe(2)
    expect(events).toEqual([{ type: 'levelStarted', level: 2 }])
  })
})
