import { describe, expect, it } from 'vitest'
import { interpolatePoint, tunnelCopies } from './interpolation'

describe('interpolatePoint', () => {
  it('draws a character halfway between two ticks', () => {
    expect(interpolatePoint({ x: 1260, y: 2100 }, { x: 1248, y: 2100 }, 0.5)).toEqual({ x: 1254, y: 2100 })
  })

  it('jumps through the tunnel', () => {
    expect(interpolatePoint({ x: 6, y: 1380 }, { x: 2514, y: 1380 }, 0.5)).toEqual({ x: 2514, y: 1380 })
  })

  it('jumps when a character is put back in place', () => {
    expect(interpolatePoint({ x: 180, y: 3060 }, { x: 1260, y: 2100 }, 0.3)).toEqual({ x: 1260, y: 2100 })
  })
})

describe('tunnelCopies', () => {
  it('draws a character near an edge on both sides', () => {
    expect(tunnelCopies(30)).toEqual([30, 2550])
    expect(tunnelCopies(2500)).toEqual([2500, -20])
  })

  it('draws a character once in the middle', () => {
    expect(tunnelCopies(1260)).toEqual([1260])
  })
})
