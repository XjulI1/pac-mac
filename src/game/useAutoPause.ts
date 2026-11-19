import { getCurrentScope, onScopeDispose } from 'vue'
import type { GameSession } from './useGameSession'

/** Pauses the game by itself when the page is hidden or the window loses the focus. */
export function useAutoPause(session: GameSession): void {
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') session.pause()
  }
  const onBlur = () => session.pause()

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('blur', onBlur)
  if (getCurrentScope()) {
    onScopeDispose(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
    })
  }
}
