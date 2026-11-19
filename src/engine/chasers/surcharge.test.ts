import { describe, expect, it } from 'vitest'
import { gameWith, runTicks, type GameSetup } from '../testing/builders'
import type { GameEvent } from '../types'

const types = (events: GameEvent[]) => events.map((event) => event.type)

const beforePrism = (setup: GameSetup = {}) =>
  gameWith({
    hero: { tile: { col: 1, row: 4 }, direction: 'up' },
    clearItems: 'all',
    addItems: [
      { tile: { col: 1, row: 3 }, item: 'prism' },
      { tile: { col: 19, row: 25 }, item: 'pellet' },
    ],
    ...setup,
  })

describe('start of a surcharge', () => {
  it('makes every chaser but the sparks vulnerable and turns the active ones back', () => {
    const state = beforePrism({
      chasers: {
        hound: { tile: { col: 3, row: 25 }, direction: 'left' },
        cutter: {},
        warden: { tile: { col: 7, row: 13 }, direction: 'right', status: 'spark' },
      },
    })
    const { state: after, events } = runTicks(state, 6)
    expect(after.surcharge).toEqual({ ticksLeft: 420, chain: 0 })
    expect(events).toContainEqual({ type: 'surchargeStarted', ticks: 420 })
    expect(after.chasers[0]).toMatchObject({ id: 'hound', vulnerable: true, direction: 'right' })
    expect(after.chasers[1]).toMatchObject({ id: 'cutter', vulnerable: true })
    expect(after.chasers[2]).toMatchObject({ id: 'warden', vulnerable: false })
  })

  it('starts again in full when another prism is eaten, the chain back to zero', () => {
    const state = beforePrism({
      surcharge: { ticksLeft: 100, chain: 1 },
      chasers: { hound: { tile: { col: 10, row: 8 }, status: 'leaving' } },
    })
    const { state: after, events } = runTicks(state, 5)
    expect(events).toContainEqual({ type: 'prismEaten', tile: { col: 1, row: 3 } })
    expect(after.surcharge).toEqual({ ticksLeft: 420, chain: 0 })
    expect(after.chasers[0]!.vulnerable).toBe(true)
  })
})

describe('end of a surcharge', () => {
  it('warns 300 ticks after the prism that the end is near', () => {
    expect(types(runTicks(beforePrism(), 305).events)).not.toContain('surchargeEnding')
    const { events } = runTicks(beforePrism(), 306)
    expect(types(events).filter((type) => type === 'surchargeEnding')).toHaveLength(1)
  })

  it('warns at once when the surcharge lasts 2 seconds or less', () => {
    const { events } = runTicks(beforePrism({ level: 6 }), 6)
    expect(types(events)).toEqual(expect.arrayContaining(['surchargeStarted', 'surchargeEnding']))
  })

  it('ends 420 ticks after the prism at level 1', () => {
    const state = beforePrism({ chasers: { hound: { tile: { col: 19, row: 1 }, direction: 'left' } } })
    const almost = runTicks(state, 425).state
    expect(almost.surcharge?.ticksLeft).toBe(1)
    const { state: after, events } = runTicks(state, 426)
    expect(after.surcharge).toBeNull()
    expect(after.chasers.every((chaser) => !chaser.vulnerable)).toBe(true)
    expect(types(events)).toContain('surchargeEnded')
  })
})
