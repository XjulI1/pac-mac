import { describe, expect, it } from 'vitest'
import type { GameEvent } from '../engine'
import { cuesFor, newStreak, type SoundCue } from './cues'

const tile = { col: 1, row: 1 }
const pellet: GameEvent = { type: 'pelletEaten', tile }
const sounds = (cues: SoundCue[]) => cues.map((cue) => (cue.kind === 'play' ? cue.sound : `ambience:${cue.action}`))

describe('cuesFor', () => {
  it('maps the events to their sounds, in order', () => {
    const events: GameEvent[] = [
      { type: 'bonusEaten', kind: 'ring', points: 250, tile },
      { type: 'extraLife', lives: 4 },
    ]
    expect(sounds(cuesFor(events, 10, newStreak()).cues)).toEqual(['bonusEaten', 'extraLife'])
  })

  it('plays nothing for the quiet events', () => {
    const events: GameEvent[] = [
      { type: 'levelStarted', level: 2 },
      { type: 'lifeLost', livesLeft: 2 },
      { type: 'modeChanged', mode: 'chase' },
      { type: 'chaserReleased', chaser: 'cutter' },
      { type: 'bonusExpired' },
    ]
    expect(cuesFor(events, 10, newStreak()).cues).toEqual([])
  })

  it('plays one pellet sound for three ticks caught up at once, the chain moving on by three', () => {
    const { cues, streak } = cuesFor([pellet, pellet, pellet], 100, newStreak())
    expect(cues).toEqual([{ kind: 'play', sound: 'pellet', step: 2 }])
    expect(streak).toEqual({ count: 3, lastTick: 100 })
  })

  it('plays the prism alone when a pellet comes with it', () => {
    expect(sounds(cuesFor([pellet, { type: 'prismEaten', tile }], 10, newStreak()).cues)).toEqual(['prism'])
  })

  it('starts the chain again after more than 24 ticks without a pellet', () => {
    let streak = newStreak()
    const steps: (number | undefined)[] = []
    for (const tickCount of [100, 110, 140]) {
      const result = cuesFor([pellet], tickCount, streak)
      streak = result.streak
      const cue = result.cues[0]
      steps.push(cue?.kind === 'play' ? cue.step : undefined)
    }
    expect(steps).toEqual([0, 1, 0])
  })

  it('raises the capture with the chain and completes it', () => {
    const events: GameEvent[] = [{ type: 'chaserCaught', chaser: 'prowler', points: 800, chainBonus: 1000, tile }]
    expect(cuesFor(events, 10, newStreak()).cues).toEqual([
      { kind: 'play', sound: 'capture', step: 4 },
      { kind: 'play', sound: 'chainComplete' },
    ])
  })

  it('drives the surcharge ambience', () => {
    const cue = (type: 'surchargeStarted' | 'surchargeEnding' | 'surchargeEnded') => {
      const event: GameEvent = type === 'surchargeStarted' ? { type, ticks: 420 } : { type }
      return sounds(cuesFor([event], 10, newStreak()).cues)
    }
    expect([cue('surchargeStarted'), cue('surchargeEnding'), cue('surchargeEnded')]).toEqual([
      ['ambience:start'],
      ['ambience:hurry'],
      ['ambience:stop'],
    ])
  })

  it('stops the ambience on death, the end of a level and the end of the game', () => {
    expect(sounds(cuesFor([{ type: 'heroCaught', by: 'hound' }], 10, newStreak()).cues)).toEqual(['ambience:stop', 'death'])
    expect(sounds(cuesFor([{ type: 'levelCleared', level: 1 }], 10, newStreak()).cues)).toEqual(['ambience:stop', 'levelClear'])
    expect(sounds(cuesFor([{ type: 'gameOver', score: 0, level: 1 }], 10, newStreak()).cues)).toEqual(['ambience:stop', 'gameOver'])
  })

  it('never plays the same sound twice in one call', () => {
    const events: GameEvent[] = [
      { type: 'chaserCaught', chaser: 'hound', points: 200, chainBonus: 0, tile },
      { type: 'chaserCaught', chaser: 'cutter', points: 400, chainBonus: 0, tile },
      { type: 'bonusAppeared', kind: 'ring' },
      { type: 'bonusAppeared', kind: 'ring' },
    ]
    expect(cuesFor(events, 10, newStreak()).cues).toEqual([
      { kind: 'play', sound: 'capture', step: 2 },
      { kind: 'play', sound: 'bonusAppear' },
    ])
  })
})
