<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { BonusKind } from '../../engine'
import { BONUS_ICONS } from '../../render/draw/items'

const props = withDefaults(defineProps<{ kind: BonusKind; size?: number }>(), { size: 16 })
const canvas = ref<HTMLCanvasElement | null>(null)

function paint() {
  const element = canvas.value
  const ctx = element?.getContext('2d')
  if (!element || !ctx) return
  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  element.width = Math.round(props.size * dpr)
  element.height = Math.round(props.size * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, props.size * dpr * 0.5, props.size * dpr * 0.5)
  BONUS_ICONS[props.kind](ctx, props.size)
}

onMounted(paint)
watch(() => [props.kind, props.size], paint)
</script>

<template>
  <canvas
    ref="canvas"
    :data-kind="kind"
    :style="{ width: `${size}px`, height: `${size}px` }"
    data-test="bonus-icon"
    aria-hidden="true"
  />
</template>
