import { DIRECTIONS, stepOf } from '../directions'
import type { Direction, Tile } from '../types'
import { BONUS_TILE, HERO_START_DIRECTION, LAYOUT, NEST_STARTS } from './layout'

/** Nature of a cell of the grid. */
export type Cell = 'wall' | 'pellet' | 'prism' | 'empty' | 'door' | 'nest'

/** The maze: its grid and its landmarks. */
export type Maze = {
  width: number
  height: number
  cells: readonly Cell[]
  heroStart: Tile
  heroStartDirection: Direction
  door: Tile
  nestExit: Tile
  regeneration: Tile
  bonusTile: Tile
  nestStarts: readonly Tile[]
  tunnel: readonly Tile[]
}

/** Options of a walkability check. */
export type WalkOptions = { throughDoor?: boolean }

const SYMBOLS: Record<string, Cell> = {
  '#': 'wall',
  '.': 'pellet',
  o: 'prism',
  ' ': 'empty',
  P: 'empty',
  '-': 'door',
  N: 'nest',
}

const CORRIDORS: readonly Cell[] = ['pellet', 'prism', 'empty']

type Grid = Pick<Maze, 'width' | 'height' | 'cells'>

/** Reads the rows of a maze; throws an error naming the row of any malformed line. */
export function parseMaze(rows: readonly string[]): Omit<Maze, 'bonusTile' | 'nestStarts' | 'heroStartDirection'> {
  const width = rows[0]?.length ?? 0
  if (width === 0) throw new Error('Maze row 0 is empty')
  const cells: Cell[] = []
  let heroStart: Tile | null = null
  let door: Tile | null = null
  for (const [row, line] of rows.entries()) {
    if (line.length !== width) {
      throw new Error(`Maze row ${row} has ${line.length} characters instead of ${width}`)
    }
    for (const [col, symbol] of [...line].entries()) {
      const cell = SYMBOLS[symbol]
      if (!cell) throw new Error(`Maze row ${row} has an unknown symbol "${symbol}" at column ${col}`)
      if (symbol === 'P') heroStart = { col, row }
      if (cell === 'door') door = { col, row }
      cells.push(cell)
    }
  }
  if (!heroStart) throw new Error('Maze has no start for Mac (P)')
  if (!door) throw new Error('Maze has no nest door (-)')
  const doorTile: Tile = door
  const grid: Grid = { width, height: rows.length, cells }
  return {
    ...grid,
    heroStart,
    door: doorTile,
    nestExit: { col: doorTile.col, row: doorTile.row - 1 },
    regeneration: { col: doorTile.col, row: doorTile.row + 1 },
    tunnel: findTunnel(grid),
  }
}

function findTunnel(grid: Grid): Tile[] {
  const tunnel: Tile[] = []
  for (let row = 0; row < grid.height; row++) {
    if (!isCorridor(grid, { col: 0, row }) || !isCorridor(grid, { col: grid.width - 1, row })) continue
    for (const [start, step] of [
      [0, 1],
      [grid.width - 1, -1],
    ] as const) {
      for (let col = start; isTunnelCell(grid, { col, row }); col += step) tunnel.push({ col, row })
    }
  }
  return tunnel
}

function isTunnelCell(grid: Grid, tile: Tile): boolean {
  return (
    isCorridor(grid, tile) &&
    !isCorridor(grid, { col: tile.col, row: tile.row - 1 }) &&
    !isCorridor(grid, { col: tile.col, row: tile.row + 1 })
  )
}

function isCorridor(grid: Grid, tile: Tile): boolean {
  return CORRIDORS.includes(cellAt(grid, tile))
}

/** Nature of a cell; anything outside the grid is a wall. */
export function cellAt(grid: Grid, tile: Tile): Cell {
  if (tile.row < 0 || tile.row >= grid.height || tile.col < 0 || tile.col >= grid.width) return 'wall'
  return grid.cells[tile.row * grid.width + tile.col] ?? 'wall'
}

/** Index of a tile in arrays laid out like the grid. */
export function tileIndex(grid: Grid, tile: Tile): number {
  return tile.row * grid.width + tile.col
}

/** Adjacent tile in a direction, wrapping across the columns; null above or below the grid. */
export function neighbour(grid: Grid, tile: Tile, direction: Direction): Tile | null {
  const { dc, dr } = stepOf(direction)
  const row = tile.row + dr
  if (row < 0 || row >= grid.height) return null
  return { col: (((tile.col + dc) % grid.width) + grid.width) % grid.width, row }
}

/** Whether a tile can be entered; the door and the nest only with `throughDoor`. */
export function isWalkable(grid: Grid, tile: Tile | null, options: WalkOptions = {}): boolean {
  if (!tile) return false
  const cell = cellAt(grid, tile)
  if (CORRIDORS.includes(cell)) return true
  return options.throughDoor === true && (cell === 'door' || cell === 'nest')
}

/** Whether a corridor tile has at least three walkable neighbours, the door counting as a wall. */
export function isIntersection(grid: Grid, tile: Tile): boolean {
  if (!isWalkable(grid, tile)) return false
  return DIRECTIONS.filter((direction) => isWalkable(grid, neighbour(grid, tile, direction))).length >= 3
}

/** The maze of PacMac. */
export const MAZE: Maze = {
  ...parseMaze(LAYOUT),
  heroStartDirection: HERO_START_DIRECTION,
  bonusTile: BONUS_TILE,
  nestStarts: NEST_STARTS,
}
