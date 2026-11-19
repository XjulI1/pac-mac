import { inject, type InjectionKey } from 'vue'
import type { GameSession } from './useGameSession'

/** Key under which the application provides its game session. */
export const SESSION_KEY: InjectionKey<GameSession> = Symbol('game-session')

/** The game session provided by the application. */
export function injectSession(): GameSession {
  const session = inject(SESSION_KEY)
  if (!session) throw new Error('No game session provided')
  return session
}
