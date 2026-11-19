import type { Point, Tile } from './types'

/** Number of internal units in the side of a tile. */
export const TILE_UNITS = 120

/** Number of engine ticks in one second. */
export const TICKS_PER_SECOND = 60

/** Center of a tile, in internal units. */
export function tileCenter(tile: Tile): Point {
  return { x: tile.col * TILE_UNITS + TILE_UNITS / 2, y: tile.row * TILE_UNITS + TILE_UNITS / 2 }
}

/** Tile that contains a point, the abscissa being wrapped around a grid of `width` columns. */
export function tileOfPoint(point: Point, width: number): Tile {
  const col = Math.floor(point.x / TILE_UNITS)
  return { col: ((col % width) + width) % width, row: Math.floor(point.y / TILE_UNITS) }
}

/** Number of ticks in a duration given in seconds. */
export function secondsToTicks(seconds: number): number {
  return Math.round(seconds * TICKS_PER_SECOND)
}

/** Internal units per second for a speed given in tiles per second. */
export function speedToUnitsPerSecond(tilesPerSecond: number): number {
  return Math.round(tilesPerSecond * TILE_UNITS)
}
