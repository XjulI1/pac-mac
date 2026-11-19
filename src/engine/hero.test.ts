import { describe, expect, it } from 'vitest'
import { gameWith, runTicks } from './testing/builders'
import { createGame } from './setup'
import type { Tile } from './types'

const inMotion = (tile: Tile, direction: 'up' | 'right' | 'down' | 'left', level = 1) =>
  gameWith({ level, hero: { tile, direction, moving: true } })

const playingStart = () => runTicks(createGame({ seed: 1 }), 240).state

describe('start of a level', () => {
  it('waits for a command while stopped', () => {
    const state = runTicks(playingStart(), 300).state
    expect(state.hero.position).toEqual({ x: 1260, y: 2100 })
    expect(state.hero.moving).toBe(false)
  })

  it('leaves as soon as a walkable direction is given', () => {
    const state = runTicks(playingStart(), 1, [{ direction: 'left' }]).state
    expect(state.hero.position).toEqual({ x: 1248, y: 2100 })
    expect(state.hero.moving).toBe(true)
  })

  it('stays stopped on a command into a wall and forgets it after 30 ticks', () => {
    const start = playingStart()
    const after29 = runTicks(start, 29, [{ direction: 'up' }]).state
    expect(after29.hero.wantedDirection).toBe('up')
    const after30 = runTicks(start, 30, [{ direction: 'up' }]).state
    expect(after30.hero.position).toEqual({ x: 1260, y: 2100 })
    expect(after30.hero.wantedDirection).toBeNull()
  })
})

describe('speed', () => {
  it('moves 12 units per tick at level 1', () => {
    expect(runTicks(inMotion({ col: 1, row: 25 }, 'right'), 10).state.hero.position).toEqual({ x: 300, y: 3060 })
  })

  it('moves exactly 768 units in 60 ticks at level 2', () => {
    expect(runTicks(inMotion({ col: 1, row: 25 }, 'right', 2), 60).state.hero.position).toEqual({ x: 948, y: 3060 })
  })
})

describe('walls', () => {
  it('stops at the center of the last tile before a wall, keeping its direction', () => {
    const { hero } = runTicks(inMotion({ col: 3, row: 25 }, 'left'), 30).state
    expect(hero.position).toEqual({ x: 180, y: 3060 })
    expect(hero.moving).toBe(false)
    expect(hero.direction).toBe('left')
  })
})

describe('wanted direction', () => {
  it('turns at the first center where the wanted direction is open', () => {
    const state = gameWith({ hero: { direction: 'left', moving: true, wantedDirection: 'up' } })
    const { hero } = runTicks(state, 11).state
    expect(hero.position).toEqual({ x: 1140, y: 2088 })
    expect(hero.direction).toBe('up')
  })

  it('takes a turn announced just before the crossing', () => {
    const { hero } = runTicks(inMotion({ col: 7, row: 25 }, 'right'), 21, [{ direction: 'up' }]).state
    expect(hero.position).toEqual({ x: 1140, y: 3048 })
    expect(hero.direction).toBe('up')
  })

  it('forgets a turn it could not take within 30 ticks', () => {
    const start = inMotion({ col: 2, row: 25 }, 'right')
    expect(runTicks(start, 30, [{ direction: 'up' }]).state.hero.wantedDirection).toBeNull()
    const { hero } = runTicks(start, 71, [{ direction: 'up' }]).state
    expect(hero.position).toEqual({ x: 1152, y: 3060 })
    expect(hero.direction).toBe('right')
  })

  it('keeps a turn alive when it is sent again every tick', () => {
    const { hero } = runTicks(inMotion({ col: 2, row: 25 }, 'right'), 71, { direction: 'up' }).state
    expect(hero.position).toEqual({ x: 1140, y: 3048 })
    expect(hero.direction).toBe('up')
  })

  it('starts again from a stop only towards an open direction', () => {
    const stopped = gameWith({ hero: { tile: { col: 1, row: 25 }, direction: 'left', moving: false } })
    const afterDown = runTicks(stopped, 1, [{ direction: 'down' }]).state
    expect(afterDown.hero.position).toEqual({ x: 180, y: 3060 })
    expect(afterDown.hero.moving).toBe(false)
    const afterUp = runTicks(afterDown, 1, [{ direction: 'up' }]).state
    expect(afterUp.hero.position).toEqual({ x: 180, y: 3048 })
    expect(afterUp.hero.direction).toBe('up')
  })
})

describe('reversal', () => {
  it('turns back at once between two centers', () => {
    const moving = runTicks(inMotion({ col: 1, row: 25 }, 'right'), 3).state
    expect(moving.hero.position).toEqual({ x: 216, y: 3060 })
    const { hero } = runTicks(moving, 1, [{ direction: 'left' }]).state
    expect(hero.position).toEqual({ x: 204, y: 3060 })
    expect(hero.direction).toBe('left')
  })
})

describe('tunnel and nest', () => {
  it('goes out on the left and comes back on the right', () => {
    const { hero } = runTicks(inMotion({ col: 0, row: 11 }, 'left'), 10).state
    expect(hero.position).toEqual({ x: 2460, y: 1380 })
  })

  it('never goes through the nest door', () => {
    const state = gameWith({ hero: { tile: { col: 10, row: 8 }, direction: 'left', moving: true, wantedDirection: 'down' } })
    expect(runTicks(state, 1).state.hero.position).toEqual({ x: 1248, y: 1020 })
  })
})
