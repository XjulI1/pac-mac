import { getCurrentScope, onScopeDispose } from 'vue'
import type { Direction } from '../engine'
import { isTypingTarget, keyToCommand } from './keyboard'
import type { GameSession } from './useGameSession'

const NO_MODIFIER = { ctrlKey: false, metaKey: false, altKey: false }

/** Plays with the keyboard: directions, held keys, and P or Escape for the pause. */
export function useKeyboardControls(session: GameSession): void {
  const pressed: Direction[] = []

  const release = (direction: Direction) => {
    const index = pressed.indexOf(direction)
    if (index >= 0) pressed.splice(index, 1)
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || isTypingTarget(event.target)) return
    const command = keyToCommand(event.key, event)
    if (!command) return
    const status = session.status.value
    const inGame = status === 'playing' || status === 'paused' || status === 'resuming'
    if (!inGame) return
    if (command.kind === 'direction') {
      event.preventDefault()
      if (event.repeat) return
      release(command.direction)
      pressed.push(command.direction)
      session.requestDirection(command.direction)
      session.holdDirection(command.direction)
      return
    }
    if (command.kind === 'pause' || command.kind === 'escape') {
      event.preventDefault()
      if (!event.repeat) session.togglePause()
    }
  }

  const onKeyup = (event: KeyboardEvent) => {
    const command = keyToCommand(event.key, NO_MODIFIER)
    if (command?.kind !== 'direction') return
    release(command.direction)
    session.holdDirection(pressed.at(-1) ?? null)
  }

  const onBlur = () => {
    pressed.length = 0
    session.holdDirection(null)
  }

  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keyup', onKeyup)
  window.addEventListener('blur', onBlur)
  if (getCurrentScope()) {
    onScopeDispose(() => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('keyup', onKeyup)
      window.removeEventListener('blur', onBlur)
    })
  }
}
