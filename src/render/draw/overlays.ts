import type { VisibleText } from '../effects'
import { TEXT_COLOR } from '../palette'

const READY_ROW = 13
const READY_CENTER_COLUMN = 10.5
const READY_FONT = 0.8
const POINTS_FONT = 0.55
const LINE_HEIGHT = 0.6
const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", sans-serif'

/** Writes « Prêt ? » in the corridor under the nest. */
export function drawReady(ctx: CanvasRenderingContext2D, tile: number): void {
  ctx.save()
  ctx.font = `700 ${READY_FONT * tile}px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = TEXT_COLOR
  ctx.shadowColor = TEXT_COLOR
  ctx.shadowBlur = 0.3 * tile
  ctx.fillText('Prêt ?', READY_CENTER_COLUMN * tile, (READY_ROW + 0.5) * tile)
  ctx.restore()
}

/** Writes the floating points of captures and bonuses. */
export function drawTexts(ctx: CanvasRenderingContext2D, texts: readonly VisibleText[], tile: number): void {
  if (texts.length === 0) return
  ctx.save()
  ctx.font = `800 ${POINTS_FONT * tile}px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const text of texts) {
    ctx.globalAlpha = text.opacity
    ctx.fillStyle = text.color
    const x = (text.tile.col + 0.5) * tile
    const y = (text.tile.row + 0.5 - text.rise + text.line * LINE_HEIGHT) * tile
    ctx.fillText(text.text, x, y)
  }
  ctx.restore()
}
