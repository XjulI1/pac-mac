import { describe, expect, it } from 'vitest'
import { advance, isAtCenter, moveActor, stepDistance, type ChooseDirection, type Mover } from './actorMovement'
import { MAZE } from './maze/maze'
import type { Tile } from './types'
import { tileCenter } from './units'

const keepGoing: ChooseDirection = (_tile, current) => current

function moverAt(tile: Tile, direction: Mover['direction']): Mover {
  return { position: tileCenter(tile), direction, moving: true, carry: 0 }
}

describe('stepDistance', () => {
  it('moves a whole number of units and carries the rest', () => {
    expect(stepDistance(0, 720)).toEqual({ distance: 12, carry: 0 })
    expect(stepDistance(0, 768)).toEqual({ distance: 12, carry: 48 })
    expect(stepDistance(48, 768)).toEqual({ distance: 13, carry: 36 })
  })
})

describe('advance', () => {
  it('stops at the next center without passing it, then asks for a direction', () => {
    const calls: Tile[] = []
    const choose: ChooseDirection = (tile, current) => {
      calls.push(tile)
      return current
    }
    const start = { ...moverAt({ col: 1, row: 25 }, 'right'), position: { x: 230, y: 3060 } }
    const moved = advance(MAZE, start, 20, choose)
    expect(moved.position).toEqual({ x: 250, y: 3060 })
    expect(calls).toEqual([])
    const crossing = advance(MAZE, { ...start, position: { x: 290, y: 3060 } }, 20, choose)
    expect(crossing.position).toEqual({ x: 310, y: 3060 })
    expect(calls).toEqual([{ col: 2, row: 25 }])
  })

  it('asks for a direction at the center it starts from', () => {
    const turnUp: ChooseDirection = () => 'up'
    const moved = advance(MAZE, moverAt({ col: 9, row: 25 }, 'right'), 12, turnUp)
    expect(moved.position).toEqual({ x: 1140, y: 3048 })
    expect(moved.direction).toBe('up')
  })

  it('stops at a center when no direction is given', () => {
    const stop: ChooseDirection = () => null
    const moved = advance(MAZE, moverAt({ col: 1, row: 25 }, 'left'), 12, stop)
    expect(moved.position).toEqual({ x: 180, y: 3060 })
    expect(moved.moving).toBe(false)
    expect(moved.direction).toBe('left')
  })

  it('crosses the tunnel', () => {
    const moved = advance(MAZE, moverAt({ col: 0, row: 11 }, 'left'), 120, keepGoing)
    expect(moved.position).toEqual({ x: 2460, y: 1380 })
  })
})

describe('moveActor', () => {
  it('travels exactly 768 units in 60 ticks at 6.4 tiles per second', () => {
    let mover = moverAt({ col: 1, row: 25 }, 'right')
    for (let index = 0; index < 60; index++) mover = moveActor(MAZE, mover, 768, keepGoing)
    expect(mover.position.x - 180).toBe(768)
    expect(mover.carry).toBe(0)
  })
})

describe('isAtCenter', () => {
  it('recognises the center of a tile', () => {
    expect(isAtCenter({ x: 1260, y: 2100 })).toBe(true)
    expect(isAtCenter({ x: 1261, y: 2100 })).toBe(false)
  })
})
