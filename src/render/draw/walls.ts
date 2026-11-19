import { MAZE } from '../../engine'
import { DOOR_COLOR } from '../palette'
import { offsetContour, simplifyContour, wallContours, type Contour } from '../wallContours'
import { roundedPath } from './geometry'

const INSET = 0.15
const TUBE_WIDTH = 0.12
const CORNER_RADIUS = 0.2
const FILL_OPACITY = 0.15
const GLOW = 0.35
const DOOR_HEIGHT = 0.1

const TUBES: readonly Contour[] = wallContours(MAZE).map((contour) => offsetContour(simplifyContour(contour), INSET))

const layers = new Map<string, HTMLCanvasElement>()

/** Pre-rendered wall layer for a color and a tile size, cached. */
export function wallLayer(color: string, tile: number): HTMLCanvasElement {
  const key = `${color}|${tile}`
  const cached = layers.get(key)
  if (cached) return cached
  const layer = document.createElement('canvas')
  layer.width = MAZE.width * tile
  layer.height = MAZE.height * tile
  const ctx = layer.getContext('2d')
  if (ctx) paintWalls(ctx, color, tile)
  layers.set(key, layer)
  return layer
}

/** Forgets the cached layers, after a change of size. */
export function clearWallLayers(): void {
  layers.clear()
}

function paintWalls(ctx: CanvasRenderingContext2D, color: string, tile: number): void {
  ctx.save()
  ctx.beginPath()
  for (const contour of TUBES) traceFillArea(ctx, contour, tile)
  ctx.globalAlpha = FILL_OPACITY
  ctx.fillStyle = color
  ctx.fill('nonzero')
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = TUBE_WIDTH * tile
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = color
  ctx.shadowBlur = GLOW * tile
  for (let pass = 0; pass < 2; pass++) {
    for (const contour of TUBES) {
      ctx.beginPath()
      roundedPath(ctx, scaled(contour, tile), CORNER_RADIUS * tile, contour.closed)
      ctx.stroke()
    }
    ctx.shadowBlur = 0
  }
  ctx.restore()

  ctx.save()
  ctx.fillStyle = DOOR_COLOR
  ctx.shadowColor = DOOR_COLOR
  ctx.shadowBlur = GLOW * tile
  ctx.fillRect(MAZE.door.col * tile, (MAZE.door.row + 0.5 - DOOR_HEIGHT / 2) * tile, tile, DOOR_HEIGHT * tile)
  ctx.restore()
}

function traceFillArea(ctx: CanvasRenderingContext2D, contour: Contour, tile: number): void {
  const points = scaled(contour, tile)
  if (points.length === 0) return
  ctx.moveTo(points[0]!.x, points[0]!.y)
  for (const point of points.slice(1)) ctx.lineTo(point.x, point.y)
  if (!contour.closed) {
    const width = MAZE.width * tile
    const height = MAZE.height * tile
    const end = points.at(-1)!
    const start = points[0]!
    const goingUp = end.y <= height / 2
    const edgeY = goingUp ? 0 : height
    ctx.lineTo(end.x <= 0 ? 0 : width, edgeY)
    ctx.lineTo(start.x <= 0 ? 0 : width, edgeY)
  }
  ctx.closePath()
}

function scaled(contour: Contour, tile: number) {
  return contour.points.map((point) => ({ x: point.x * tile, y: point.y * tile }))
}
