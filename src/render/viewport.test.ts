import { describe, expect, it } from 'vitest'
import { fitMaze } from './viewport'

describe('fitMaze', () => {
  it('fits a 360 px phone in density 2', () => {
    expect(fitMaze(360, 560, 2)).toEqual({
      dpr: 2,
      tile: 34,
      canvasWidth: 714,
      canvasHeight: 918,
      cssWidth: 357,
      cssHeight: 459,
      offsetX: 1.5,
      offsetY: 50.5,
    })
  })

  it('fits a phone in density 3', () => {
    expect(fitMaze(390, 600, 3)).toMatchObject({ tile: 55, cssWidth: 385, cssHeight: 495 })
  })

  it('caps the density at 3', () => {
    expect(fitMaze(390, 600, 4)).toEqual(fitMaze(390, 600, 3))
  })

  it('fits a landscape desktop by its height', () => {
    expect(fitMaze(1280, 656, 1)).toMatchObject({ tile: 24, canvasWidth: 504, canvasHeight: 648 })
  })

  it('never goes below one pixel per tile', () => {
    expect(fitMaze(0, 0, 1).tile).toBe(1)
  })
})
