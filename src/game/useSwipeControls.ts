import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { createSwipeTracker } from './swipe'
import type { GameSession } from './useGameSession'

const SWIPE_THRESHOLD = 24
const NOT_FOR_SWIPES = 'button, a, input, select, textarea, label, [data-no-swipe]'

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(NOT_FOR_SWIPES) !== null
}

/** Plays with the finger, a pen or the mouse: swipes anywhere on the area, the last direction held while it stays down. */
export function useSwipeControls(area: Ref<HTMLElement | null>, session: GameSession): void {
  const tracker = createSwipeTracker({ threshold: SWIPE_THRESHOLD })
  let pointer: number | null = null
  let element: HTMLElement | null = null

  const onPointerDown = (event: PointerEvent) => {
    if (isInteractive(event.target)) return
    pointer = event.pointerId
    tracker.start(event.clientX, event.clientY)
    element?.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return
    const direction = tracker.move(event.clientX, event.clientY)
    if (!direction) return
    session.requestDirection(direction)
    session.holdDirection(direction)
  }

  const onPointerEnd = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return
    pointer = null
    tracker.end()
    session.holdDirection(null)
  }

  const preventGesture = (event: Event) => event.preventDefault()

  onMounted(() => {
    element = area.value
    element?.addEventListener('pointerdown', onPointerDown)
    element?.addEventListener('pointermove', onPointerMove)
    element?.addEventListener('pointerup', onPointerEnd)
    element?.addEventListener('pointercancel', onPointerEnd)
    document.addEventListener('gesturestart', preventGesture)
  })

  onBeforeUnmount(() => {
    element?.removeEventListener('pointerdown', onPointerDown)
    element?.removeEventListener('pointermove', onPointerMove)
    element?.removeEventListener('pointerup', onPointerEnd)
    element?.removeEventListener('pointercancel', onPointerEnd)
    document.removeEventListener('gesturestart', preventGesture)
  })
}
