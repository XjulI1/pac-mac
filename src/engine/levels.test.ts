import { describe, expect, it } from 'vitest'
import { levelSettings } from './levels'

const SPEED_KEYS = ['heroSpeed', 'heroSurchargeSpeed', 'chaserSpeed', 'vulnerableSpeed', 'tunnelSpeed'] as const

describe('levelSettings', () => {
  it('gives the row of level 1', () => {
    expect(levelSettings(1)).toEqual({
      heroSpeed: 6,
      heroSurchargeSpeed: 6.6,
      chaserSpeed: 5.6,
      vulnerableSpeed: 3.4,
      tunnelSpeed: 3,
      surchargeSeconds: 7,
      bonus: { kind: 'crystal', points: 100 },
      nestExitThresholds: [0, 15, 40],
      inactivitySeconds: 4,
      modeScheduleSeconds: [6, 18, 6, 18, 4, 24, 4],
    })
  })

  it('gives the surcharge, inactivity and schedule of level 5', () => {
    const settings = levelSettings(5)
    expect(settings.surchargeSeconds).toBe(3)
    expect(settings.inactivitySeconds).toBe(3)
    expect(settings.modeScheduleSeconds).toEqual([4, 25, 4, 25, 2, 40, 2])
  })

  it('keeps the settings of level 8 beyond it', () => {
    expect(levelSettings(12)).toEqual(levelSettings(8))
    expect(levelSettings(100)).toEqual(levelSettings(8))
  })

  it('gives each level its bonus', () => {
    const bonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => levelSettings(level).bonus)
    expect(bonuses).toEqual([
      { kind: 'crystal', points: 100 },
      { kind: 'ring', points: 250 },
      { kind: 'lightning', points: 400 },
      { kind: 'moon', points: 600 },
      { kind: 'crown', points: 800 },
      { kind: 'diamond', points: 1200 },
      { kind: 'comet', points: 1800 },
      { kind: 'star', points: 2500 },
      { kind: 'star', points: 2500 },
    ])
  })

  it('gives every speed as a whole number of units per second', () => {
    for (let level = 1; level <= 8; level++) {
      for (const key of SPEED_KEYS) {
        const unitsPerSecond = levelSettings(level)[key] * 120
        expect(Math.abs(unitsPerSecond - Math.round(unitsPerSecond)), `${key} at level ${level}`).toBeLessThan(1e-9)
      }
    }
  })

  it('rejects a level below 1', () => {
    expect(() => levelSettings(0)).toThrow()
  })
})
