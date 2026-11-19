import type { BonusKind } from './types'

/** Settings of a level, speeds in tiles per second and durations in seconds. */
export type LevelSettings = {
  heroSpeed: number
  heroSurchargeSpeed: number
  chaserSpeed: number
  vulnerableSpeed: number
  tunnelSpeed: number
  surchargeSeconds: number
  bonus: { kind: BonusKind; points: number }
  nestExitThresholds: readonly [number, number, number]
  inactivitySeconds: number
  modeScheduleSeconds: readonly number[]
}

const FIRST_SCHEDULE = [6, 18, 6, 18, 4, 24, 4]
const MIDDLE_SCHEDULE = [5, 22, 5, 22, 3, 30, 3]
const LATE_SCHEDULE = [4, 25, 4, 25, 2, 40, 2]

const LEVELS: readonly LevelSettings[] = [
  {
    heroSpeed: 6,
    heroSurchargeSpeed: 6.6,
    chaserSpeed: 5.6,
    vulnerableSpeed: 3.4,
    tunnelSpeed: 3,
    surchargeSeconds: 7,
    bonus: { kind: 'crystal', points: 100 },
    nestExitThresholds: [0, 15, 40],
    inactivitySeconds: 4,
    modeScheduleSeconds: FIRST_SCHEDULE,
  },
  {
    heroSpeed: 6.4,
    heroSurchargeSpeed: 6.8,
    chaserSpeed: 6,
    vulnerableSpeed: 3.6,
    tunnelSpeed: 3.2,
    surchargeSeconds: 6,
    bonus: { kind: 'ring', points: 250 },
    nestExitThresholds: [0, 0, 20],
    inactivitySeconds: 4,
    modeScheduleSeconds: MIDDLE_SCHEDULE,
  },
  {
    heroSpeed: 6.8,
    heroSurchargeSpeed: 7,
    chaserSpeed: 6.4,
    vulnerableSpeed: 3.8,
    tunnelSpeed: 3.4,
    surchargeSeconds: 5,
    bonus: { kind: 'lightning', points: 400 },
    nestExitThresholds: [0, 0, 0],
    inactivitySeconds: 4,
    modeScheduleSeconds: MIDDLE_SCHEDULE,
  },
  {
    heroSpeed: 7,
    heroSurchargeSpeed: 7.2,
    chaserSpeed: 6.8,
    vulnerableSpeed: 4,
    tunnelSpeed: 3.4,
    surchargeSeconds: 4,
    bonus: { kind: 'moon', points: 600 },
    nestExitThresholds: [0, 0, 0],
    inactivitySeconds: 4,
    modeScheduleSeconds: MIDDLE_SCHEDULE,
  },
  {
    heroSpeed: 7.2,
    heroSurchargeSpeed: 7.4,
    chaserSpeed: 7,
    vulnerableSpeed: 4,
    tunnelSpeed: 3.6,
    surchargeSeconds: 3,
    bonus: { kind: 'crown', points: 800 },
    nestExitThresholds: [0, 0, 0],
    inactivitySeconds: 3,
    modeScheduleSeconds: LATE_SCHEDULE,
  },
  {
    heroSpeed: 7.4,
    heroSurchargeSpeed: 7.5,
    chaserSpeed: 7.2,
    vulnerableSpeed: 4.2,
    tunnelSpeed: 3.6,
    surchargeSeconds: 2,
    bonus: { kind: 'diamond', points: 1200 },
    nestExitThresholds: [0, 0, 0],
    inactivitySeconds: 3,
    modeScheduleSeconds: LATE_SCHEDULE,
  },
  {
    heroSpeed: 7.5,
    heroSurchargeSpeed: 7.5,
    chaserSpeed: 7.4,
    vulnerableSpeed: 4.2,
    tunnelSpeed: 3.8,
    surchargeSeconds: 2,
    bonus: { kind: 'comet', points: 1800 },
    nestExitThresholds: [0, 0, 0],
    inactivitySeconds: 3,
    modeScheduleSeconds: LATE_SCHEDULE,
  },
  {
    heroSpeed: 7.5,
    heroSurchargeSpeed: 7.5,
    chaserSpeed: 7.6,
    vulnerableSpeed: 4.4,
    tunnelSpeed: 3.8,
    surchargeSeconds: 1,
    bonus: { kind: 'star', points: 2500 },
    nestExitThresholds: [0, 0, 0],
    inactivitySeconds: 3,
    modeScheduleSeconds: LATE_SCHEDULE,
  },
]

/** Settings of a level (1 and above); levels beyond the table use its last row. */
export function levelSettings(level: number): LevelSettings {
  if (!Number.isInteger(level) || level < 1) throw new Error(`Invalid level ${level}`)
  const settings = LEVELS[Math.min(level, LEVELS.length) - 1]
  if (!settings) throw new Error(`Missing settings for level ${level}`)
  return settings
}
