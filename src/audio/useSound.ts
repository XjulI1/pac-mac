import { getCurrentScope, onScopeDispose, readonly, ref, watch, type Ref } from 'vue'
import { isTypingTarget } from '../game/keyboard'
import type { GameSession } from '../game/useGameSession'
import { loadSoundPreference, saveSoundPreference } from '../storage/soundPreference'
import { cuesFor, newStreak } from './cues'
import type { SoundCue } from './cues'

/** What the game needs from a sound engine. */
export type SoundPlayer = {
  unlock(): void
  setMuted(muted: boolean): void
  play(cue: SoundCue): void
  suspend(): void
  resume(): void
  stopAll(): void
}

/** Sound state shown to the player. */
export type SoundControls = { muted: Readonly<Ref<boolean>>; toggle(): void }

const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const

/** Plugs the sounds into the game session: first gesture, M key, events, pause and preference. */
export function useSound(session: GameSession, engine: SoundPlayer): SoundControls {
  const muted = ref(loadSoundPreference().muted)
  let streak = newStreak()
  engine.setMuted(muted.value)

  const toggle = () => {
    muted.value = !muted.value
    engine.setMuted(muted.value)
    saveSoundPreference({ muted: muted.value })
  }

  const unlock = () => {
    engine.unlock()
    for (const gesture of GESTURES) window.removeEventListener(gesture, unlock, true)
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat || isTypingTarget(event.target)) return
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.toLowerCase() !== 'm') return
    toggle()
  }

  for (const gesture of GESTURES) window.addEventListener(gesture, unlock, true)
  window.addEventListener('keydown', onKeydown)

  const unsubscribe = session.onEvents((events, state) => {
    const result = cuesFor(events, state.tickCount, streak)
    streak = result.streak
    for (const cue of result.cues) engine.play(cue)
  })

  watch(session.status, (status, previous) => {
    if (status === 'playing' && (previous === 'home' || previous === 'over')) {
      streak = newStreak()
      engine.resume()
      engine.play({ kind: 'play', sound: 'gameStart' })
    }
    if (status === 'paused') engine.suspend()
    if (status === 'playing' && previous === 'resuming') engine.resume()
    if (status === 'home' || status === 'over') {
      engine.stopAll()
      engine.resume()
    }
  })

  if (getCurrentScope()) {
    onScopeDispose(() => {
      unsubscribe()
      for (const gesture of GESTURES) window.removeEventListener(gesture, unlock, true)
      window.removeEventListener('keydown', onKeydown)
      engine.stopAll()
    })
  }

  return { muted: readonly(muted), toggle }
}
