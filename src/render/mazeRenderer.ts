import { MAZE, TILE_UNITS, type GameState, type Point } from '../engine'
import { drawChaser } from './draw/chasers'
import { toPixels } from './draw/geometry'
import { drawHero } from './draw/hero'
import { drawBonus, drawItems } from './draw/items'
import { drawReady, drawTexts } from './draw/overlays'
import { clearWallLayers, wallLayer } from './draw/walls'
import { dyingVisual, showsReady, type Effects, type VisibleText } from './effects'
import { interpolatePoint, tunnelCopies } from './interpolation'
import { chaserLook, mouthOpening, nestBob, prismScale, wallColorAt } from './looks'
import { BACKGROUND_COLOR } from './palette'
import type { Viewport } from './viewport'

/** Everything needed to draw one frame. */
export type RenderFrame = {
  previous: GameState
  current: GameState
  alpha: number
  texts: readonly VisibleText[]
  trails: Effects['trails']
}

/** Draws frames of the game on a canvas. */
export type MazeRenderer = {
  resize(viewport: Viewport): void
  render(frame: RenderFrame): void
  dispose(): void
}

/** Creates a renderer for a canvas; it draws nothing until it has been given a size. */
export function createMazeRenderer(canvas: HTMLCanvasElement): MazeRenderer {
  const ctx = canvas.getContext('2d')
  let tile = 0
  let lastFrame: RenderFrame | null = null

  const render = (frame: RenderFrame) => {
    lastFrame = frame
    if (!ctx || tile === 0) return
    paint(ctx, frame, tile)
  }

  return {
    resize(viewport) {
      if (viewport.tile !== tile) clearWallLayers()
      tile = viewport.tile
      canvas.width = viewport.canvasWidth
      canvas.height = viewport.canvasHeight
      if (lastFrame) render(lastFrame)
    },
    render,
    dispose() {
      lastFrame = null
      clearWallLayers()
    },
  }
}

function paint(ctx: CanvasRenderingContext2D, frame: RenderFrame, tile: number): void {
  const { current, previous, alpha } = frame
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, MAZE.width * tile, MAZE.height * tile)
  ctx.drawImage(wallLayer(wallColorAt(current), tile), 0, 0)
  drawItems(ctx, current, tile, prismScale(current.phase, current.tickCount))
  if (current.bonus && current.phase.kind !== 'levelClear') drawBonus(ctx, current.bonus, tile)

  const dying = dyingVisual(current.phase)
  for (const chaser of current.chasers) {
    const look = dying && !dying.chasersVisible ? 'hidden' : chaserLook(chaser, current)
    if (look === 'hidden') continue
    const before = previous.chasers.find((candidate) => candidate.id === chaser.id)?.position ?? chaser.position
    const position = interpolatePoint(before, chaser.position, alpha)
    const bob = nestBob(chaser, current.tickCount) * TILE_UNITS
    const trail = (frame.trails[chaser.id] ?? []).map((point) => toPixels(point, tile))
    for (const x of tunnelCopies(position.x)) {
      drawChaser(
        ctx,
        { id: chaser.id, center: toPixels({ x, y: position.y + bob }, tile), direction: chaser.direction, look, tickCount: current.tickCount, trail },
        tile,
      )
    }
  }

  if (current.phase.kind !== 'gameOver') {
    const position = interpolatePoint(previous.hero.position, current.hero.position, alpha)
    const mouth = current.phase.kind === 'playing' ? mouthOpening(current.hero) : 0
    for (const x of tunnelCopies(position.x)) {
      const center: Point = toPixels({ x, y: position.y }, tile)
      drawHero(ctx, { center, direction: current.hero.direction, mouth, dissolve: dying?.dissolve ?? null }, tile)
    }
  }

  drawTexts(ctx, frame.texts, tile)
  if (showsReady(current.phase)) drawReady(ctx, tile)
}
