import { levelSettings, type LevelSettings } from './levels'
import { MAZE, tileIndex } from './maze/maze'
import type { GameState, Item, Tile } from './types'
import { tileOfPoint } from './units'

/** A quarter of the maze, the middle column belonging to none. */
export type Quarter = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

const MIDDLE_COLUMN = Math.floor(MAZE.width / 2)
const LAST_TOP_ROW = Math.floor(MAZE.height / 2)

/** Tile that contains the center of Mac. */
export function heroTile(state: GameState): Tile {
  return tileOfPoint(state.hero.position, MAZE.width)
}

/** Item left in a tile, null when there is none. */
export function itemAt(state: GameState, tile: Tile): Item {
  return state.items[tileIndex(MAZE, tile)] ?? null
}

/** Number of items left in each quarter of the maze. */
export function itemsLeftByQuarter(state: GameState): Record<Quarter, number> {
  const counts: Record<Quarter, number> = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }
  state.items.forEach((item, index) => {
    if (!item) return
    const quarter = quarterOf({ col: index % MAZE.width, row: Math.floor(index / MAZE.width) })
    if (quarter) counts[quarter] += 1
  })
  return counts
}

/** Quarter of the maze that holds a tile, null for the middle column. */
export function quarterOf(tile: Tile): Quarter | null {
  if (tile.col === MIDDLE_COLUMN) return null
  const top = tile.row <= LAST_TOP_ROW
  const left = tile.col < MIDDLE_COLUMN
  if (top) return left ? 'topLeft' : 'topRight'
  return left ? 'bottomLeft' : 'bottomRight'
}

/** Settings of the level being played. */
export function currentLevelSettings(state: GameState): LevelSettings {
  return levelSettings(state.level)
}
