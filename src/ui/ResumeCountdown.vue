<script setup lang="ts">
defineProps<{ value: number | null }>()
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    data-test="countdown"
  >
    <span class="neon-title text-7xl font-black">{{ value }}</span>
  </div>
</template>
