import type { ChaserId, Direction, Point } from '../../engine'
import type { ChaserLook } from '../looks'
import { CHASER_COLORS, SPARK_COLOR, VULNERABLE_COLOR, VULNERABLE_FLASH_COLOR } from '../palette'

const RADIUS = 0.42
const HALO_SCALE = 1.3
const DOT_RADIUS = 0.07
const DOT_DISTANCE = 0.22
const SPARK_RADIUS = 0.1
const TRAIL_RADIUS = 0.07
const OUTLINE = 0.08
const PROWLER_SPIN = 0.04

const ANGLES: Readonly<Record<Direction, number>> = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
}

/** What is needed to draw a chaser at a given place. */
export type ChaserPose = {
  id: ChaserId
  center: Point
  direction: Direction
  look: ChaserLook
  tickCount: number
  trail: readonly Point[]
}

/** Draws a chaser in its look of the moment: normal, dim, flash, spark or nothing. */
export function drawChaser(ctx: CanvasRenderingContext2D, pose: ChaserPose, tile: number): void {
  if (pose.look === 'hidden') return
  if (pose.look === 'spark') {
    drawSpark(ctx, pose, tile)
    return
  }
  const color = CHASER_COLORS[pose.id]
  const rotation = pose.id === 'prowler' ? pose.tickCount * PROWLER_SPIN : 0
  ctx.save()
  ctx.translate(pose.center.x, pose.center.y)
  if (pose.look === 'normal') {
    ctx.fillStyle = color
    ctx.globalAlpha = 0.22
    traceShape(ctx, pose.id, pose.direction, RADIUS * HALO_SCALE * tile, rotation)
    ctx.fill()
    ctx.globalAlpha = 1
    traceShape(ctx, pose.id, pose.direction, RADIUS * tile, rotation)
    ctx.fill()
    const angle = ANGLES[pose.direction]
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(Math.cos(angle) * DOT_DISTANCE * tile, Math.sin(angle) * DOT_DISTANCE * tile, DOT_RADIUS * tile, 0, Math.PI * 2)
    ctx.fill()
  } else {
    const outline = pose.look === 'flash' ? VULNERABLE_FLASH_COLOR : VULNERABLE_COLOR
    traceShape(ctx, pose.id, pose.direction, RADIUS * tile, rotation)
    ctx.globalAlpha = 0.18
    ctx.fillStyle = outline
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.lineWidth = OUTLINE * tile
    ctx.lineJoin = 'round'
    ctx.strokeStyle = outline
    ctx.stroke()
  }
  ctx.restore()
}

function drawSpark(ctx: CanvasRenderingContext2D, pose: ChaserPose, tile: number): void {
  ctx.save()
  ctx.fillStyle = CHASER_COLORS[pose.id]
  pose.trail.forEach((point, index) => {
    ctx.globalAlpha = ((index + 1) / (pose.trail.length + 1)) * 0.7
    ctx.beginPath()
    ctx.arc(point.x, point.y, TRAIL_RADIUS * tile, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
  ctx.fillStyle = SPARK_COLOR
  ctx.beginPath()
  ctx.arc(pose.center.x, pose.center.y, SPARK_RADIUS * tile, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function traceShape(ctx: CanvasRenderingContext2D, id: ChaserId, direction: Direction, radius: number, rotation: number): void {
  ctx.beginPath()
  const points = shapeOf(id, direction, rotation)
  points.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x * radius, y * radius) : ctx.lineTo(x * radius, y * radius)))
  ctx.closePath()
}

function shapeOf(id: ChaserId, direction: Direction, rotation: number): [number, number][] {
  switch (id) {
    case 'hound':
      return regular(3, ANGLES[direction], 1)
    case 'cutter':
      return [
        [0, -1],
        [0.72, 0],
        [0, 1],
        [-0.72, 0],
      ]
    case 'warden':
      return regular(6, Math.PI / 6, 0.95)
    case 'prowler':
      return Array.from({ length: 8 }, (_, index) => {
        const radius = index % 2 === 0 ? 1 : 0.42
        const angle = rotation - Math.PI / 2 + (index * Math.PI) / 4
        return [Math.cos(angle) * radius, Math.sin(angle) * radius]
      })
  }
}

function regular(sides: number, start: number, radius: number): [number, number][] {
  return Array.from({ length: sides }, (_, index) => {
    const angle = start + (index * 2 * Math.PI) / sides
    return [Math.cos(angle) * radius, Math.sin(angle) * radius]
  })
}
