<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createMazeRenderer, type MazeRenderer } from './mazeRenderer'
import { fitMaze, type Viewport } from './viewport'

const emit = defineEmits<{
  ready: [renderer: MazeRenderer]
  resize: [viewport: Viewport]
}>()

const container = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const renderer = shallowRef<MazeRenderer | null>(null)
const placement = ref({ width: '0px', height: '0px', left: '0px', top: '0px' })
let observer: ResizeObserver | null = null

function fit() {
  if (!container.value || !renderer.value) return
  const box = container.value.getBoundingClientRect()
  const viewport = fitMaze(box.width, box.height, window.devicePixelRatio || 1)
  renderer.value.resize(viewport)
  placement.value = {
    width: `${viewport.cssWidth}px`,
    height: `${viewport.cssHeight}px`,
    left: `${viewport.offsetX}px`,
    top: `${viewport.offsetY}px`,
  }
  emit('resize', viewport)
}

onMounted(() => {
  if (!canvas.value || !container.value) return
  renderer.value = createMazeRenderer(canvas.value)
  observer = new ResizeObserver(fit)
  observer.observe(container.value)
  fit()
  emit('ready', renderer.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  renderer.value?.dispose()
})

defineExpose({ renderer })
</script>

<template>
  <div
    ref="container"
    class="maze-canvas"
  >
    <canvas
      ref="canvas"
      :style="placement"
    />
  </div>
</template>

<style scoped>
.maze-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

canvas {
  position: absolute;
  display: block;
}
</style>
