import { MAZE } from '../engine'

/** Size and position of the maze canvas in its container. */
export type Viewport = {
  dpr: number
  tile: number
  canvasWidth: number
  canvasHeight: number
  cssWidth: number
  cssHeight: number
  offsetX: number
  offsetY: number
}

const MAX_DPR = 3

/** Largest whole tile size, in device pixels, that fits the maze in a container, centered. */
export function fitMaze(containerWidth: number, containerHeight: number, devicePixelRatio: number): Viewport {
  const dpr = Math.min(Math.max(devicePixelRatio, 1), MAX_DPR)
  const tile = Math.max(1, Math.floor(Math.min((containerWidth * dpr) / MAZE.width, (containerHeight * dpr) / MAZE.height)))
  const canvasWidth = tile * MAZE.width
  const canvasHeight = tile * MAZE.height
  const cssWidth = canvasWidth / dpr
  const cssHeight = canvasHeight / dpr
  return {
    dpr,
    tile,
    canvasWidth,
    canvasHeight,
    cssWidth,
    cssHeight,
    offsetX: (containerWidth - cssWidth) / 2,
    offsetY: (containerHeight - cssHeight) / 2,
  }
}
