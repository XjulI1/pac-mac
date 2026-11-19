import { TILE_UNITS, type Point } from '../../engine'

/** Converts a position in engine units into device pixels, for a tile of `tile` pixels. */
export function toPixels(point: Point, tile: number): Point {
  return { x: (point.x * tile) / TILE_UNITS, y: (point.y * tile) / TILE_UNITS }
}

/** Traces a polyline with rounded corners of the given radius, closed or not. */
export function roundedPath(ctx: CanvasRenderingContext2D, points: readonly Point[], radius: number, closed: boolean): void {
  if (points.length < 2) return
  if (!closed) {
    ctx.moveTo(points[0]!.x, points[0]!.y)
    for (let index = 1; index < points.length - 1; index++) {
      ctx.arcTo(points[index]!.x, points[index]!.y, points[index + 1]!.x, points[index + 1]!.y, radius)
    }
    ctx.lineTo(points.at(-1)!.x, points.at(-1)!.y)
    return
  }
  const first = points[0]!
  const last = points.at(-1)!
  ctx.moveTo((first.x + last.x) / 2, (first.y + last.y) / 2)
  for (let index = 0; index < points.length; index++) {
    const corner = points[index]!
    const next = points[(index + 1) % points.length]!
    ctx.arcTo(corner.x, corner.y, (corner.x + next.x) / 2, (corner.y + next.y) / 2, radius)
  }
  ctx.closePath()
}

/** Traces a rounded square centered on (x, y). */
export function roundedSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius: number): void {
  const half = size / 2
  roundedPath(
    ctx,
    [
      { x: x - half, y: y - half },
      { x: x + half, y: y - half },
      { x: x + half, y: y + half },
      { x: x - half, y: y + half },
    ],
    radius,
    true,
  )
}
