import type { Sequence } from './catalog'
import { noteFrequency } from './notes'

/** A tone placed in time, ready to be played by an oscillator. */
export type ScheduledTone = {
  frequency: number
  slideTo?: number
  start: number
  duration: number
  wave: OscillatorType
  volume: number
  detune: number
}

/** Places every note of a sequence in time from `startTime` seconds, silences left out. */
export function scheduleSequence(sequence: Sequence, startTime: number): ScheduledTone[] {
  const beat = 60 / sequence.tempo
  return sequence.voices.flatMap((voice) => {
    let time = startTime
    return voice.flatMap((tone) => {
      const start = time
      const duration = tone.beats * beat
      time += duration
      if (tone.note === null) return []
      return [
        {
          frequency: noteFrequency(tone.note),
          ...(tone.slideTo ? { slideTo: noteFrequency(tone.slideTo) } : {}),
          start,
          duration,
          wave: tone.wave,
          volume: tone.volume,
          detune: tone.detune ?? 0,
        },
      ]
    })
  })
}

/** Length of a sequence in seconds: its longest voice. */
export function sequenceDuration(sequence: Sequence): number {
  const beat = 60 / sequence.tempo
  return Math.max(...sequence.voices.map((voice) => voice.reduce((sum, tone) => sum + tone.beats * beat, 0)))
}
