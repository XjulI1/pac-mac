import { onBeforeUnmount, onMounted } from 'vue'
import { isTypingTarget, keyToCommand } from '../game/keyboard'

/** Actions of a screen bound to Enter or Space, and to Escape. */
export type ScreenKeys = { confirm?: () => void; escape?: () => void }

/** Binds Enter, Space and Escape to the actions of a screen while it is shown. */
export function useScreenKeys(keys: ScreenKeys): void {
  const onKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat || isTypingTarget(event.target)) return
    const command = keyToCommand(event.key, event)
    const action = command?.kind === 'confirm' ? keys.confirm : command?.kind === 'escape' ? keys.escape : undefined
    if (!action) return
    event.preventDefault()
    action()
  }
  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
