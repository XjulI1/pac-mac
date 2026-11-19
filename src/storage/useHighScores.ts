import { computed, readonly, ref, shallowRef, type ComputedRef, type Ref } from 'vue'
import { insertHighScore, normalizeName, parseHighScores, type HighScore } from './highScores'
import { STORAGE_PREFIX, isStorageAvailable, readJson, writeJson } from './localStore'

/** Key of the high score table. */
export const HIGH_SCORES_KEY = `${STORAGE_PREFIX}high-scores`

/** Key of the last name typed. */
export const LAST_NAME_KEY = `${STORAGE_PREFIX}last-name`

/** The high score table shared by the home screen, the HUD and the end of a game. */
export type HighScores = {
  scores: Readonly<Ref<readonly HighScore[]>>
  best: ComputedRef<number>
  lastName: Readonly<Ref<string>>
  storageAvailable: Readonly<Ref<boolean>>
  record(entry: HighScore): number | null
  clear(): void
}

/** Reads the stored table once and keeps it in memory, writing every change back when the browser allows it. */
export function createHighScores(): HighScores {
  const scores = shallowRef<HighScore[]>(parseHighScores(readJson(HIGH_SCORES_KEY)))
  const storedName = readJson(LAST_NAME_KEY)
  const lastName = ref(typeof storedName === 'string' ? normalizeName(storedName) : '')
  const storageAvailable = ref(isStorageAvailable())

  return {
    scores,
    best: computed(() => scores.value[0]?.score ?? 0),
    lastName: readonly(lastName),
    storageAvailable: readonly(storageAvailable),
    record(entry) {
      const name = normalizeName(entry.name)
      if (!name) return null
      const result = insertHighScore(scores.value, { ...entry, name })
      scores.value = result.scores
      lastName.value = name
      writeJson(HIGH_SCORES_KEY, result.scores)
      writeJson(LAST_NAME_KEY, name)
      return result.rank
    },
    clear() {
      scores.value = []
      writeJson(HIGH_SCORES_KEY, [])
    },
  }
}

let shared: HighScores | null = null

/** The high score table of the application. */
export function useHighScores(): HighScores {
  shared ??= createHighScores()
  return shared
}
