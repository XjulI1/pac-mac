import { MAZE, TILE_UNITS, type Point } from '../engine'

const WORLD_WIDTH = MAZE.width * TILE_UNITS
const HALF_TILE = TILE_UNITS / 2

/** Position drawn between the previous and the current tick; a jump of more than a tile is not smoothed. */
export function interpolatePoint(previous: Point, current: Point, alpha: number): Point {
  if (Math.abs(current.x - previous.x) > TILE_UNITS || Math.abs(current.y - previous.y) > TILE_UNITS) return current
  return { x: previous.x + (current.x - previous.x) * alpha, y: previous.y + (current.y - previous.y) * alpha }
}

/** Abscissas at which a character is drawn: twice when it straddles a side of the maze. */
export function tunnelCopies(x: number): number[] {
  if (x < HALF_TILE) return [x, x + WORLD_WIDTH]
  if (x > WORLD_WIDTH - HALF_TILE) return [x, x - WORLD_WIDTH]
  return [x]
}
