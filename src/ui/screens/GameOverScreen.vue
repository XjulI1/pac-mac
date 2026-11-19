<script setup lang="ts">
import { formatScore } from '../../format'
import { useScreenKeys } from '../useScreenKeys'

defineProps<{ score: number; level: number }>()
const emit = defineEmits<{ replay: []; home: [] }>()

useScreenKeys({ confirm: () => emit('replay'), escape: () => emit('home') })
</script>

<template>
  <div
    class="absolute inset-0 z-10 flex touch-manipulation flex-col items-center justify-center gap-3 overflow-y-auto bg-night/80 p-4 text-center"
    data-no-swipe
    data-test="game-over"
  >
    <h2 class="neon-title text-3xl font-black tracking-wide">
      Partie terminée
    </h2>
    <p
      class="text-4xl font-bold text-mac"
      data-test="final-score"
    >
      {{ formatScore(score) }}
    </p>
    <p
      class="text-pellet/80"
      data-test="final-level"
    >
      Niveau atteint : {{ level }}
    </p>
    <slot
      name="results"
      :score="score"
      :level="level"
    />
    <div class="mt-2 flex gap-3">
      <button
        type="button"
        class="neon-button rounded-xl px-6 py-3 font-bold"
        data-test="replay"
        @click="emit('replay')"
      >
        Rejouer
      </button>
      <button
        type="button"
        class="rounded-xl border border-pellet/40 px-6 py-3"
        data-test="home"
        @click="emit('home')"
      >
        Accueil
      </button>
    </div>
  </div>
</template>
