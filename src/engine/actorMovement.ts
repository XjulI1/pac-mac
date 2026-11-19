import { isHorizontal, stepOf } from './directions'
import type { Maze } from './maze/maze'
import type { Direction, Point, Tile } from './types'
import { TICKS_PER_SECOND, TILE_UNITS, tileOfPoint } from './units'

/** Anything that moves along the corridors: Mac, and later the chasers. */
export type Mover = { position: Point; direction: Direction; moving: boolean; carry: number }

/** Direction to take at the center of a tile, or null to stop there. */
export type ChooseDirection = (tile: Tile, current: Direction, moving: boolean) => Direction | null

type Grid = Pick<Maze, 'width'>

const HALF_TILE = TILE_UNITS / 2

/** Whole units to travel this tick at a speed, and the remainder to carry, in 1/60 of a unit. */
export function stepDistance(carry: number, unitsPerSecond: number): { distance: number; carry: number } {
  const total = carry + unitsPerSecond
  const distance = Math.floor(total / TICKS_PER_SECOND)
  return { distance, carry: total - distance * TICKS_PER_SECOND }
}

/** Whether a point is exactly at the center of a tile. */
export function isAtCenter(point: Point): boolean {
  return modulo(point.x, TILE_UNITS) === HALF_TILE && modulo(point.y, TILE_UNITS) === HALF_TILE
}

/** Moves a mover by `distance` units, asking `choose` for a direction at every tile center it reaches. */
export function advance<T extends Mover>(grid: Grid, mover: T, distance: number, choose: ChooseDirection): T {
  let { x, y } = mover.position
  let direction = mover.direction
  let moving = mover.moving
  let remaining = distance
  const worldWidth = grid.width * TILE_UNITS
  while (remaining > 0) {
    if (isAtCenter({ x, y })) {
      const next = choose(tileOfPoint({ x, y }, grid.width), direction, moving)
      if (next === null) {
        moving = false
        break
      }
      direction = next
      moving = true
    }
    const travel = Math.min(remaining, distanceToNextCenter({ x, y }, direction))
    const { dc, dr } = stepOf(direction)
    x = modulo(x + dc * travel, worldWidth)
    y += dr * travel
    remaining -= travel
  }
  return { ...mover, position: { x, y }, direction, moving }
}

/** Moves a mover for one tick at a speed in units per second. */
export function moveActor<T extends Mover>(grid: Grid, mover: T, unitsPerSecond: number, choose: ChooseDirection): T {
  const step = stepDistance(mover.carry, unitsPerSecond)
  return advance(grid, { ...mover, carry: step.carry }, step.distance, choose)
}

function distanceToNextCenter(point: Point, direction: Direction): number {
  const along = isHorizontal(direction) ? point.x : point.y
  const offset = modulo(along, TILE_UNITS) - HALF_TILE
  const { dc, dr } = stepOf(direction)
  if (dc + dr > 0) return offset < 0 ? -offset : TILE_UNITS - offset
  return offset > 0 ? offset : TILE_UNITS + offset
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}
