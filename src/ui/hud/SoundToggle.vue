<script setup lang="ts">
defineProps<{ muted: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="flex h-9 w-9 items-center justify-center rounded-lg border border-mac/60 text-mac"
    :aria-label="muted ? 'Rétablir le son' : 'Couper le son'"
    :aria-pressed="muted"
    data-test="sound-toggle"
    @click="emit('toggle')"
  >
    <svg
      viewBox="0 0 16 16"
      class="h-4 w-4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M2.5 6h2.5l3.5-3v10l-3.5-3H2.5z"
        fill="currentColor"
      />
      <path
        v-if="muted"
        data-test="muted-icon"
        d="M11 6l3.5 4M14.5 6L11 10"
      />
      <path
        v-else
        data-test="sound-icon"
        d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.5a6 6 0 0 1 0 9"
      />
    </svg>
  </button>
</template>
