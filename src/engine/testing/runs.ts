import { createGame } from '../setup'
import type { GameEvent, GameState } from '../types'
import { autopilotInput } from './autopilot'
import { runTicks } from './builders'

/** Plays a new game with the autopilot for a number of ticks. */
export function playWithAutopilot(seed: number, ticks: number): { state: GameState; events: GameEvent[] } {
  return runTicks(createGame({ seed }), ticks, (_index, state) => autopilotInput(state))
}
