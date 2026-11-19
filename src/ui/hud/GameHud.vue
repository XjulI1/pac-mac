<script setup lang="ts">
import { formatScore } from '../../format'
import type { HudData } from '../../game/hud'
import BonusShelf from './BonusShelf.vue'
import LivesIndicator from './LivesIndicator.vue'

defineProps<{ hud: HudData }>()
const emit = defineEmits<{ pause: [] }>()
</script>

<template>
  <header
    class="flex w-full flex-col gap-1 px-1 py-1.5"
    data-test="hud"
  >
    <div class="flex items-center gap-3">
      <span
        class="text-xl font-black text-mac"
        data-test="score"
      >{{ formatScore(hud.score) }}</span>
      <span
        class="text-xs font-semibold uppercase tracking-wider text-pellet/80"
        data-test="level"
      >Niveau {{ hud.level }}</span>
      <div class="ml-auto flex items-center gap-2">
        <slot name="actions" />
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-mac/60 text-mac"
          aria-label="Pause"
          data-test="pause"
          @click="emit('pause')"
        >
          <svg
            viewBox="0 0 16 16"
            class="h-4 w-4 fill-current"
            aria-hidden="true"
          >
            <rect
              x="3"
              y="2"
              width="3.5"
              height="12"
              rx="1"
            />
            <rect
              x="9.5"
              y="2"
              width="3.5"
              height="12"
              rx="1"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="flex min-h-4 items-center gap-2">
      <LivesIndicator :count="hud.reserveLives" />
      <div class="flex-1 text-center text-xs text-pellet/80">
        <slot name="record" />
      </div>
      <BonusShelf :kinds="hud.bonuses" />
    </div>
  </header>
</template>
