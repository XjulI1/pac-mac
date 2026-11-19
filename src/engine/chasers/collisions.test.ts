import { describe, expect, it } from 'vitest'
import { gameWith, runTicks, type ChasersSetup, type GameSetup } from '../testing/builders'
import type { GameEvent, Mode } from '../types'
import { distanceBetween } from './collisions'

const chaseForGood: Mode = { kind: 'chase', step: 7, ticksLeft: null }

const macStoppedAt = (x: number, y: number, chasers: ChasersSetup, extra: GameSetup = {}) =>
  gameWith({ hero: { position: { x, y }, direction: 'left', moving: false }, chasers, clearItems: 'all', addItems: [{ tile: { col: 19, row: 1 }, item: 'pellet' }], ...extra })

describe('distance between Mac and a chaser', () => {
  it('goes through the tunnel', () => {
    expect(distanceBetween({ x: 10, y: 1380 }, { x: 2500, y: 1380 })).toBe(30)
    expect(distanceBetween({ x: 180, y: 3060 }, { x: 230, y: 3060 })).toBe(50)
  })
})

describe('contact', () => {
  it('catches Mac when a dangerous chaser comes within half a tile', () => {
    const state = macStoppedAt(180, 3060, { hound: { position: { x: 241, y: 3060 }, direction: 'left' } })
    const { state: after, events } = runTicks(state, 1)
    expect(after.phase).toEqual({ kind: 'dying', ticksLeft: 120, by: 'hound' })
    expect(events).toContainEqual({ type: 'heroCaught', by: 'hound' })
  })

  it('does not catch Mac at exactly half a tile', () => {
    const state = macStoppedAt(180, 3060, { hound: { position: { x: 240, y: 3060 }, direction: 'right' } })
    expect(runTicks(state, 1).state.phase).toEqual({ kind: 'playing' })
  })

  it('catches Mac across the tunnel', () => {
    const state = macStoppedAt(60, 1380, { hound: { position: { x: 2515, y: 1380 }, direction: 'right' } })
    expect(runTicks(state, 1).state.phase.kind).toBe('dying')
  })

  it('lets a spark pass over Mac', () => {
    const state = macStoppedAt(180, 3060, { hound: { position: { x: 190, y: 3060 }, direction: 'right', status: 'spark' } })
    expect(runTicks(state, 1).state.phase).toEqual({ kind: 'playing' })
  })

  it('never lets Mac and a chaser cross without contact, at any level', () => {
    for (let level = 1; level <= 8; level++) {
      let state = gameWith({
        level,
        mode: chaseForGood,
        hero: { tile: { col: 1, row: 25 }, direction: 'right' },
        chasers: { hound: { tile: { col: 9, row: 25 }, direction: 'left' } },
      })
      for (let index = 0; index < 120 && state.phase.kind === 'playing'; index++) {
        state = runTicks(state, 1).state
        expect(state.chasers[0]!.position.x, `level ${level}`).toBeGreaterThan(state.hero.position.x)
      }
      expect(state.phase.kind, `level ${level}`).toBe('dying')
    }
  })
})

describe('capture', () => {
  const allVulnerable = Object.fromEntries(
    ['hound', 'cutter', 'warden', 'prowler'].map((id) => [id, { position: { x: 190, y: 3060 }, direction: 'right', vulnerable: true }]),
  ) as ChasersSetup

  it('scores 200, 400, 600 and 800 points, plus 1 000 for the full chain', () => {
    const state = macStoppedAt(180, 3060, allVulnerable, { surcharge: { ticksLeft: 300, chain: 0 } })
    const { state: after, events } = runTicks(state, 1)
    const captures = events.filter((event): event is Extract<GameEvent, { type: 'chaserCaught' }> => event.type === 'chaserCaught')
    expect(captures.map((event) => [event.chaser, event.points, event.chainBonus])).toEqual([
      ['hound', 200, 0],
      ['cutter', 400, 0],
      ['warden', 600, 0],
      ['prowler', 800, 1000],
    ])
    expect(captures[0]!.tile).toEqual({ col: 1, row: 25 })
    expect(after.score).toBe(3000)
    expect(after.surcharge?.chain).toBe(4)
    expect(after.chasers.every((chaser) => chaser.status === 'spark' && !chaser.vulnerable)).toBe(true)
    expect(after.phase).toEqual({ kind: 'chaserCaught', ticksLeft: 30, chaser: 'prowler', points: 800 })
  })

  it('grants an extra life reached through capture points', () => {
    const state = macStoppedAt(180, 3060, { hound: { position: { x: 190, y: 3060 }, vulnerable: true } }, {
      score: 9900,
      surcharge: { ticksLeft: 300, chain: 0 },
    })
    const { state: after, events } = runTicks(state, 1)
    expect(after.lives).toBe(4)
    expect(events).toContainEqual({ type: 'extraLife', lives: 4 })
  })

  it('freezes the whole game for 30 ticks, then plays on', () => {
    const state = macStoppedAt(
      180,
      3060,
      { hound: { position: { x: 190, y: 3060 }, vulnerable: true }, cutter: { tile: { col: 15, row: 4 }, direction: 'left' } },
      { surcharge: { ticksLeft: 300, chain: 0 }, bonus: { kind: 'crystal', points: 100, ticksLeft: 200 } },
    )
    const caught = runTicks(state, 1).state
    const frozen = runTicks(caught, 29).state
    expect(frozen.phase).toEqual({ kind: 'chaserCaught', ticksLeft: 1, chaser: 'hound', points: 200 })
    expect(frozen.chasers).toEqual(caught.chasers)
    expect(frozen.surcharge).toEqual(caught.surcharge)
    expect(frozen.mode).toEqual(caught.mode)
    expect(frozen.bonus).toEqual(caught.bonus)
    expect(runTicks(caught, 30).state.phase).toEqual({ kind: 'playing' })
  })

  it('still costs a life when a dangerous chaser touches Mac in the same tick', () => {
    const state = macStoppedAt(
      180,
      3060,
      {
        hound: { position: { x: 190, y: 3060 }, vulnerable: true },
        cutter: { position: { x: 170, y: 3060 }, direction: 'right' },
      },
      { surcharge: { ticksLeft: 300, chain: 0 } },
    )
    const { state: after } = runTicks(state, 1)
    expect(after.score).toBe(200)
    expect(after.phase.kind).toBe('dying')
  })
})
