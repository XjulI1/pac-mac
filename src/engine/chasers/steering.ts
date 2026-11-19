import { DIRECTIONS, opposite } from '../directions'
import { MAZE, isWalkable, neighbour } from '../maze/maze'
import { randomChoice } from '../rng'
import type { Direction, Tile } from '../types'

/** How a chaser picks its way at a tile center: towards a target, or at random. */
export type Steering = { kind: 'target'; target: Tile } | { kind: 'random' }

/** Direction a chaser takes at the center of a tile, and the generator state after any draw. */
export function steer(
  rngState: number,
  tile: Tile,
  current: Direction,
  steering: Steering,
): { direction: Direction; rngState: number } {
  const options = openDirections(tile, current)
  if (options.length === 0) return { direction: opposite(current), rngState }
  if (options.length === 1 && options[0]) return { direction: options[0], rngState }
  if (steering.kind === 'random') {
    const draw = randomChoice(rngState, options)
    return { direction: draw.value, rngState: draw.state }
  }
  return { direction: closestTo(tile, options, steering.target), rngState }
}

function openDirections(tile: Tile, current: Direction): Direction[] {
  return DIRECTIONS.filter(
    (direction) => direction !== opposite(current) && isWalkable(MAZE, neighbour(MAZE, tile, direction)),
  )
}

function closestTo(tile: Tile, options: readonly Direction[], target: Tile): Direction {
  let best = options[0] ?? 'up'
  let bestDistance = Number.POSITIVE_INFINITY
  for (const direction of options) {
    const next = neighbour(MAZE, tile, direction)
    if (!next) continue
    const distance = (next.col - target.col) ** 2 + (next.row - target.row) ** 2
    if (distance < bestDistance) {
      best = direction
      bestDistance = distance
    }
  }
  return best
}
