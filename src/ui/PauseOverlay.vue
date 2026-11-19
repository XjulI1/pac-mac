<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { useScreenKeys } from './useScreenKeys'

const emit = defineEmits<{ resume: []; quit: [] }>()
const confirming = ref(false)

useScreenKeys({
  confirm: () => {
    if (!confirming.value) emit('resume')
  },
})
</script>

<template>
  <div
    class="absolute inset-0 z-10 flex touch-manipulation flex-col items-center justify-center gap-4 bg-night/75"
    data-no-swipe
    data-test="pause-overlay"
  >
    <h2 class="neon-title text-3xl font-black tracking-widest">
      Pause
    </h2>
    <button
      type="button"
      class="neon-button rounded-xl px-8 py-3 text-lg font-bold"
      data-test="resume"
      @click="emit('resume')"
    >
      Reprendre
    </button>
    <button
      type="button"
      class="rounded-xl px-6 py-2 text-sm text-pellet/80 underline"
      data-test="quit"
      @click="confirming = true"
    >
      Quitter la partie
    </button>
    <ConfirmDialog
      v-if="confirming"
      title="Quitter la partie ?"
      message="La partie en cours sera perdue."
      confirm-label="Quitter"
      @confirm="emit('quit')"
      @cancel="confirming = false"
    />
  </div>
</template>
