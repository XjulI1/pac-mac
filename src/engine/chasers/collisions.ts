import { addScore } from '../items'
import { catchHero } from '../lives'
import { MAZE } from '../maze/maze'
import { CAPTURE_FREEZE_SECONDS, CAPTURE_POINTS_STEP, FULL_CHAIN, FULL_CHAIN_BONUS } from '../rules'
import type { Chaser, ChaserId, GameEvent, GameState, Point } from '../types'
import { TILE_UNITS, secondsToTicks, tileOfPoint } from '../units'

/** Distance under which a chaser touches Mac, in internal units: half a tile. */
export const CONTACT_DISTANCE = TILE_UNITS / 2

const WORLD_WIDTH = MAZE.width * TILE_UNITS

/** Straight distance between two points, the shortest way round through the tunnel. */
export function distanceBetween(a: Point, b: Point): number {
  const dx = Math.abs(a.x - b.x)
  return Math.hypot(Math.min(dx, WORLD_WIDTH - dx), a.y - b.y)
}

/** Resolves every contact between Mac and the chasers; returns whether the game is still in play. */
export function resolveCollisions(state: GameState, events: GameEvent[]): boolean {
  let caught: { chaser: ChaserId; points: number } | null = null
  let dangerous: ChaserId | null = null
  state.chasers = state.chasers.map((chaser) => {
    if (!touches(state, chaser)) return chaser
    if (chaser.vulnerable) {
      caught = capture(state, chaser, events)
      return { ...chaser, status: 'spark', vulnerable: false }
    }
    dangerous ??= chaser.id
    return chaser
  })
  if (dangerous) {
    catchHero(state, dangerous, events)
    return false
  }
  if (caught) {
    const { chaser, points } = caught
    state.phase = { kind: 'chaserCaught', ticksLeft: secondsToTicks(CAPTURE_FREEZE_SECONDS), chaser, points }
    return false
  }
  return true
}

function touches(state: GameState, chaser: Chaser): boolean {
  if (chaser.status === 'spark' || chaser.status === 'entering' || chaser.status === 'inNest') return false
  return distanceBetween(state.hero.position, chaser.position) < CONTACT_DISTANCE
}

function capture(state: GameState, chaser: Chaser, events: GameEvent[]): { chaser: ChaserId; points: number } {
  const chain = (state.surcharge?.chain ?? 0) + 1
  if (state.surcharge) state.surcharge = { ...state.surcharge, chain }
  const points = CAPTURE_POINTS_STEP * chain
  const chainBonus = chain === FULL_CHAIN ? FULL_CHAIN_BONUS : 0
  addScore(state, points + chainBonus, events)
  events.push({ type: 'chaserCaught', chaser: chaser.id, points, chainBonus, tile: tileOfPoint(chaser.position, MAZE.width) })
  return { chaser: chaser.id, points }
}
