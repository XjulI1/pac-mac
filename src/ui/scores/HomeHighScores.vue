<script setup lang="ts">
import { ref } from 'vue'
import type { HighScores } from '../../storage/useHighScores'
import ConfirmDialog from '../ConfirmDialog.vue'
import HighScoreTable from './HighScoreTable.vue'

const props = defineProps<{ highScores: HighScores }>()
const confirming = ref(false)

function clearScores() {
  props.highScores.clear()
  confirming.value = false
}
</script>

<template>
  <section
    class="flex w-full max-w-xs flex-col items-center gap-3"
    data-test="home-high-scores"
  >
    <h2 class="text-xs font-bold uppercase tracking-widest text-pellet/70">
      Meilleurs scores
    </h2>
    <HighScoreTable :scores="highScores.scores.value" />
    <button
      v-if="highScores.scores.value.length > 0"
      type="button"
      class="text-xs text-pellet/60 underline"
      data-test="clear-scores"
      @click="confirming = true"
    >
      Effacer les scores
    </button>
    <p
      v-if="!highScores.storageAvailable.value"
      class="rounded-lg border border-warden/60 px-3 py-2 text-xs text-warden"
      data-test="storage-warning"
    >
      Votre navigateur bloque l'enregistrement : les scores ne seront pas conservés après la fermeture.
    </p>
    <ConfirmDialog
      v-if="confirming"
      title="Effacer les 10 meilleurs scores ?"
      message="Cette action est définitive."
      confirm-label="Effacer"
      @confirm="clearScores"
      @cancel="confirming = false"
    />
  </section>
</template>
