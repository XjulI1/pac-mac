import { MAZE, type Bonus, type BonusKind, type GameState } from '../../engine'
import { BONUS_COLORS, PELLET_COLOR, PRISM_COLOR } from '../palette'

const PELLET_SIZE = 0.14
const PRISM_CORE = 0.15
const PRISM_RING = 0.27
const BONUS_SIZE = 0.85

/** Draws the pellets and prisms left in the maze. */
export function drawItems(ctx: CanvasRenderingContext2D, state: GameState, tile: number, prismScale: number): void {
  ctx.save()
  ctx.fillStyle = PELLET_COLOR
  state.items.forEach((item, index) => {
    if (item !== 'pellet') return
    const { x, y } = centerOf(index, tile)
    const size = Math.max(1, Math.round(PELLET_SIZE * tile))
    ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size)
  })
  state.items.forEach((item, index) => {
    if (item === 'prism') drawPrism(ctx, centerOf(index, tile), tile * prismScale)
  })
  ctx.restore()
}

/** Draws the visible bonus in its tile. */
export function drawBonus(ctx: CanvasRenderingContext2D, bonus: Bonus, tile: number): void {
  ctx.save()
  ctx.translate((MAZE.bonusTile.col + 0.5) * tile, (MAZE.bonusTile.row + 0.5) * tile)
  BONUS_ICONS[bonus.kind](ctx, BONUS_SIZE * tile)
  ctx.restore()
}

function drawPrism(ctx: CanvasRenderingContext2D, center: { x: number; y: number }, size: number): void {
  const gradient = ctx.createLinearGradient(center.x - size / 2, center.y - size / 2, center.x + size / 2, center.y + size / 2)
  gradient.addColorStop(0, '#7df9ff')
  gradient.addColorStop(0.5, '#ff7af0')
  gradient.addColorStop(1, '#fff27a')
  ctx.beginPath()
  ctx.arc(center.x, center.y, PRISM_RING * size, 0, Math.PI * 2)
  ctx.lineWidth = 0.07 * size
  ctx.strokeStyle = gradient
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(center.x, center.y, PRISM_CORE * size, 0, Math.PI * 2)
  ctx.fillStyle = PRISM_COLOR
  ctx.fill()
}

function centerOf(index: number, tile: number): { x: number; y: number } {
  return { x: ((index % MAZE.width) + 0.5) * tile, y: (Math.floor(index / MAZE.width) + 0.5) * tile }
}

/** Draws an icon of `size` pixels centered on the origin of the context. */
export type IconPainter = (ctx: CanvasRenderingContext2D, size: number) => void

function neon(color: string, trace: (ctx: CanvasRenderingContext2D, size: number) => void, filled = false): IconPainter {
  return (ctx, size) => {
    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = color
    ctx.fillStyle = color
    for (const [width, alpha] of [
      [0.16, 0.25],
      [0.07, 1],
    ] as const) {
      ctx.globalAlpha = alpha
      ctx.lineWidth = width * size
      ctx.beginPath()
      trace(ctx, size)
      if (filled && alpha === 1) ctx.fill()
      ctx.stroke()
    }
    ctx.restore()
  }
}

function polygon(ctx: CanvasRenderingContext2D, points: readonly (readonly [number, number])[], size: number): void {
  points.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x * size, y * size) : ctx.lineTo(x * size, y * size)))
  ctx.closePath()
}

function starPoints(spikes: number, outer: number, inner: number, rotation = -Math.PI / 2): [number, number][] {
  return Array.from({ length: spikes * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner
    const angle = rotation + (index * Math.PI) / spikes
    return [Math.cos(angle) * radius, Math.sin(angle) * radius]
  })
}

/** One neon icon per kind of bonus, shared with the HUD. */
export const BONUS_ICONS: Readonly<Record<BonusKind, IconPainter>> = {
  crystal: neon(BONUS_COLORS.crystal, (ctx, size) =>
    polygon(ctx, [[0, -0.42], [0.26, -0.15], [0.17, 0.4], [-0.17, 0.4], [-0.26, -0.15]], size),
  ),
  ring: neon(BONUS_COLORS.ring, (ctx, size) => {
    ctx.arc(0, 0.06 * size, 0.28 * size, 0, Math.PI * 2)
    ctx.moveTo(-0.1 * size, -0.3 * size)
    ctx.lineTo(0, -0.42 * size)
    ctx.lineTo(0.1 * size, -0.3 * size)
  }),
  lightning: neon(BONUS_COLORS.lightning, (ctx, size) =>
    polygon(ctx, [[0.08, -0.44], [-0.24, 0.04], [-0.02, 0.04], [-0.1, 0.44], [0.24, -0.06], [0.02, -0.06]], size),
  ),
  moon: neon(BONUS_COLORS.moon, (ctx, size) => {
    ctx.arc(0, 0, 0.36 * size, Math.PI * 0.35, Math.PI * 1.65)
    ctx.arc(0.16 * size, 0, 0.26 * size, Math.PI * 1.55, Math.PI * 0.45, true)
    ctx.closePath()
  }),
  crown: neon(BONUS_COLORS.crown, (ctx, size) =>
    polygon(ctx, [[-0.38, 0.3], [-0.38, -0.22], [-0.18, 0.02], [0, -0.32], [0.18, 0.02], [0.38, -0.22], [0.38, 0.3]], size),
  ),
  diamond: neon(BONUS_COLORS.diamond, (ctx, size) => {
    polygon(ctx, [[-0.38, -0.12], [-0.2, -0.34], [0.2, -0.34], [0.38, -0.12], [0, 0.4]], size)
    ctx.moveTo(-0.38 * size, -0.12 * size)
    ctx.lineTo(0.38 * size, -0.12 * size)
  }),
  comet: neon(BONUS_COLORS.comet, (ctx, size) => {
    ctx.arc(0.16 * size, -0.16 * size, 0.18 * size, 0, Math.PI * 2)
    ctx.moveTo(0.02 * size, -0.02 * size)
    ctx.lineTo(-0.38 * size, 0.38 * size)
    ctx.moveTo(0.14 * size, 0.06 * size)
    ctx.lineTo(-0.14 * size, 0.34 * size)
    ctx.moveTo(-0.06 * size, -0.14 * size)
    ctx.lineTo(-0.34 * size, 0.14 * size)
  }),
  star: neon(BONUS_COLORS.star, (ctx, size) => polygon(ctx, starPoints(5, 0.42, 0.18), size)),
}
