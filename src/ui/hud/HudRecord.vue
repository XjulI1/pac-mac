<script setup lang="ts">
import { computed } from 'vue'
import { formatScore } from '../../format'

const props = defineProps<{ best: number; score: number }>()
const record = computed(() => Math.max(props.best, props.score))
</script>

<template>
  <span data-test="hud-record">Record <strong class="text-pellet">{{ formatScore(record) }}</strong></span>
</template>
