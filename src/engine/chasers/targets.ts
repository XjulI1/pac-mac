import { DIRECTIONS, opposite } from '../directions'
import { MAZE, isIntersection, isWalkable, neighbour } from '../maze/maze'
import { heroTile, itemsLeftByQuarter, type Quarter } from '../queries'
import type { Chaser, ChaserId, Direction, GameState, Tile } from '../types'
import { CUTTER_LOOKAHEAD, PATROL_CORNERS, WARDEN_RANGE } from './roster'
import type { Steering } from './steering'

const QUARTER_ANCHORS: readonly { quarter: Quarter; anchor: Tile }[] = [
  { quarter: 'topLeft', anchor: { col: 5, row: 4 } },
  { quarter: 'topRight', anchor: { col: 15, row: 4 } },
  { quarter: 'bottomLeft', anchor: { col: 5, row: 21 } },
  { quarter: 'bottomRight', anchor: { col: 15, row: 21 } },
]

/** Corner a chaser aims at while patrolling. */
export function patrolTarget(id: ChaserId): Tile {
  return PATROL_CORNERS[id]
}

/** Target of the Limier while chasing: the tile of Mac. */
export function houndTarget(state: GameState): Tile {
  return heroTile(state)
}

/** Target of the Coupeur while chasing: the next intersection ahead of Mac, bends included. */
export function cutterTarget(state: GameState): Tile {
  let tile = heroTile(state)
  if (!state.hero.moving) return tile
  let direction: Direction = state.hero.direction
  for (let step = 0; step < CUTTER_LOOKAHEAD; step++) {
    const exits = DIRECTIONS.filter(
      (candidate) => candidate !== opposite(direction) && isWalkable(MAZE, neighbour(MAZE, tile, candidate)),
    )
    if (!exits.includes(direction)) {
      if (exits.length !== 1 || !exits[0]) break
      direction = exits[0]
    }
    const next = neighbour(MAZE, tile, direction)
    if (!next) break
    tile = next
    if (isIntersection(MAZE, tile)) break
  }
  return tile
}

/** Target of the Gardien while chasing: Mac within range, otherwise the richest quarter. */
export function wardenTarget(state: GameState, wardenTile: Tile): Tile {
  const mac = heroTile(state)
  if (Math.abs(mac.col - wardenTile.col) + Math.abs(mac.row - wardenTile.row) <= WARDEN_RANGE) return mac
  const counts = itemsLeftByQuarter(state)
  let best = QUARTER_ANCHORS[0]!
  for (const candidate of QUARTER_ANCHORS) if (counts[candidate.quarter] > counts[best.quarter]) best = candidate
  return best.anchor
}

/** Target of the Fureteur while chasing: Mac if it sees him, otherwise none. */
export function prowlerTarget(state: GameState, prowlerTile: Tile): Tile | null {
  const mac = heroTile(state)
  return sees(prowlerTile, mac) ? mac : null
}

/** Whether two tiles share a row or a column with only corridors between them, the tunnel not wrapping. */
export function sees(from: Tile, to: Tile): boolean {
  if (from.row === to.row) return clearBetween(from.col, to.col, (col) => ({ col, row: from.row }))
  if (from.col === to.col) return clearBetween(from.row, to.row, (row) => ({ col: from.col, row }))
  return false
}

function clearBetween(a: number, b: number, tileAt: (index: number) => Tile): boolean {
  for (let index = Math.min(a, b) + 1; index < Math.max(a, b); index++) {
    if (!isWalkable(MAZE, tileAt(index))) return false
  }
  return true
}

/** How a chaser picks its way at the center of `tile`, given its state and the mode. */
export function steeringFor(state: GameState, chaser: Chaser, tile: Tile): Steering {
  if (chaser.status === 'spark') return { kind: 'target', target: MAZE.nestExit }
  if (chaser.vulnerable) return { kind: 'random' }
  if (state.mode.kind === 'patrol') return { kind: 'target', target: patrolTarget(chaser.id) }
  const target = chaseTarget(state, chaser.id, tile)
  return target ? { kind: 'target', target } : { kind: 'random' }
}

function chaseTarget(state: GameState, id: ChaserId, tile: Tile): Tile | null {
  switch (id) {
    case 'hound':
      return houndTarget(state)
    case 'cutter':
      return cutterTarget(state)
    case 'warden':
      return wardenTarget(state, tile)
    case 'prowler':
      return prowlerTarget(state, tile)
  }
}
