import { DIRECTIONS } from '../directions'
import { MAZE, isWalkable, neighbour, tileIndex } from '../maze/maze'
import { heroTile } from '../queries'
import type { Chaser, Direction, GameInput, GameState, Tile } from '../types'
import { tileOfPoint } from '../units'

const DANGER_RADIUS = 2

/** Like the autopilot, but avoids the tiles around dangerous chasers and runs away when cornered. */
export function cautiousAutopilotInput(state: GameState): GameInput {
  const dangers = state.chasers.filter(isDangerous).map((chaser) => tileOfPoint(chaser.position, MAZE.width))
  const blocked = blockedAround(dangers)
  const start = heroTile(state)
  const firstSteps = new Map<number, Direction | null>([[tileIndex(MAZE, start), null]])
  const queue: Tile[] = [start]
  for (let tile = queue.shift(); tile; tile = queue.shift()) {
    const firstStep = firstSteps.get(tileIndex(MAZE, tile)) ?? null
    if (firstStep && state.items[tileIndex(MAZE, tile)]) return { direction: firstStep }
    for (const direction of DIRECTIONS) {
      const next = neighbour(MAZE, tile, direction)
      if (!next || !isWalkable(MAZE, next) || firstSteps.has(tileIndex(MAZE, next))) continue
      if (blocked.has(tileIndex(MAZE, next))) continue
      firstSteps.set(tileIndex(MAZE, next), firstStep ?? direction)
      queue.push(next)
    }
  }
  return { direction: escapeDirection(start, dangers) }
}

function isDangerous(chaser: Chaser): boolean {
  return !chaser.vulnerable && (chaser.status === 'active' || chaser.status === 'leaving')
}

function blockedAround(dangers: readonly Tile[]): Set<number> {
  const blocked = new Set<number>()
  let frontier = [...dangers]
  for (let step = 0; step <= DANGER_RADIUS; step++) {
    const next: Tile[] = []
    for (const tile of frontier) {
      if (blocked.has(tileIndex(MAZE, tile))) continue
      blocked.add(tileIndex(MAZE, tile))
      for (const direction of DIRECTIONS) {
        const around = neighbour(MAZE, tile, direction)
        if (around && isWalkable(MAZE, around)) next.push(around)
      }
    }
    frontier = next
  }
  return blocked
}

function escapeDirection(start: Tile, dangers: readonly Tile[]): Direction | null {
  let best: Direction | null = null
  let bestDistance = -1
  for (const direction of DIRECTIONS) {
    const next = neighbour(MAZE, start, direction)
    if (!next || !isWalkable(MAZE, next)) continue
    const distance = Math.min(...dangers.map((danger) => (danger.col - next.col) ** 2 + (danger.row - next.row) ** 2))
    if (distance > bestDistance) {
      best = direction
      bestDistance = distance
    }
  }
  return best
}
