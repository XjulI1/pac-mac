<script setup lang="ts">
import { computed, ref } from 'vue'
import { injectSession } from '../../game/sessionKey'
import { useSwipeControls } from '../../game/useSwipeControls'
import MazeCanvas from '../../render/MazeCanvas.vue'
import type { Viewport } from '../../render/viewport'
import GameHud from '../hud/GameHud.vue'
import PauseOverlay from '../PauseOverlay.vue'
import ResumeCountdown from '../ResumeCountdown.vue'
import GameOverScreen from './GameOverScreen.vue'

const session = injectSession()
const { status, hud, countdown } = session
const area = ref<HTMLElement | null>(null)
const viewport = ref<Viewport | null>(null)
const hudStyle = computed(() =>
  viewport.value
    ? { width: `${viewport.value.cssWidth}px`, transform: `translateY(${viewport.value.offsetY}px)` }
    : {},
)

useSwipeControls(area, session)

function onResize(next: Viewport) {
  viewport.value = next
}
</script>

<template>
  <section
    class="flex h-full flex-col items-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    data-test="game-screen"
  >
    <div
      class="relative z-[5] w-full max-w-full"
      :style="hudStyle"
    >
      <GameHud
        v-if="hud"
        :hud="hud"
        @pause="session.pause()"
      >
        <template #actions>
          <slot name="hud-actions" />
        </template>
        <template #record>
          <slot
            name="hud-record"
            :score="hud.score"
          />
        </template>
      </GameHud>
    </div>
    <div
      ref="area"
      class="relative min-h-0 w-full flex-1 touch-none"
      data-test="play-area"
    >
      <MazeCanvas
        @ready="session.attachRenderer"
        @resize="onResize"
      />
      <PauseOverlay
        v-if="status === 'paused'"
        @resume="session.resume()"
        @quit="session.quit()"
      />
      <ResumeCountdown
        v-if="status === 'resuming'"
        :value="countdown"
      />
      <GameOverScreen
        v-if="status === 'over' && hud"
        :score="hud.score"
        :level="hud.level"
        @replay="session.start()"
        @home="session.quit()"
      >
        <template #results="results">
          <slot
            name="results"
            v-bind="results"
          />
        </template>
      </GameOverScreen>
    </div>
  </section>
</template>
