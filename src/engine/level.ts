import { resetActors } from './lives'
import { LEVEL_CLEAR_SECONDS, LEVEL_START_SECONDS } from './rules'
import { countItems, initialItems } from './setup'
import type { GameEvent, GameState } from './types'
import { secondsToTicks } from './units'

/** Ends the level once its last item is eaten: the maze flashes and the bonus goes away. */
export function clearLevel(state: GameState, events: GameEvent[]): void {
  state.phase = { kind: 'levelClear', ticksLeft: secondsToTicks(LEVEL_CLEAR_SECONDS) }
  state.bonus = null
  events.push({ type: 'levelCleared', level: state.level })
}

/** Counts down the flashing of a cleared level, then sets up the next one. */
export function tickLevelClear(state: GameState, events: GameEvent[]): void {
  if (state.phase.kind !== 'levelClear') return
  const ticksLeft = state.phase.ticksLeft - 1
  if (ticksLeft > 0) {
    state.phase = { kind: 'levelClear', ticksLeft }
    return
  }
  startNextLevel(state, events)
}

function startNextLevel(state: GameState, events: GameEvent[]): void {
  state.level += 1
  state.items = initialItems()
  state.itemsLeft = countItems(state.items)
  state.itemsEatenInLevel = 0
  state.bonusesShown = 0
  resetActors(state)
  state.phase = { kind: 'ready', ticksLeft: secondsToTicks(LEVEL_START_SECONDS) }
  events.push({ type: 'levelStarted', level: state.level })
}
