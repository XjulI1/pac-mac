import { describe, expect, it } from 'vitest'
import { createGame, type Chaser, type GameEvent, type GameState } from '../engine'
import {
  createEffects,
  dissolvePixels,
  dyingVisual,
  pushTrail,
  recordEvents,
  showsReady,
  updateTrails,
  visibleEffects,
} from './effects'

const at = (tickCount: number): GameState => ({ ...createGame({ seed: 1 }), tickCount })

const caught = (points: number, chainBonus = 0): GameEvent => ({
  type: 'chaserCaught',
  chaser: 'cutter',
  points,
  chainBonus,
  tile: { col: 3, row: 4 },
})

describe('floating points', () => {
  it('shows the points of a capture, rising and fading for 60 ticks', () => {
    const effects = recordEvents(createEffects(), [caught(400)], at(1000))
    expect(visibleEffects(effects, 1000).texts).toEqual([
      { text: '400', color: '#ff4fd8', tile: { col: 3, row: 4 }, line: 0, rise: 0, opacity: 1 },
    ])
    expect(visibleEffects(effects, 1030).texts).toEqual([
      { text: '400', color: '#ff4fd8', tile: { col: 3, row: 4 }, line: 0, rise: 0.25, opacity: 0.5 },
    ])
    const after = visibleEffects(effects, 1060)
    expect(after.texts).toEqual([])
    expect(after.effects.texts).toEqual([])
  })

  it('adds a second line for a full chain', () => {
    const effects = recordEvents(createEffects(), [caught(800, 1000)], at(10))
    expect(visibleEffects(effects, 10).texts.map((text) => [text.text, text.line])).toEqual([
      ['800', 0],
      ['+1 000', 1],
    ])
  })

  it('shows the points of a bonus for 90 ticks', () => {
    const events: GameEvent[] = [{ type: 'bonusEaten', kind: 'star', points: 2500, tile: { col: 10, row: 13 } }]
    const effects = recordEvents(createEffects(), events, at(500))
    expect(visibleEffects(effects, 589).texts).toMatchObject([{ text: '2 500', tile: { col: 10, row: 13 } }])
    expect(visibleEffects(effects, 590).texts).toEqual([])
  })
})

describe('spark trails', () => {
  it('keeps the last 6 positions, oldest first', () => {
    let trail: { x: number; y: number }[] = []
    for (let x = 1; x <= 8; x++) trail = pushTrail(trail, { x, y: 0 })
    expect(trail.map((point) => point.x)).toEqual([3, 4, 5, 6, 7, 8])
  })

  it('is emptied once the chaser is back in the nest', () => {
    const spark: Chaser = {
      id: 'hound',
      position: { x: 1260, y: 1100 },
      direction: 'down',
      carry: 0,
      status: 'entering',
      vulnerable: false,
    }
    const state = (chaser: Chaser): GameState => ({ ...createGame({ seed: 1 }), chasers: [chaser] })
    const withTrail = updateTrails(createEffects(), state(spark))
    expect(withTrail.trails.hound).toHaveLength(1)
    expect(updateTrails(withTrail, state({ ...spark, status: 'leaving' })).trails.hound).toBeUndefined()
  })
})

describe('loss of a life', () => {
  it('freezes 30 ticks, then hides the chasers and dissolves Mac over 90 ticks', () => {
    const visual = (ticksLeft: number) => dyingVisual({ kind: 'dying', ticksLeft, by: 'hound' })
    expect(visual(120)).toEqual({ chasersVisible: true, dissolve: null })
    expect(visual(90)).toEqual({ chasersVisible: false, dissolve: 0 })
    expect(visual(45)).toEqual({ chasersVisible: false, dissolve: 0.5 })
    expect(visual(0)).toEqual({ chasersVisible: false, dissolve: 1 })
    expect(dyingVisual({ kind: 'playing' })).toBeNull()
  })

  it('splits Mac into 25 blocks that pave him, then fade away', () => {
    const start = dissolvePixels(0)
    expect(start).toHaveLength(25)
    expect(start.every((block) => block.opacity === 1)).toBe(true)
    const left = Math.min(...start.map((block) => block.x - block.size / 2))
    const right = Math.max(...start.map((block) => block.x + block.size / 2))
    expect(left).toBeCloseTo(-0.4)
    expect(right).toBeCloseTo(0.4)
    expect(start.reduce((area, block) => area + block.size ** 2, 0)).toBeCloseTo(0.64)
    expect(dissolvePixels(1).every((block) => block.opacity === 0)).toBe(true)
  })

  it('dissolves the same way every time', () => {
    expect(dissolvePixels(0.4)).toEqual(dissolvePixels(0.4))
  })
})

describe('« Prêt ? »', () => {
  it('is shown during the ready phase only', () => {
    expect(showsReady({ kind: 'ready', ticksLeft: 10 })).toBe(true)
    expect(showsReady({ kind: 'playing' })).toBe(false)
  })
})
