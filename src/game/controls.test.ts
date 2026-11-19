import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, effectScope, h, ref, type EffectScope } from 'vue'
import type { SessionStatus } from './useGameSession'
import type { GameSession } from './useGameSession'
import { useAutoPause } from './useAutoPause'
import { useKeyboardControls } from './useKeyboardControls'
import { useSwipeControls } from './useSwipeControls'

function fakeSession(initial: SessionStatus = 'playing') {
  const status = ref<SessionStatus>(initial)
  const held: (string | null)[] = []
  const session = {
    status,
    requestDirection: vi.fn(),
    holdDirection: vi.fn((direction: string | null) => held.push(direction)),
    togglePause: vi.fn(),
    pause: vi.fn(),
  }
  return { session: session as unknown as GameSession, spies: session, held }
}

const scopes: EffectScope[] = []

function within(setup: () => void) {
  const scope = effectScope()
  scope.run(setup)
  scopes.push(scope)
}

afterEach(() => {
  while (scopes.length) scopes.pop()!.stop()
})

function press(key: string, init: KeyboardEventInit = {}, target: EventTarget = window) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

function release(key: string) {
  window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
}

describe('keyboard controls', () => {
  it('sends a direction and keeps it held until released', () => {
    const { session, spies, held } = fakeSession()
    within(() => useKeyboardControls(session))
    press('ArrowUp')
    expect(spies.requestDirection).toHaveBeenCalledWith('up')
    release('ArrowUp')
    expect(held).toEqual(['up', null])
  })

  it('lets the last key pressed win, then gives the hand back to the one still down', () => {
    const { session, held } = fakeSession()
    within(() => useKeyboardControls(session))
    press('ArrowLeft')
    press('ArrowUp')
    release('ArrowUp')
    expect(held).toEqual(['left', 'up', 'left'])
  })

  it('stops the page from scrolling with the arrows', () => {
    const { session } = fakeSession()
    within(() => useKeyboardControls(session))
    expect(press('ArrowDown').defaultPrevented).toBe(true)
  })

  it('ignores keys typed in a text field and keys pressed with Ctrl', () => {
    const { session, spies } = fakeSession()
    within(() => useKeyboardControls(session))
    const input = document.createElement('input')
    document.body.append(input)
    for (const key of ['z', 'q', 's', 'd']) press(key, {}, input)
    press('d', { ctrlKey: true })
    expect(spies.requestDirection).not.toHaveBeenCalled()
    input.remove()
  })

  it('toggles the pause with P or Escape, but not on their repetition', () => {
    const { session, spies } = fakeSession()
    within(() => useKeyboardControls(session))
    press('p')
    press('Escape')
    press('Escape', { repeat: true })
    expect(spies.togglePause).toHaveBeenCalledTimes(2)
  })

  it('does nothing at home nor on the game over screen', () => {
    for (const status of ['home', 'over'] as const) {
      const { session, spies } = fakeSession(status)
      within(() => useKeyboardControls(session))
      press('p')
      press('ArrowUp')
      expect(spies.togglePause).not.toHaveBeenCalled()
      expect(spies.requestDirection).not.toHaveBeenCalled()
    }
  })
})

const SwipeArea = defineComponent({
  props: { session: { type: Object as () => GameSession, required: true }, withOverlay: Boolean },
  setup(props) {
    const area = ref<HTMLElement | null>(null)
    useSwipeControls(area, props.session)
    return () =>
      h(
        'div',
        { ref: area },
        props.withOverlay
          ? [
              h('div', { 'data-no-swipe': '', 'data-test': 'overlay' }, [h('span', { 'data-test': 'title' })]),
              h('button', { type: 'button', 'data-test': 'button' }),
            ]
          : [],
      )
  },
})

describe('swipe controls', () => {
  function mountArea() {
    const { session, spies, held } = fakeSession()
    const wrapper = mount(SwipeArea, { props: { session }, attachTo: document.body })
    const pointer = (type: string, x: number, y: number) =>
      wrapper.element.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, bubbles: true }))
    return { wrapper, spies, held, pointer }
  }

  it('turns a swipe up into a direction for the session, held while the finger stays down', () => {
    const { wrapper, spies, held, pointer } = mountArea()
    pointer('pointerdown', 100, 300)
    pointer('pointermove', 100, 260)
    expect(spies.requestDirection).toHaveBeenCalledWith('up')
    expect(held).toEqual(['up'])
    pointer('pointerup', 100, 260)
    expect(held).toEqual(['up', null])
    wrapper.unmount()
  })

  it('releases the held direction when the pointer is cancelled', () => {
    const { wrapper, held, pointer } = mountArea()
    pointer('pointerdown', 100, 100)
    pointer('pointermove', 140, 100)
    pointer('pointercancel', 140, 100)
    expect(held).toEqual(['right', null])
    wrapper.unmount()
  })

  it('holds nothing for a mere touch', () => {
    const { wrapper, spies, held, pointer } = mountArea()
    pointer('pointerdown', 100, 100)
    pointer('pointermove', 102, 101)
    expect(spies.requestDirection).not.toHaveBeenCalled()
    expect(held).toEqual([])
    wrapper.unmount()
  })
})

describe('automatic pause', () => {
  it('pauses when the page is hidden or the window loses the focus', () => {
    const { session, spies } = fakeSession()
    within(() => useAutoPause(session))
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    window.dispatchEvent(new Event('blur'))
    expect(spies.pause).toHaveBeenCalledTimes(2)
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  })
})

describe('swipes and the buttons over the maze', () => {
  function mountWithOverlay() {
    const { session, spies } = fakeSession()
    const wrapper = mount(SwipeArea, { props: { session, withOverlay: true }, attachTo: document.body })
    const capture = vi.fn()
    ;(wrapper.element as HTMLElement).setPointerCapture = capture
    const pointer = (target: Element, type: string, x: number, y: number) =>
      target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerId: 7, bubbles: true }))
    return { wrapper, spies, capture, pointer }
  }

  it('leaves a press on a button alone, so that its click reaches it', () => {
    const { wrapper, spies, capture, pointer } = mountWithOverlay()
    const button = wrapper.get('[data-test="button"]').element
    pointer(button, 'pointerdown', 100, 100)
    pointer(button, 'pointermove', 140, 100)
    expect(capture).not.toHaveBeenCalled()
    expect(spies.requestDirection).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('ignores presses anywhere on an overlay', () => {
    const { wrapper, spies, capture, pointer } = mountWithOverlay()
    const title = wrapper.get('[data-test="title"]').element
    pointer(title, 'pointerdown', 100, 100)
    pointer(title, 'pointermove', 100, 50)
    expect(capture).not.toHaveBeenCalled()
    expect(spies.requestDirection).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('still captures a swipe that starts on the maze', () => {
    const { wrapper, spies, capture, pointer } = mountWithOverlay()
    pointer(wrapper.element, 'pointerdown', 100, 100)
    pointer(wrapper.element, 'pointermove', 100, 60)
    expect(capture).toHaveBeenCalledWith(7)
    expect(spies.requestDirection).toHaveBeenCalledWith('up')
    wrapper.unmount()
  })
})
