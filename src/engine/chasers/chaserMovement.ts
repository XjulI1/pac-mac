import { moveActor, stepDistance, type ChooseDirection } from '../actorMovement'
import { levelSettings } from '../levels'
import { MAZE } from '../maze/maze'
import type { Chaser, Direction, GameEvent, GameState, Point, Tile } from '../types'
import { speedToUnitsPerSecond, tileCenter, tileOfPoint } from '../units'
import { PROWLER_BOOST, SPARK_SPEED } from './roster'
import { steer } from './steering'
import { prowlerTarget, steeringFor } from './targets'

/** Speed of a chaser this tick, in internal units per second. */
export function chaserUnitsPerSecond(state: GameState, chaser: Chaser): number {
  const settings = levelSettings(state.level)
  if (chaser.status === 'spark' || chaser.status === 'entering') return speedToUnitsPerSecond(SPARK_SPEED)
  if (chaser.status === 'inNest' || chaser.status === 'leaving') return speedToUnitsPerSecond(settings.tunnelSpeed)
  if (chaser.vulnerable) return speedToUnitsPerSecond(settings.vulnerableSpeed)
  const tile = tileOfPoint(chaser.position, MAZE.width)
  if (isInTunnel(tile)) return speedToUnitsPerSecond(settings.tunnelSpeed)
  if (isProwlerOnSight(state, chaser, tile)) return speedToUnitsPerSecond(settings.chaserSpeed * PROWLER_BOOST)
  return speedToUnitsPerSecond(settings.chaserSpeed)
}

/** Moves every chaser for one tick, in order. */
export function moveChasers(state: GameState, events: GameEvent[]): void {
  state.chasers = state.chasers.map((chaser) => moveChaser(state, chaser, events))
}

/** Moves one chaser for one tick according to its status; may consume the game's generator. */
export function moveChaser(state: GameState, chaser: Chaser, events: GameEvent[]): Chaser {
  switch (chaser.status) {
    case 'inNest':
      return chaser
    case 'leaving':
      return leaveNest(state, chaser)
    case 'entering':
      return enterNest(state, chaser, events)
    case 'active':
    case 'spark':
      return roam(state, chaser)
  }
}

function roam(state: GameState, chaser: Chaser): Chaser {
  const choose: ChooseDirection = (tile, current) => {
    if (chaser.status === 'spark' && sameTile(tile, MAZE.nestExit)) return null
    const result = steer(state.rngState, tile, current, steeringFor(state, chaser, tile))
    state.rngState = result.rngState
    return result.direction
  }
  const mover = moveActor(
    MAZE,
    { position: chaser.position, direction: chaser.direction, moving: true, carry: chaser.carry },
    chaserUnitsPerSecond(state, chaser),
    choose,
  )
  const moved: Chaser = { ...chaser, position: mover.position, direction: mover.direction, carry: mover.carry }
  if (chaser.status === 'spark' && samePoint(moved.position, tileCenter(MAZE.nestExit))) {
    return { ...moved, status: 'entering', direction: 'down' }
  }
  return moved
}

function leaveNest(state: GameState, chaser: Chaser): Chaser {
  const exit = tileCenter(MAZE.nestExit)
  const step = stepDistance(chaser.carry, chaserUnitsPerSecond(state, chaser))
  let remaining = step.distance
  let { x, y } = chaser.position
  let direction: Direction = chaser.direction
  if (x !== exit.x) {
    const travel = Math.min(remaining, Math.abs(exit.x - x))
    direction = exit.x > x ? 'right' : 'left'
    x += Math.sign(exit.x - x) * travel
    remaining -= travel
  }
  if (remaining > 0 && x === exit.x && y > exit.y) {
    const travel = Math.min(remaining, y - exit.y)
    direction = 'up'
    y -= travel
  }
  const arrived = x === exit.x && y === exit.y
  return { ...chaser, position: { x, y }, direction, carry: step.carry, status: arrived ? 'active' : 'leaving' }
}

function enterNest(state: GameState, chaser: Chaser, events: GameEvent[]): Chaser {
  const regeneration = tileCenter(MAZE.regeneration)
  const step = stepDistance(chaser.carry, chaserUnitsPerSecond(state, chaser))
  const y = Math.min(regeneration.y, chaser.position.y + step.distance)
  const position = { x: chaser.position.x, y }
  if (y < regeneration.y) return { ...chaser, position, direction: 'down', carry: step.carry }
  events.push({ type: 'chaserRevived', chaser: chaser.id })
  return { ...chaser, position, direction: 'up', carry: step.carry, status: 'leaving', vulnerable: false }
}

function isInTunnel(tile: Tile): boolean {
  return MAZE.tunnel.some((cell) => sameTile(cell, tile))
}

function isProwlerOnSight(state: GameState, chaser: Chaser, tile: Tile): boolean {
  return chaser.id === 'prowler' && state.mode.kind === 'chase' && prowlerTarget(state, tile) !== null
}

function sameTile(a: Tile, b: Tile): boolean {
  return a.col === b.col && a.row === b.row
}

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y
}
