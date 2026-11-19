import { initialMode } from './chasers/modes'
import { startingChasers } from './chasers/roster'
import { DYING_SECONDS, LEVEL_START_SECONDS } from './rules'
import { startingHero } from './setup'
import type { ChaserId, GameEvent, GameState } from './types'
import { secondsToTicks } from './units'

/** Mac is caught by a dangerous chaser: everything freezes while he falls apart. */
export function catchHero(state: GameState, by: ChaserId, events: GameEvent[]): void {
  state.phase = { kind: 'dying', ticksLeft: secondsToTicks(DYING_SECONDS), by }
  events.push({ type: 'heroCaught', by })
}

/** Counts down the fall of Mac, then takes a life and restarts the level or ends the game. */
export function tickDying(state: GameState, events: GameEvent[]): void {
  if (state.phase.kind !== 'dying') return
  const ticksLeft = state.phase.ticksLeft - 1
  if (ticksLeft > 0) {
    state.phase = { ...state.phase, ticksLeft }
    return
  }
  state.lives -= 1
  events.push({ type: 'lifeLost', livesLeft: state.lives })
  if (state.lives <= 0) {
    state.phase = { kind: 'gameOver' }
    events.push({ type: 'gameOver', score: state.score, level: state.level })
    return
  }
  resetActors(state)
  state.phase = { kind: 'ready', ticksLeft: secondsToTicks(LEVEL_START_SECONDS) }
}

/** Puts Mac and the chasers back at their start, and resets the mode, the nest, the surcharge and the bonus. */
export function resetActors(state: GameState): void {
  state.hero = startingHero()
  state.chasers = startingChasers()
  state.mode = initialMode(state.level)
  state.surcharge = null
  state.bonus = null
  state.nest = { itemsEatenSinceRestart: 0, ticksSinceLastItem: 0 }
}
