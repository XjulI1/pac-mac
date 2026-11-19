import type { Direction } from './types'

/** The four directions, in the order used to break ties. */
export const DIRECTIONS: readonly Direction[] = ['up', 'right', 'down', 'left']

const OPPOSITES: Record<Direction, Direction> = { up: 'down', right: 'left', down: 'up', left: 'right' }

const STEPS: Record<Direction, { dc: number; dr: number }> = {
  up: { dc: 0, dr: -1 },
  right: { dc: 1, dr: 0 },
  down: { dc: 0, dr: 1 },
  left: { dc: -1, dr: 0 },
}

/** Direction pointing the other way. */
export function opposite(direction: Direction): Direction {
  return OPPOSITES[direction]
}

/** Column and row offsets of one step in a direction. */
export function stepOf(direction: Direction): { dc: number; dr: number } {
  return STEPS[direction]
}

/** Whether a direction moves along the horizontal axis. */
export function isHorizontal(direction: Direction): boolean {
  return direction === 'left' || direction === 'right'
}
