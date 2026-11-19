<script setup lang="ts">
import type { BonusKind } from '../../engine'
import BonusIcon from './BonusIcon.vue'

defineProps<{ kinds: readonly BonusKind[] }>()
</script>

<template>
  <div
    class="flex items-center justify-end gap-0.5"
    aria-label="Bonus récoltés"
  >
    <BonusIcon
      v-for="(kind, index) in kinds"
      :key="index"
      :kind="kind"
      :size="14"
    />
  </div>
</template>
