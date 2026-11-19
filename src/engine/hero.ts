import { moveActor, type ChooseDirection } from './actorMovement'
import { opposite } from './directions'
import { MAZE, isWalkable, neighbour } from './maze/maze'
import { WANTED_DIRECTION_SECONDS } from './rules'
import type { GameInput, Hero } from './types'
import { secondsToTicks } from './units'

/** Records a requested direction; a new request, even the same one, restarts its memory. */
export function rememberDirection(hero: Hero, input: GameInput): Hero {
  if (!input.direction) return hero
  return { ...hero, wantedDirection: input.direction, wantedTicksLeft: secondsToTicks(WANTED_DIRECTION_SECONDS) }
}

/** Moves Mac for one tick: immediate reversal, turns at tile centers, stop against walls, memory countdown. */
export function moveHero(hero: Hero, unitsPerSecond: number): Hero {
  let wantedTaken = false
  let current = hero
  if (current.moving && current.wantedDirection === opposite(current.direction)) {
    current = { ...current, direction: current.wantedDirection }
    wantedTaken = true
  }
  const wanted = wantedTaken ? null : current.wantedDirection
  const choose: ChooseDirection = (tile, direction, moving) => {
    if (wanted && isWalkable(MAZE, neighbour(MAZE, tile, wanted))) {
      wantedTaken = true
      return wanted
    }
    if (moving && isWalkable(MAZE, neighbour(MAZE, tile, direction))) return direction
    return null
  }
  const moved = moveActor(MAZE, current, unitsPerSecond, choose)
  return wantedTaken ? forgetWanted(moved) : countDownWanted(moved)
}

function countDownWanted(hero: Hero): Hero {
  if (!hero.wantedDirection) return hero
  const wantedTicksLeft = hero.wantedTicksLeft - 1
  return wantedTicksLeft > 0 ? { ...hero, wantedTicksLeft } : forgetWanted(hero)
}

function forgetWanted(hero: Hero): Hero {
  return { ...hero, wantedDirection: null, wantedTicksLeft: 0 }
}
