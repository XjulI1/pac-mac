<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MAX_NAME_LENGTH, normalizeName, qualifies } from '../../storage/highScores'
import type { HighScores } from '../../storage/useHighScores'
import HighScoreTable from './HighScoreTable.vue'

const props = defineProps<{ score: number; level: number; highScores: HighScores }>()

const enters = qualifies(props.highScores.scores.value, props.score)
const newRecord = props.score > props.highScores.best.value
const name = ref(props.highScores.lastName.value)
const rank = ref<number | null>(null)
const saved = ref(false)
const input = ref<HTMLInputElement | null>(null)
const canSave = computed(() => normalizeName(name.value) !== '')

function save() {
  if (!canSave.value || saved.value) return
  rank.value = props.highScores.record({ name: name.value, score: props.score, level: props.level, date: new Date().toISOString() })
  saved.value = true
}

onMounted(() => input.value?.focus())
</script>

<template>
  <div
    class="flex w-full flex-col items-center gap-3"
    data-test="high-score-results"
  >
    <form
      v-if="enters && !saved"
      class="flex w-full max-w-xs flex-col items-center gap-2"
      data-test="name-form"
      @submit.prevent="save"
    >
      <p
        class="font-bold text-prowler"
        data-test="entry-title"
      >
        {{ newRecord ? 'Nouveau record !' : 'Vous entrez dans le top 10' }}
      </p>
      <label
        class="text-sm text-pellet/80"
        for="player-name"
      >Votre nom</label>
      <div class="flex w-full gap-2">
        <input
          id="player-name"
          ref="input"
          v-model="name"
          class="min-w-0 flex-1 rounded-lg border border-mac/60 bg-panel px-3 py-2 text-center text-lg text-white outline-none select-text focus:border-mac"
          :maxlength="MAX_NAME_LENGTH"
          autocomplete="nickname"
          enterkeyhint="done"
          data-test="name-input"
        >
        <button
          type="submit"
          class="neon-button rounded-lg px-4 py-2 font-bold disabled:opacity-40"
          :disabled="!canSave"
          data-test="save-score"
        >
          Enregistrer
        </button>
      </div>
    </form>
    <HighScoreTable
      v-else
      :scores="highScores.scores.value"
      :highlight="rank"
    />
  </div>
</template>
