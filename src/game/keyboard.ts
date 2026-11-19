import type { Direction } from '../engine'

/** What a key asks for. */
export type KeyCommand =
  | { kind: 'direction'; direction: Direction }
  | { kind: 'pause' }
  | { kind: 'escape' }
  | { kind: 'confirm' }

/** Modifier keys held with a key. */
export type KeyModifiers = { ctrlKey: boolean; metaKey: boolean; altKey: boolean }

const DIRECTIONS: Readonly<Record<string, Direction>> = {
  arrowup: 'up',
  arrowright: 'right',
  arrowdown: 'down',
  arrowleft: 'left',
  z: 'up',
  w: 'up',
  q: 'left',
  a: 'left',
  s: 'down',
  d: 'right',
}

/** Command of a key, read from the character printed on it; null for any other key or with a modifier. */
export function keyToCommand(key: string, modifiers: KeyModifiers): KeyCommand | null {
  if (modifiers.ctrlKey || modifiers.metaKey || modifiers.altKey) return null
  const name = key.toLowerCase()
  const direction = DIRECTIONS[name]
  if (direction) return { kind: 'direction', direction }
  if (name === 'p') return { kind: 'pause' }
  if (name === 'escape') return { kind: 'escape' }
  if (name === 'enter' || name === ' ') return { kind: 'confirm' }
  return null
}

/** Whether a keyboard event targets a text field, where keys belong to typing. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}
