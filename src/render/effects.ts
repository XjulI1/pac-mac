import { MAZE, type ChaserId, type GameEvent, type GameState, type Phase, type Point, type Tile } from '../engine'
import { formatScore } from '../format'
import { BONUS_COLORS, CHASER_COLORS } from './palette'

/** A number of points floating above the maze. */
export type FloatingText = { text: string; color: string; tile: Tile; line: number; startTick: number; duration: number }

/** A floating text as drawn this frame: risen by `rise` tiles, with its opacity. */
export type VisibleText = { text: string; color: string; tile: Tile; line: number; rise: number; opacity: number }

/** Effects kept by the renderer, outside of the game state. */
export type Effects = { texts: FloatingText[]; trails: Partial<Record<ChaserId, Point[]>> }

/** How the loss of a life is drawn: chasers visible or not, and Mac intact (null) or dissolving (0 to 1). */
export type DyingVisual = { chasersVisible: boolean; dissolve: number | null }

/** One of the 25 blocks of a dissolving Mac, in tiles around his center. */
export type DissolveBlock = { x: number; y: number; size: number; opacity: number }

const CAPTURE_TICKS = 60
const BONUS_TICKS = 90
const RISE = 0.5
const TRAIL_LENGTH = 6
const DYING_TICKS = 120
const DYING_FREEZE_TICKS = 30
const BLOCKS_PER_SIDE = 5
const HERO_SIZE = 0.8
const SCATTER = 0.6

/** No effect yet. */
export function createEffects(): Effects {
  return { texts: [], trails: {} }
}

/** Adds the floating points of captures and bonuses found in the events of a tick. */
export function recordEvents(effects: Effects, events: readonly GameEvent[], state: GameState): Effects {
  const texts = [...effects.texts]
  for (const event of events) {
    if (event.type === 'chaserCaught') {
      const color = CHASER_COLORS[event.chaser]
      texts.push(floating(formatScore(event.points), color, event.tile, 0, state.tickCount, CAPTURE_TICKS))
      if (event.chainBonus > 0) {
        texts.push(floating(`+${formatScore(event.chainBonus)}`, color, event.tile, 1, state.tickCount, CAPTURE_TICKS))
      }
    }
    if (event.type === 'bonusEaten') {
      texts.push(floating(formatScore(event.points), BONUS_COLORS[event.kind], MAZE.bonusTile, 0, state.tickCount, BONUS_TICKS))
    }
  }
  return { ...effects, texts }
}

/** Texts to draw at a tick, and the effects without the expired ones. */
export function visibleEffects(effects: Effects, tickCount: number): { effects: Effects; texts: VisibleText[] } {
  const alive = effects.texts.filter((text) => tickCount < text.startTick + text.duration)
  const texts = alive.map((text) => {
    const progress = Math.max(0, tickCount - text.startTick) / text.duration
    return { text: text.text, color: text.color, tile: text.tile, line: text.line, rise: RISE * progress, opacity: 1 - progress }
  })
  return { effects: { ...effects, texts: alive }, texts }
}

/** Adds a position to a spark trail, keeping the last six. */
export function pushTrail(trail: readonly Point[], position: Point): Point[] {
  return [...trail, position].slice(-TRAIL_LENGTH)
}

/** Extends the trail of every spark and forgets the trail of the other chasers. */
export function updateTrails(effects: Effects, state: GameState): Effects {
  const trails: Partial<Record<ChaserId, Point[]>> = {}
  for (const chaser of state.chasers) {
    if (chaser.status !== 'spark' && chaser.status !== 'entering') continue
    trails[chaser.id] = pushTrail(effects.trails[chaser.id] ?? [], chaser.position)
  }
  return { ...effects, trails }
}

/** How the loss of a life looks at this point of the `dying` phase; null in any other phase. */
export function dyingVisual(phase: Phase): DyingVisual | null {
  if (phase.kind !== 'dying') return null
  const elapsed = DYING_TICKS - phase.ticksLeft
  if (elapsed < DYING_FREEZE_TICKS) return { chasersVisible: true, dissolve: null }
  return { chasersVisible: false, dissolve: Math.min(1, (elapsed - DYING_FREEZE_TICKS) / (DYING_TICKS - DYING_FREEZE_TICKS)) }
}

/** The 25 blocks of Mac drifting away from his center and fading, without randomness. */
export function dissolvePixels(progress: number): DissolveBlock[] {
  const size = HERO_SIZE / BLOCKS_PER_SIDE
  const blocks: DissolveBlock[] = []
  for (let row = 0; row < BLOCKS_PER_SIDE; row++) {
    for (let col = 0; col < BLOCKS_PER_SIDE; col++) {
      const x = -HERO_SIZE / 2 + size * (col + 0.5)
      const y = -HERO_SIZE / 2 + size * (row + 0.5)
      const angle = x === 0 && y === 0 ? -Math.PI / 2 : Math.atan2(y, x)
      const spread = SCATTER * progress * (1 + ((row * BLOCKS_PER_SIDE + col) % 3) / 4)
      blocks.push({
        x: x + Math.cos(angle) * spread,
        y: y + Math.sin(angle) * spread,
        size: size * (1 - progress / 2),
        opacity: 1 - progress,
      })
    }
  }
  return blocks
}

/** Whether « Prêt ? » is shown. */
export function showsReady(phase: Phase): boolean {
  return phase.kind === 'ready'
}

function floating(text: string, color: string, tile: Tile, line: number, startTick: number, duration: number): FloatingText {
  return { text, color, tile, line, startTick, duration }
}
