import { opposite } from '../directions'
import { levelSettings } from '../levels'
import type { GameEvent, GameState, Mode } from '../types'
import { secondsToTicks } from '../units'

/** Mode at the start of a level or after a lost life: patrol, first step of the schedule. */
export function initialMode(level: number): Mode {
  return modeAtStep(level, 0)
}

/** Counts down the mode schedule, suspended during a surcharge; a switch turns active chasers back. */
export function tickMode(state: GameState, events: GameEvent[]): void {
  if (state.surcharge || state.mode.ticksLeft === null) return
  const ticksLeft = state.mode.ticksLeft - 1
  if (ticksLeft > 0) {
    state.mode = { ...state.mode, ticksLeft }
    return
  }
  state.mode = modeAtStep(state.level, state.mode.step + 1)
  events.push({ type: 'modeChanged', mode: state.mode.kind })
  state.chasers = state.chasers.map((chaser) =>
    chaser.status === 'active' && !chaser.vulnerable ? { ...chaser, direction: opposite(chaser.direction) } : chaser,
  )
}

function modeAtStep(level: number, step: number): Mode {
  const seconds = levelSettings(level).modeScheduleSeconds[step]
  return {
    kind: step % 2 === 0 ? 'patrol' : 'chase',
    step,
    ticksLeft: seconds === undefined ? null : secondsToTicks(seconds),
  }
}
