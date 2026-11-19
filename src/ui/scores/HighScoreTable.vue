<script setup lang="ts">
import { formatScore } from '../../format'
import { formatDate, type HighScore } from '../../storage/highScores'

defineProps<{ scores: readonly HighScore[]; highlight?: number | null }>()
</script>

<template>
  <p
    v-if="scores.length === 0"
    class="text-sm text-pellet/70"
    data-test="no-scores"
  >
    Aucun score pour l'instant
  </p>
  <table
    v-else
    class="w-full max-w-xs border-separate border-spacing-y-0.5 text-left text-sm"
    data-test="high-scores"
  >
    <tbody>
      <tr
        v-for="(line, index) in scores"
        :key="index"
        :class="index === highlight ? 'bg-mac/20 font-bold text-mac' : 'text-pellet/90'"
        :data-highlight="index === highlight"
        data-test="score-line"
      >
        <td class="w-6 pr-1 text-right tabular-nums">
          {{ index + 1 }}
        </td>
        <td class="truncate pr-2">
          {{ line.name }}
        </td>
        <td class="pr-2 text-right tabular-nums">
          {{ formatScore(line.score) }}
        </td>
        <td class="pr-2 text-right text-xs tabular-nums">
          Niv. {{ line.level }}
        </td>
        <td class="text-right text-xs tabular-nums text-pellet/60">
          {{ formatDate(line.date) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
