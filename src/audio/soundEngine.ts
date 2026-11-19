import { AMBIENCE_NOTES, CATALOG, captureSequence, pelletSequence, type Sequence, type SoundId } from './catalog'
import type { SoundCue } from './cues'
import { noteFrequency } from './notes'
import { scheduleSequence, type ScheduledTone } from './schedule'

/** Creates the audio context, or null when the browser has no Web Audio. */
export type AudioContextFactory = () => AudioContext | null

const SCHEDULER_INTERVAL_MS = 25
const SCHEDULE_AHEAD_S = 0.12
const START_DELAY_S = 0.01
const ATTACK_S = 0.005
const SILENT = 0.0001
const AMBIENCE_RATE = 8
const AMBIENCE_HURRY_RATE = 12
const AMBIENCE_VOLUME = 0.05
const AMBIENCE_CUTOFF_HZ = 900

const browserContext: AudioContextFactory = () => (typeof AudioContext === 'undefined' ? null : new AudioContext())

/** Synthesizes the sounds of the game with the Web Audio API, without any audio file. */
export class SoundEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private ambienceBus: AudioNode | null = null
  private ambienceTimer: ReturnType<typeof setInterval> | null = null
  private ambienceRate = AMBIENCE_RATE
  private ambienceIndex = 0
  private ambienceNextTime = 0
  private muted = false

  constructor(private readonly createContext: AudioContextFactory = browserContext) {}

  /** Creates the audio context on the first call, then resumes it if suspended; call it from a user gesture. */
  unlock(): void {
    if (!this.context) {
      this.context = this.createContext()
      if (!this.context) return
      this.master = this.context.createGain()
      this.master.connect(this.context.destination)
      const filter = this.context.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = AMBIENCE_CUTOFF_HZ
      filter.connect(this.master)
      this.ambienceBus = filter
      this.applyMute()
    }
    if (this.context.state === 'suspended') void this.context.resume()
  }

  /** Mutes or unmutes every sound; the ambience keeps its place while muted. */
  setMuted(muted: boolean): void {
    this.muted = muted
    this.applyMute()
  }

  /** Plays a sound or drives the surcharge ambience; does nothing before the first unlock. */
  play(cue: SoundCue): void {
    if (!this.context) return
    if (cue.kind === 'ambience') {
      if (cue.action === 'start') this.startAmbience()
      if (cue.action === 'hurry') this.ambienceRate = AMBIENCE_HURRY_RATE
      if (cue.action === 'stop') this.stopAmbience()
      return
    }
    if (this.muted || !this.master) return
    const tones = scheduleSequence(sequenceOf(cue.sound, cue.step), this.context.currentTime + START_DELAY_S)
    for (const tone of tones) this.playTone(tone, this.master)
  }

  /** Suspends every sound, during a pause. */
  suspend(): void {
    if (this.context?.state === 'running') void this.context.suspend()
  }

  /** Resumes the sounds after a pause. */
  resume(): void {
    if (this.context?.state === 'suspended') void this.context.resume()
  }

  /** Stops the ambience, when leaving the game. */
  stopAll(): void {
    this.stopAmbience()
  }

  private applyMute(): void {
    if (this.master) this.master.gain.value = this.muted ? 0 : 1
  }

  private startAmbience(): void {
    if (!this.context) return
    this.ambienceRate = AMBIENCE_RATE
    this.ambienceIndex = 0
    this.ambienceNextTime = this.context.currentTime + START_DELAY_S
    if (this.ambienceTimer === null) this.ambienceTimer = setInterval(() => this.scheduleAmbience(), SCHEDULER_INTERVAL_MS)
    this.scheduleAmbience()
  }

  private stopAmbience(): void {
    if (this.ambienceTimer !== null) clearInterval(this.ambienceTimer)
    this.ambienceTimer = null
  }

  private scheduleAmbience(): void {
    if (!this.context || !this.ambienceBus) return
    while (this.ambienceNextTime < this.context.currentTime + SCHEDULE_AHEAD_S) {
      const note = AMBIENCE_NOTES[this.ambienceIndex % AMBIENCE_NOTES.length] ?? AMBIENCE_NOTES[0]!
      const step = 1 / this.ambienceRate
      this.playTone(
        { frequency: noteFrequency(note), start: this.ambienceNextTime, duration: step * 0.9, wave: 'square', volume: AMBIENCE_VOLUME, detune: 0 },
        this.ambienceBus,
      )
      this.ambienceIndex += 1
      this.ambienceNextTime += step
    }
  }

  private playTone(tone: ScheduledTone, destination: AudioNode): void {
    if (!this.context) return
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    oscillator.type = tone.wave
    oscillator.frequency.setValueAtTime(tone.frequency, tone.start)
    if (tone.slideTo) oscillator.frequency.exponentialRampToValueAtTime(tone.slideTo, tone.start + tone.duration)
    oscillator.detune.value = tone.detune
    gain.gain.setValueAtTime(SILENT, tone.start)
    gain.gain.linearRampToValueAtTime(tone.volume, tone.start + ATTACK_S)
    gain.gain.exponentialRampToValueAtTime(SILENT, tone.start + tone.duration)
    oscillator.connect(gain)
    gain.connect(destination)
    oscillator.start(tone.start)
    oscillator.stop(tone.start + tone.duration + ATTACK_S)
  }
}

function sequenceOf(sound: SoundId, step: number | undefined): Sequence {
  if (sound === 'pellet') return pelletSequence(step ?? 0)
  if (sound === 'capture') return captureSequence(step ?? 1)
  return CATALOG[sound]
}
