import { STORAGE_PREFIX, readJson, writeJson } from './localStore'

/** Whether the player has muted the game. */
export type SoundPreference = { muted: boolean }

/** Key of the sound preference. */
export const SOUND_KEY = `${STORAGE_PREFIX}sound`

/** The stored preference; anything missing or unreadable means sound on. */
export function loadSoundPreference(): SoundPreference {
  const stored = readJson(SOUND_KEY)
  if (typeof stored === 'object' && stored !== null && 'muted' in stored && stored.muted === true) return { muted: true }
  return { muted: false }
}

/** Stores the preference; false when the browser keeps nothing. */
export function saveSoundPreference(preference: SoundPreference): boolean {
  return writeJson(SOUND_KEY, preference)
}
