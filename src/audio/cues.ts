import type { GameEvent } from '../engine'
import type { SoundId } from './catalog'

/** A sound to play, at a step for pellets (rank in the chain) and captures (rank in the surcharge). */
export type SoundCue = { kind: 'play'; sound: SoundId; step?: number } | { kind: 'ambience'; action: 'start' | 'hurry' | 'stop' }

/** Pellets eaten in a row and the tick of the last one. */
export type PelletStreak = { count: number; lastTick: number }

const CHAIN_BREAK_TICKS = 24
const POINTS_PER_CAPTURE_STEP = 200

const SIMPLE_SOUNDS: Partial<Record<GameEvent['type'], SoundId>> = {
  chaserRevived: 'revive',
  bonusAppeared: 'bonusAppear',
  bonusEaten: 'bonusEaten',
  extraLife: 'extraLife',
  levelCleared: 'levelClear',
  heroCaught: 'death',
  gameOver: 'gameOver',
}

const AMBIENCE_STOPS: readonly GameEvent['type'][] = ['surchargeEnded', 'heroCaught', 'levelCleared', 'gameOver']

/** A chain that has not started. */
export function newStreak(): PelletStreak {
  return { count: 0, lastTick: Number.NEGATIVE_INFINITY }
}

/** Sounds for the events of one frame (one or several ticks), each sound at most once. */
export function cuesFor(
  events: readonly GameEvent[],
  tickCount: number,
  streak: PelletStreak,
): { cues: SoundCue[]; streak: PelletStreak } {
  const cues: SoundCue[] = []
  let pellets = 0
  let prism = false
  const pelletStart = tickCount - streak.lastTick > CHAIN_BREAK_TICKS ? 0 : streak.count

  const play = (sound: SoundId, step?: number) => {
    const existing = cues.find((cue) => cue.kind === 'play' && cue.sound === sound)
    if (existing && existing.kind === 'play') {
      if (step !== undefined) existing.step = step
      return
    }
    cues.push(step === undefined ? { kind: 'play', sound } : { kind: 'play', sound, step })
  }

  const ambience = (action: 'start' | 'hurry' | 'stop') => {
    const last = cues.findLast((cue) => cue.kind === 'ambience')
    if (last?.kind === 'ambience' && last.action === action) return
    cues.push({ kind: 'ambience', action })
  }

  for (const event of events) {
    if (event.type === 'pelletEaten') pellets += 1
    if (event.type === 'prismEaten') {
      prism = true
      play('prism')
    }
    if (event.type === 'surchargeStarted') ambience('start')
    if (event.type === 'surchargeEnding') ambience('hurry')
    if (AMBIENCE_STOPS.includes(event.type)) ambience('stop')
    if (event.type === 'chaserCaught') {
      play('capture', Math.round(event.points / POINTS_PER_CAPTURE_STEP))
      if (event.chainBonus > 0) play('chainComplete')
    }
    const simple = SIMPLE_SOUNDS[event.type]
    if (simple) play(simple)
  }

  if (pellets === 0) return { cues, streak }
  if (!prism) play('pellet', pelletStart + pellets - 1)
  return { cues, streak: { count: pelletStart + pellets, lastTick: tickCount } }
}
