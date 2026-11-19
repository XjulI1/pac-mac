<script setup lang="ts">
defineProps<{ count: number }>()
</script>

<template>
  <div
    class="flex items-center gap-1"
    :aria-label="`Vies en réserve : ${count}`"
  >
    <span
      v-for="index in count"
      :key="index"
      class="block h-3.5 w-3.5 rounded-[4px] bg-mac shadow-[0_0_6px_var(--color-mac)]"
      data-test="life"
    />
  </div>
</template>
