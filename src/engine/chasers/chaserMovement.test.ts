import { describe, expect, it } from 'vitest'
import { gameWith, runTicks, type ChaserSetup, type GameSetup } from '../testing/builders'
import type { Chaser, ChaserId, GameEvent, GameState, Mode } from '../types'
import { moveChaser } from './chaserMovement'

const chase: Mode = { kind: 'chase', step: 1, ticksLeft: null }

function travel(state: GameState, id: ChaserId, ticks: number) {
  let chaser = state.chasers.find((candidate) => candidate.id === id)!
  const events: GameEvent[] = []
  let distance = 0
  const path: Chaser[] = []
  for (let index = 0; index < ticks; index++) {
    const next = moveChaser(state, chaser, events)
    distance += Math.abs(next.position.x - chaser.position.x) + Math.abs(next.position.y - chaser.position.y)
    chaser = next
    path.push(next)
  }
  return { chaser, distance, events, path }
}

const alone = (id: ChaserId, setup: ChaserSetup, extra: GameSetup = {}) =>
  gameWith({ hero: { tile: { col: 19, row: 1 }, moving: false }, ...extra, chasers: { [id]: setup } })

describe('chaser speeds', () => {
  it('runs 672 units in 60 ticks at level 1', () => {
    expect(travel(alone('hound', { tile: { col: 1, row: 25 }, direction: 'right' }), 'hound', 60).distance).toBe(672)
  })

  it('slows down to 360 units in the tunnel', () => {
    expect(travel(alone('hound', { tile: { col: 16, row: 11 }, direction: 'right' }), 'hound', 60).distance).toBe(360)
  })

  it('slows down to 408 units while vulnerable', () => {
    const state = alone('hound', { tile: { col: 1, row: 25 }, direction: 'right', vulnerable: true })
    expect(travel(state, 'hound', 60).distance).toBe(408)
  })

  it('rushes at 1 440 units as a spark', () => {
    const state = alone('hound', { tile: { col: 1, row: 25 }, direction: 'right', status: 'spark' })
    expect(travel(state, 'hound', 60).distance).toBe(1440)
  })

  it('speeds up to 739 units when the Fureteur sees Mac', () => {
    const state = alone(
      'prowler',
      { tile: { col: 1, row: 25 }, direction: 'right' },
      { mode: chase, hero: { tile: { col: 19, row: 25 }, moving: false } },
    )
    expect(travel(state, 'prowler', 60).distance).toBe(739)
  })

  it('moves Mac 792 units in 60 ticks during a surcharge at level 1', () => {
    const state = gameWith({
      surcharge: { ticksLeft: 420, chain: 0 },
      hero: { tile: { col: 1, row: 25 }, direction: 'right' },
    })
    expect(runTicks(state, 60).state.hero.position.x - 180).toBe(792)
  })
})

describe('scripted moves around the nest', () => {
  it('lets the Gardien out through the door in 80 ticks at level 1', () => {
    const state = alone('warden', { status: 'leaving' })
    const { path } = travel(state, 'warden', 80)
    expect(path[0]!.position).toEqual({ x: 1146, y: 1380 })
    expect(path.some((step) => step.position.x === 1260 && step.position.y === 1380)).toBe(true)
    expect(path[78]!.status).toBe('leaving')
    expect(path[79]).toMatchObject({ status: 'active', position: { x: 1260, y: 1020 } })
  })

  it('brings a spark down to the regeneration point in 10 ticks', () => {
    const state = alone('hound', { tile: { col: 10, row: 8 }, status: 'entering', direction: 'down' })
    const { path, events } = travel(state, 'hound', 10)
    expect(path[8]!.status).toBe('entering')
    expect(path[9]).toMatchObject({ status: 'leaving', vulnerable: false, position: { x: 1260, y: 1260 } })
    expect(events).toEqual([{ type: 'chaserRevived', chaser: 'hound' }])
  })

  it('keeps a chaser still while it waits in the nest', () => {
    const state = alone('cutter', {})
    expect(travel(state, 'cutter', 30).distance).toBe(0)
  })
})
