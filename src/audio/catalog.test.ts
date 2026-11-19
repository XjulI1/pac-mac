import { describe, expect, it } from 'vitest'
import { CATALOG, captureSequence, pelletNote, PELLET_SCALE, type SoundId } from './catalog'
import { noteFrequency } from './notes'
import { scheduleSequence, sequenceDuration } from './schedule'

const SOUNDS: SoundId[] = [
  'pellet',
  'prism',
  'capture',
  'chainComplete',
  'revive',
  'bonusAppear',
  'bonusEaten',
  'extraLife',
  'levelClear',
  'death',
  'gameOver',
  'gameStart',
]

describe('catalog', () => {
  it('holds the twelve sounds of the game', () => {
    expect(Object.keys(CATALOG).sort()).toEqual([...SOUNDS].sort())
  })

  it('only uses valid notes or silences, with positive lengths', () => {
    for (const id of SOUNDS) {
      for (const voice of CATALOG[id].voices) {
        for (const tone of voice) {
          expect(tone.beats, id).toBeGreaterThan(0)
          if (tone.note) expect(() => noteFrequency(tone.note!), id).not.toThrow()
          if (tone.slideTo) expect(() => noteFrequency(tone.slideTo!), id).not.toThrow()
        }
      }
    }
  })

  it('fits the frozen phases they go with', () => {
    expect(sequenceDuration(CATALOG.death)).toBeLessThanOrEqual(1.9)
    expect(sequenceDuration(CATALOG.levelClear)).toBeLessThanOrEqual(1.9)
    expect(sequenceDuration(CATALOG.gameStart)).toBeLessThanOrEqual(3.8)
  })

  it('raises the capture by one step per chaser caught', () => {
    const starts = [1, 2, 3, 4].map((step) => captureSequence(step).voices[0]![0]!.note)
    expect(starts).toEqual(['E5', 'A5', 'D6', 'G6'])
    expect(captureSequence(4).voices[0]![0]!.slideTo).toBe('G7')
  })

  it('walks the pellet scale up and down', () => {
    expect(PELLET_SCALE).toEqual(['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'])
    expect([0, 9, 10, 18].map(pelletNote)).toEqual(['C5', 'A6', 'G6', 'C5'])
  })
})

describe('scheduleSequence', () => {
  it('places the notes of one voice one after the other, silences left out', () => {
    const tones = scheduleSequence(
      { tempo: 120, voices: [[{ note: 'A4', beats: 1, wave: 'square', volume: 0.1 }, { note: null, beats: 1, wave: 'sine', volume: 0 }, { note: 'A5', beats: 2, wave: 'square', volume: 0.1 }]] },
      1,
    )
    expect(tones.map((tone) => [tone.start, tone.duration])).toEqual([
      [1, 0.5],
      [2, 1],
    ])
  })

  it('plays the voices together', () => {
    const tones = scheduleSequence(CATALOG.levelClear, 0)
    expect(tones.filter((tone) => tone.start === 0.8)).toHaveLength(3)
  })

  it('schedules the start jingle at 150 BPM', () => {
    const tones = scheduleSequence(CATALOG.gameStart, 10)
    const lead = tones.filter((tone) => tone.wave === 'square')
    const bass = tones.filter((tone) => tone.wave === 'triangle')
    expect(lead[0]!.start).toBeCloseTo(10)
    expect(lead[1]!.start).toBeCloseTo(10.2)
    expect(lead.at(-1)!.start).toBeCloseTo(12.4)
    expect(bass.at(-1)!.start).toBeCloseTo(12.8)
    expect(sequenceDuration(CATALOG.gameStart)).toBeCloseTo(3.2)
  })
})
