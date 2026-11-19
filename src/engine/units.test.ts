import { describe, expect, it } from 'vitest'
import {
  TICKS_PER_SECOND,
  TILE_UNITS,
  secondsToTicks,
  speedToUnitsPerSecond,
  tileCenter,
  tileOfPoint,
} from './units'

describe('units', () => {
  it('splits a tile into 120 units and a second into 60 ticks', () => {
    expect(TILE_UNITS).toBe(120)
    expect(TICKS_PER_SECOND).toBe(60)
  })

  it('places the center of a tile in the middle of its 120 units', () => {
    expect(tileCenter({ col: 10, row: 17 })).toEqual({ x: 1260, y: 2100 })
    expect(tileCenter({ col: 0, row: 0 })).toEqual({ x: 60, y: 60 })
  })

  it('finds the tile that contains a point', () => {
    expect(tileOfPoint({ x: 1260, y: 2100 }, 21)).toEqual({ col: 10, row: 17 })
    expect(tileOfPoint({ x: 239, y: 120 }, 21)).toEqual({ col: 1, row: 1 })
    expect(tileOfPoint({ x: 240, y: 119 }, 21)).toEqual({ col: 2, row: 0 })
  })

  it('wraps the abscissa of a point that left the grid through the tunnel', () => {
    expect(tileOfPoint({ x: -60, y: 1380 }, 21)).toEqual({ col: 20, row: 11 })
    expect(tileOfPoint({ x: 2520, y: 1380 }, 21)).toEqual({ col: 0, row: 11 })
  })

  it('converts seconds into ticks', () => {
    expect(secondsToTicks(4)).toBe(240)
    expect(secondsToTicks(2)).toBe(120)
    expect(secondsToTicks(0.5)).toBe(30)
  })

  it('converts a speed in tiles per second into units per second', () => {
    expect(speedToUnitsPerSecond(6)).toBe(720)
    expect(speedToUnitsPerSecond(6.4)).toBe(768)
    expect(speedToUnitsPerSecond(5.6)).toBe(672)
  })
})
