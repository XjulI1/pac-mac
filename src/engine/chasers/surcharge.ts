import { opposite } from '../directions'
import { levelSettings } from '../levels'
import type { GameEvent, GameState } from '../types'
import { secondsToTicks } from '../units'

/** Ticks before the end of a surcharge when the chasers start to flicker. */
export const SURCHARGE_WARNING_TICKS = 120

/** Starts or restarts a surcharge: chasers that are not sparks become vulnerable, active ones turn back. */
export function startSurcharge(state: GameState, events: GameEvent[]): void {
  const ticks = secondsToTicks(levelSettings(state.level).surchargeSeconds)
  state.surcharge = { ticksLeft: ticks, chain: 0 }
  state.chasers = state.chasers.map((chaser) => {
    if (chaser.status === 'spark' || chaser.status === 'entering') return chaser
    const direction = chaser.status === 'active' ? opposite(chaser.direction) : chaser.direction
    return { ...chaser, vulnerable: true, direction }
  })
  events.push({ type: 'surchargeStarted', ticks })
  if (ticks <= SURCHARGE_WARNING_TICKS) events.push({ type: 'surchargeEnding' })
}

/** Counts down the surcharge; at zero every chaser is dangerous again. */
export function tickSurcharge(state: GameState, events: GameEvent[]): void {
  if (!state.surcharge) return
  const ticksLeft = state.surcharge.ticksLeft - 1
  if (ticksLeft === SURCHARGE_WARNING_TICKS) events.push({ type: 'surchargeEnding' })
  if (ticksLeft > 0) {
    state.surcharge = { ...state.surcharge, ticksLeft }
    return
  }
  state.surcharge = null
  state.chasers = state.chasers.map((chaser) => ({ ...chaser, vulnerable: false }))
  events.push({ type: 'surchargeEnded' })
}
