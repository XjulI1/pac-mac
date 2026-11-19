<script setup lang="ts">
import { useScreenKeys } from '../useScreenKeys'

withDefaults(defineProps<{ updateReady?: boolean }>(), { updateReady: false })
const emit = defineEmits<{ play: []; reload: [] }>()

useScreenKeys({ confirm: () => emit('play') })
</script>

<template>
  <main
    class="flex min-h-full flex-col items-center justify-center gap-8 px-4 py-[max(2rem,env(safe-area-inset-top))] text-center"
    data-test="home-screen"
  >
    <div
      v-if="updateReady"
      class="flex w-full max-w-xs items-center justify-between gap-3 rounded-xl border border-prowler/60 bg-panel px-4 py-2 text-sm"
      role="status"
      data-test="update-banner"
    >
      <span>Nouvelle version disponible</span>
      <button
        type="button"
        class="rounded-lg border border-prowler px-3 py-1 font-bold text-prowler"
        data-test="reload"
        @click="emit('reload')"
      >
        Recharger
      </button>
    </div>
    <h1 class="neon-title text-6xl font-black tracking-widest">
      PacMac
    </h1>
    <button
      type="button"
      class="neon-button rounded-2xl px-12 py-4 text-2xl font-bold"
      data-test="play"
      @click="emit('play')"
    >
      Jouer
    </button>
    <ul class="max-w-xs space-y-2 text-sm text-pellet/80">
      <li>Clavier : flèches, ZQSD ou WASD — P ou Échap : pause</li>
      <li>Au doigt : glissez dans la direction voulue, n'importe où sur le jeu</li>
    </ul>
    <slot />
  </main>
</template>
