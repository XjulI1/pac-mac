<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

defineProps<{ title: string; message: string; confirmLabel: string; cancelLabel?: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' && event.key !== 'Enter') return
  event.preventDefault()
  event.stopPropagation()
  if (event.key === 'Escape') emit('cancel')
  else emit('confirm')
}

onMounted(() => window.addEventListener('keydown', onKeydown, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true))
</script>

<template>
  <div
    class="fixed inset-0 z-20 flex touch-manipulation items-center justify-center bg-night/80 p-4"
    role="dialog"
    data-no-swipe
    aria-modal="true"
    data-test="confirm-dialog"
  >
    <div class="w-full max-w-xs rounded-xl border border-wall/60 bg-panel p-5 text-center shadow-lg">
      <h2 class="mb-2 text-lg font-bold">
        {{ title }}
      </h2>
      <p class="mb-5 text-sm text-pellet/80">
        {{ message }}
      </p>
      <div class="flex justify-center gap-3">
        <button
          type="button"
          class="rounded-lg border border-pellet/40 px-4 py-2"
          data-test="cancel"
          @click="emit('cancel')"
        >
          {{ cancelLabel ?? 'Annuler' }}
        </button>
        <button
          type="button"
          class="rounded-lg border-2 border-hound px-4 py-2 font-bold text-hound"
          data-test="confirm"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
