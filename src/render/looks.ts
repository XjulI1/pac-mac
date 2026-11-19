import {
  LEVEL_CLEAR_SECONDS,
  secondsToTicks,
  type Chaser,
  type ChaserId,
  type Direction,
  type GameState,
  type Hero,
  type Phase,
  type Point,
} from '../engine'
import { WALL_FLASH_COLOR, wallColor } from './palette'

/** How a chaser is drawn this frame. */
export type ChaserLook = 'hidden' | 'normal' | 'dim' | 'flash' | 'spark'

const HALF_STEP = 60
const MOUTH_PEAK = 30
const EYE_SHIFT = 0.12
const BOB_AMPLITUDE = 0.15
const BOB_PERIOD = 60
const PRISM_PERIOD = 40
const PRISM_MIN_SCALE = 0.75
const FLICKER_TICKS = 8
const FLICKER_WINDOW = 120
const WALL_FLASH_TICKS = 15
const DYING_FREEZE_TICKS = 30
const DYING_TICKS = 120

const BOB_PHASES: Readonly<Record<ChaserId, number>> = {
  hound: 0,
  cutter: Math.PI / 2,
  warden: Math.PI,
  prowler: (3 * Math.PI) / 2,
}

const EYE_OFFSETS: Readonly<Record<Direction, Point>> = {
  up: { x: 0, y: -EYE_SHIFT },
  right: { x: EYE_SHIFT, y: 0 },
  down: { x: 0, y: EYE_SHIFT },
  left: { x: -EYE_SHIFT, y: 0 },
}

/** Opening of Mac's mouth, from 0 (closed) to 1: twice per tile, closed when he stops. */
export function mouthOpening(hero: Hero): number {
  if (!hero.moving) return 0
  const along = hero.direction === 'left' || hero.direction === 'right' ? hero.position.x : hero.position.y
  const offset = ((along % HALF_STEP) + HALF_STEP) % HALF_STEP
  return Math.min(offset, HALF_STEP - offset) / MOUTH_PEAK
}

/** Shift of Mac's eyes towards his direction, in tiles. */
export function eyeOffset(direction: Direction): Point {
  return EYE_OFFSETS[direction]
}

/** Vertical bobbing of a chaser waiting in the nest, in tiles. */
export function nestBob(chaser: Chaser, tickCount: number): number {
  if (chaser.status !== 'inNest') return 0
  return BOB_AMPLITUDE * Math.sin((2 * Math.PI * tickCount) / BOB_PERIOD + BOB_PHASES[chaser.id])
}

/** Scale of the prisms, pulsing during play and still during « Prêt ? ». */
export function prismScale(phase: Phase, tickCount: number): number {
  if (phase.kind === 'ready') return 1
  const wave = (1 + Math.cos((2 * Math.PI * tickCount) / PRISM_PERIOD)) / 2
  return PRISM_MIN_SCALE + (1 - PRISM_MIN_SCALE) * wave
}

/** Wall color this frame: the level color, flashing with white once the level is cleared. */
export function wallColorAt(state: GameState): string {
  if (state.phase.kind !== 'levelClear') return wallColor(state.level)
  const elapsed = secondsToTicks(LEVEL_CLEAR_SECONDS) - state.phase.ticksLeft
  return Math.floor(elapsed / WALL_FLASH_TICKS) % 2 === 0 ? wallColor(state.level) : WALL_FLASH_COLOR
}

/** How a chaser is drawn, given its state and the phase of the game. */
export function chaserLook(chaser: Chaser, state: GameState): ChaserLook {
  const { phase } = state
  if (phase.kind === 'levelClear' || phase.kind === 'gameOver') return 'hidden'
  if (phase.kind === 'dying' && DYING_TICKS - phase.ticksLeft >= DYING_FREEZE_TICKS) return 'hidden'
  if (phase.kind === 'chaserCaught' && phase.chaser === chaser.id) return 'hidden'
  if (chaser.status === 'spark' || chaser.status === 'entering') return 'spark'
  if (!chaser.vulnerable) return 'normal'
  const ticksLeft = state.surcharge?.ticksLeft ?? 0
  if (ticksLeft > FLICKER_WINDOW) return 'dim'
  return Math.floor(state.tickCount / FLICKER_TICKS) % 2 === 0 ? 'dim' : 'flash'
}
