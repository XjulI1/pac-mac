import type { Direction, Point } from '../../engine'
import { dissolvePixels } from '../effects'
import { eyeOffset } from '../looks'
import { BACKGROUND_COLOR, HERO_COLOR } from '../palette'
import { roundedSquare } from './geometry'

const BODY = 0.8
const CORNER = 0.22
const HALO = 1.05
const EYE_WIDTH = 0.1
const EYE_HEIGHT = 0.16
const EYE_SPREAD = 0.16
const EYE_HEIGHT_POSITION = -0.1
const MOUTH_WIDTH = 0.36
const MOUTH_POSITION = 0.17
const MOUTH_MIN = 0.03
const MOUTH_MAX = 0.17

/** What is needed to draw Mac at a given place. */
export type HeroPose = { center: Point; direction: Direction; mouth: number; dissolve: number | null }

/** Draws Mac, or the blocks he falls apart into. */
export function drawHero(ctx: CanvasRenderingContext2D, pose: HeroPose, tile: number): void {
  if (pose.dissolve !== null) {
    drawDissolve(ctx, pose.center, pose.dissolve, tile)
    return
  }
  const { x, y } = pose.center
  ctx.save()
  ctx.fillStyle = HERO_COLOR
  ctx.globalAlpha = 0.22
  ctx.beginPath()
  roundedSquare(ctx, x, y, HALO * tile, CORNER * 1.3 * tile)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.beginPath()
  roundedSquare(ctx, x, y, BODY * tile, CORNER * tile)
  ctx.fill()
  const look = eyeOffset(pose.direction)
  ctx.fillStyle = BACKGROUND_COLOR
  for (const side of [-1, 1]) {
    const eyeX = x + (side * EYE_SPREAD + look.x) * tile
    const eyeY = y + (EYE_HEIGHT_POSITION + look.y) * tile
    ctx.fillRect(eyeX - (EYE_WIDTH * tile) / 2, eyeY - (EYE_HEIGHT * tile) / 2, EYE_WIDTH * tile, EYE_HEIGHT * tile)
  }
  const mouthHeight = (MOUTH_MIN + (MOUTH_MAX - MOUTH_MIN) * pose.mouth) * tile
  ctx.fillRect(x - (MOUTH_WIDTH * tile) / 2, y + MOUTH_POSITION * tile - mouthHeight / 2, MOUTH_WIDTH * tile, mouthHeight)
  ctx.restore()
}

function drawDissolve(ctx: CanvasRenderingContext2D, center: Point, progress: number, tile: number): void {
  ctx.save()
  ctx.fillStyle = HERO_COLOR
  for (const block of dissolvePixels(progress)) {
    ctx.globalAlpha = block.opacity
    const size = block.size * tile
    ctx.fillRect(center.x + block.x * tile - size / 2, center.y + block.y * tile - size / 2, size, size)
  }
  ctx.restore()
}
