import { DIRECTIONS } from '../directions'
import { MAZE, isWalkable, neighbour, tileIndex } from '../maze/maze'
import { heroTile } from '../queries'
import type { Direction, GameInput, GameState, Tile } from '../types'

/** Direction of the first step towards the nearest item, found by breadth-first search from Mac's tile. */
export function autopilotInput(state: GameState): GameInput {
  const start = heroTile(state)
  const firstSteps = new Map<number, Direction | null>([[tileIndex(MAZE, start), null]])
  const queue: Tile[] = [start]
  for (let tile = queue.shift(); tile; tile = queue.shift()) {
    const firstStep = firstSteps.get(tileIndex(MAZE, tile)) ?? null
    if (firstStep && state.items[tileIndex(MAZE, tile)]) return { direction: firstStep }
    for (const direction of DIRECTIONS) {
      const next = neighbour(MAZE, tile, direction)
      if (!next || !isWalkable(MAZE, next) || firstSteps.has(tileIndex(MAZE, next))) continue
      firstSteps.set(tileIndex(MAZE, next), firstStep ?? direction)
      queue.push(next)
    }
  }
  return { direction: null }
}
