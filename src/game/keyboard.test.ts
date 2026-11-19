import { describe, expect, it } from 'vitest'
import { keyToCommand } from './keyboard'

const none = { ctrlKey: false, metaKey: false, altKey: false }

describe('keyToCommand', () => {
  it('reads the arrows', () => {
    expect(['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].map((key) => keyToCommand(key, none))).toEqual([
      { kind: 'direction', direction: 'up' },
      { kind: 'direction', direction: 'left' },
      { kind: 'direction', direction: 'down' },
      { kind: 'direction', direction: 'right' },
    ])
  })

  it('reads the letters printed on AZERTY and QWERTY keyboards, whatever their case', () => {
    expect(['z', 'Q', 's', 'd', 'w', 'a'].map((key) => keyToCommand(key, none))).toEqual([
      { kind: 'direction', direction: 'up' },
      { kind: 'direction', direction: 'left' },
      { kind: 'direction', direction: 'down' },
      { kind: 'direction', direction: 'right' },
      { kind: 'direction', direction: 'up' },
      { kind: 'direction', direction: 'left' },
    ])
  })

  it('reads P and Escape for the pause', () => {
    expect(keyToCommand('p', none)).toEqual({ kind: 'pause' })
    expect(keyToCommand('P', none)).toEqual({ kind: 'pause' })
    expect(keyToCommand('Escape', none)).toEqual({ kind: 'escape' })
  })

  it('reads Enter and Space to confirm', () => {
    expect(keyToCommand('Enter', none)).toEqual({ kind: 'confirm' })
    expect(keyToCommand(' ', none)).toEqual({ kind: 'confirm' })
  })

  it('ignores unknown keys', () => {
    expect(keyToCommand('x', none)).toBeNull()
    expect(keyToCommand('Tab', none)).toBeNull()
  })

  it('ignores keys pressed with Ctrl, Cmd or Alt', () => {
    expect(keyToCommand('d', { ...none, ctrlKey: true })).toBeNull()
    expect(keyToCommand('ArrowUp', { ...none, metaKey: true })).toBeNull()
    expect(keyToCommand('p', { ...none, altKey: true })).toBeNull()
  })
})
