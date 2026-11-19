import { describe, expect, it } from 'vitest'
import { createGame, type Chaser, type GameState, type Hero } from '../engine'
import { chaserLook, eyeOffset, mouthOpening, nestBob, prismScale, wallColorAt } from './looks'

const hero = (x: number, y: number, moving = true, direction: Hero['direction'] = 'left'): Hero => ({
  position: { x, y },
  direction,
  moving,
  wantedDirection: null,
  wantedTicksLeft: 0,
  carry: 0,
})

const chaser = (patch: Partial<Chaser> = {}): Chaser => ({
  id: 'hound',
  position: { x: 1260, y: 1020 },
  direction: 'left',
  carry: 0,
  status: 'active',
  vulnerable: false,
  ...patch,
})

const game = (patch: Partial<GameState>): GameState => ({ ...createGame({ seed: 1 }), ...patch })

describe('mouth of Mac', () => {
  it('opens and closes twice per tile', () => {
    expect(mouthOpening(hero(1260, 2100))).toBe(0)
    expect(mouthOpening(hero(1230, 2100))).toBe(1)
    expect(mouthOpening(hero(1200, 2100))).toBe(0)
    expect(mouthOpening(hero(1245, 2100))).toBe(0.5)
  })

  it('stays closed when Mac is stopped', () => {
    expect(mouthOpening(hero(1230, 2100, false))).toBe(0)
  })
})

describe('eyes of Mac', () => {
  it('look towards his direction', () => {
    expect(eyeOffset('up')).toEqual({ x: 0, y: -0.12 })
    expect(eyeOffset('right')).toEqual({ x: 0.12, y: 0 })
    expect(eyeOffset('down')).toEqual({ x: 0, y: 0.12 })
    expect(eyeOffset('left')).toEqual({ x: -0.12, y: 0 })
  })
})

describe('bobbing in the nest', () => {
  it('stays within 0.15 tile with a period of 60 ticks', () => {
    const cutter = chaser({ id: 'cutter', status: 'inNest' })
    for (let tick = 0; tick <= 120; tick++) {
      expect(Math.abs(nestBob(cutter, tick))).toBeLessThanOrEqual(0.15)
      expect(nestBob(cutter, tick)).toBeCloseTo(nestBob(cutter, tick + 60), 10)
    }
  })

  it('is out of phase from one chaser to another', () => {
    expect(nestBob(chaser({ id: 'cutter', status: 'inNest' }), 0)).not.toBeCloseTo(
      nestBob(chaser({ id: 'warden', status: 'inNest' }), 0),
    )
  })

  it('does not happen outside the nest', () => {
    expect(nestBob(chaser({ status: 'leaving' }), 15)).toBe(0)
  })
})

describe('prisms', () => {
  it('pulse between 0.75 and 1 over 40 ticks', () => {
    expect([0, 20, 40].map((tick) => prismScale({ kind: 'playing' }, tick))).toEqual([1, 0.75, 1])
  })

  it('stay still during « Prêt ? »', () => {
    expect(prismScale({ kind: 'ready', ticksLeft: 100 }, 20)).toBe(1)
  })
})

describe('walls at the end of a level', () => {
  it('alternate with white every 15 ticks, starting with the level color', () => {
    const colors = [120, 100, 85].map((ticksLeft) => wallColorAt(game({ level: 1, phase: { kind: 'levelClear', ticksLeft } })))
    expect(colors).toEqual(['#8b5cff', '#ffffff', '#8b5cff'])
  })

  it('keep the level color otherwise', () => {
    expect(wallColorAt(game({ level: 2, phase: { kind: 'playing' } }))).toBe('#17b3a3')
  })
})

describe('look of a chaser', () => {
  const surcharge = (ticksLeft: number) => ({ ticksLeft, chain: 0 })

  it('is dim while vulnerable early in a surcharge', () => {
    const state = game({ phase: { kind: 'playing' }, surcharge: surcharge(300), tickCount: 160 })
    expect(chaserLook(chaser({ vulnerable: true }), state)).toBe('dim')
  })

  it('flickers every 8 ticks at the end of a surcharge', () => {
    const at = (tickCount: number) => game({ phase: { kind: 'playing' }, surcharge: surcharge(100), tickCount })
    expect(chaserLook(chaser({ vulnerable: true }), at(160))).toBe('dim')
    expect(chaserLook(chaser({ vulnerable: true }), at(168))).toBe('flash')
  })

  it('is a spark on its way back', () => {
    expect(chaserLook(chaser({ status: 'entering' }), game({ phase: { kind: 'playing' } }))).toBe('spark')
    expect(chaserLook(chaser({ status: 'spark' }), game({ phase: { kind: 'playing' } }))).toBe('spark')
  })

  it('hides the caught chaser during the freeze only', () => {
    const state = game({ phase: { kind: 'chaserCaught', ticksLeft: 20, chaser: 'warden', points: 200 } })
    expect(chaserLook(chaser({ id: 'warden', status: 'spark' }), state)).toBe('hidden')
    expect(chaserLook(chaser({ id: 'hound' }), state)).toBe('normal')
  })

  it('hides the chasers from the 30th tick of a lost life', () => {
    expect(chaserLook(chaser(), game({ phase: { kind: 'dying', ticksLeft: 100, by: 'hound' } }))).toBe('normal')
    expect(chaserLook(chaser(), game({ phase: { kind: 'dying', ticksLeft: 80, by: 'hound' } }))).toBe('hidden')
  })

  it('hides every chaser at the end of a level and once the game is over', () => {
    expect(chaserLook(chaser(), game({ phase: { kind: 'levelClear', ticksLeft: 60 } }))).toBe('hidden')
    expect(chaserLook(chaser(), game({ phase: { kind: 'gameOver' } }))).toBe('hidden')
  })
})
