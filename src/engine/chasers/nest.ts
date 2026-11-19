import { levelSettings } from '../levels'
import type { GameEvent, GameState } from '../types'
import { secondsToTicks } from '../units'
import { NEST_ORDER } from './roster'

/** Records an item eaten for the nest: one more towards the thresholds, inactivity back to zero. */
export function noteItemEaten(state: GameState): void {
  state.nest = { itemsEatenSinceRestart: state.nest.itemsEatenSinceRestart + 1, ticksSinceLastItem: 0 }
}

/** Lets the next waiting chaser out when its threshold is reached or Mac has eaten nothing for too long. */
export function releaseFromNest(state: GameState, events: GameEvent[], ateItem: boolean): void {
  if (!ateItem) state.nest = { ...state.nest, ticksSinceLastItem: state.nest.ticksSinceLastItem + 1 }
  const index = NEST_ORDER.findIndex((id) => state.chasers.some((chaser) => chaser.id === id && chaser.status === 'inNest'))
  const id = NEST_ORDER[index]
  if (!id) return
  const settings = levelSettings(state.level)
  const threshold = settings.nestExitThresholds[index] ?? 0
  const idle = state.nest.ticksSinceLastItem >= secondsToTicks(settings.inactivitySeconds)
  if (state.nest.itemsEatenSinceRestart < threshold && !idle) return
  if (idle) state.nest = { ...state.nest, ticksSinceLastItem: 0 }
  state.chasers = state.chasers.map((chaser) => (chaser.id === id ? { ...chaser, status: 'leaving' } : chaser))
  events.push({ type: 'chaserReleased', chaser: id })
}
