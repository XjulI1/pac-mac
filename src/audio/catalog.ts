/** Every sound of the game. */
export type SoundId =
  | 'pellet'
  | 'prism'
  | 'capture'
  | 'chainComplete'
  | 'revive'
  | 'bonusAppear'
  | 'bonusEaten'
  | 'extraLife'
  | 'levelClear'
  | 'death'
  | 'gameOver'
  | 'gameStart'

/** A note, or a silence when `note` is null, lasting `beats` beats of its sequence. */
export type Tone = {
  note: string | null
  slideTo?: string
  beats: number
  wave: OscillatorType
  volume: number
  detune?: number
}

/** Voices played together at a tempo in beats per minute. */
export type Sequence = { tempo: number; voices: readonly (readonly Tone[])[] }

/** Notes of the pellet chain, read up and down. */
export const PELLET_SCALE: readonly string[] = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6']

/** Starting notes of a capture, one step per chaser caught in the same surcharge. */
export const CAPTURE_NOTES: readonly string[] = ['E5', 'A5', 'D6', 'G6']

/** Notes of the surcharge ambience, in a loop. */
export const AMBIENCE_NOTES: readonly string[] = ['A2', 'E3', 'A3', 'E3']

const FAST = 600

const tone = (note: string | null, beats: number, wave: OscillatorType, volume: number, extra: Partial<Tone> = {}): Tone => ({
  note,
  beats,
  wave,
  volume,
  ...extra,
})

const rest = (beats: number): Tone => tone(null, beats, 'sine', 0)

const run = (notes: readonly string[], beats: number, wave: OscillatorType, volume: number): Tone[] =>
  notes.map((note) => tone(note, beats, wave, volume))

/** Note of the pellet of a given rank in an unbroken chain. */
export function pelletNote(rank: number): string {
  const position = rank % (PELLET_SCALE.length * 2 - 2)
  const index = position < PELLET_SCALE.length ? position : PELLET_SCALE.length * 2 - 2 - position
  return PELLET_SCALE[index] ?? PELLET_SCALE[0]!
}

/** A pellet, at the note of its rank in the chain. */
export function pelletSequence(rank: number): Sequence {
  return { tempo: 1500, voices: [[tone(pelletNote(rank), 1, 'triangle', 0.12)]] }
}

/** A capture, one step higher for each chaser caught in the same surcharge (steps 1 to 4). */
export function captureSequence(step: number): Sequence {
  const start = CAPTURE_NOTES[Math.min(Math.max(step, 1), CAPTURE_NOTES.length) - 1] ?? CAPTURE_NOTES[0]!
  const octave = start.replace(/\d$/, (digit) => String(Number(digit) + 1))
  return { tempo: FAST, voices: [[tone(start, 2, 'square', 0.07, { slideTo: octave })]] }
}

const DEATH_BURSTS: readonly [string, string][] = [
  ['A5', 'E5'],
  ['G5', 'D5'],
  ['E5', 'B4'],
  ['D5', 'A4'],
  ['B4', 'F#4'],
  ['A4', 'E4'],
]

/** The sequence of every sound, pellets and captures at their first step. */
export const CATALOG: Readonly<Record<SoundId, Sequence>> = {
  pellet: pelletSequence(0),
  prism: {
    tempo: FAST,
    voices: [
      [tone('F#3', 2, 'sawtooth', 0.07, { slideTo: 'F#5' })],
      [rest(2), tone('C5', 1.5, 'triangle', 0.08)],
      [rest(2), tone('E5', 1.5, 'triangle', 0.08)],
      [rest(2), tone('G5', 1.5, 'triangle', 0.08)],
    ],
  },
  capture: captureSequence(1),
  chainComplete: { tempo: FAST, voices: [[rest(2), ...run(['C6', 'E6', 'G6', 'C7'], 1, 'square', 0.06)]] },
  revive: { tempo: 400, voices: [[tone('C4', 1, 'triangle', 0.05, { slideTo: 'G4' })]] },
  bonusAppear: { tempo: FAST, voices: [run(['E6', 'B6'], 1, 'triangle', 0.08)] },
  bonusEaten: { tempo: FAST, voices: [run(['C6', 'G6', 'C7'], 1, 'square', 0.06)] },
  extraLife: { tempo: FAST, voices: [[...run(['G5', 'C6', 'E6'], 1, 'triangle', 0.1), tone('G6', 3, 'triangle', 0.1)]] },
  levelClear: {
    tempo: FAST,
    voices: [
      run(['C5', 'E5', 'G5', 'C6', 'D6', 'E6', 'G6', 'C7'], 1, 'square', 0.05),
      [rest(8), tone('C6', 10, 'triangle', 0.07)],
      [rest(8), tone('E6', 10, 'triangle', 0.07)],
      [rest(8), tone('G6', 10, 'triangle', 0.07)],
    ],
  },
  death: {
    tempo: FAST,
    voices: [
      [
        ...DEATH_BURSTS.map(([from, to], index) =>
          tone(from, 2, 'square', 0.06, { slideTo: to, detune: index % 2 === 0 ? 12 : -12 }),
        ),
        tone('C2', 5, 'triangle', 0.3, { slideTo: 'C1' }),
      ],
    ],
  },
  gameOver: { tempo: 150, voices: [run(['A4', 'F4', 'D4', 'A3'], 1, 'sawtooth', 0.05)] },
  gameStart: {
    tempo: 150,
    voices: [
      [
        ...run(['A4', 'C5', 'E5', 'A5'], 0.5, 'square', 0.06),
        tone('G5', 1, 'square', 0.06),
        ...run(['E5', 'G5'], 0.5, 'square', 0.06),
        tone('C6', 1, 'square', 0.06),
        ...run(['B5', 'G5'], 0.5, 'square', 0.06),
        tone('A5', 2, 'square', 0.06),
      ],
      [
        tone('A2', 2, 'triangle', 0.14),
        tone('F2', 2, 'triangle', 0.14),
        tone('C3', 2, 'triangle', 0.14),
        tone('E2', 1, 'triangle', 0.14),
        tone('A2', 1, 'triangle', 0.14),
      ],
    ],
  },
}
