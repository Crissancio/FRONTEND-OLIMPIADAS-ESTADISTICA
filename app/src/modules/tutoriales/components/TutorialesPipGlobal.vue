<script setup lang="ts">
import { ref, computed,  onMounted, onUnmounted } from 'vue'
import {
  X, Maximize2, GripHorizontal,
  ExternalLink, AlertCircle, PictureInPicture2
} from 'lucide-vue-next'
import { useTutorialesStore } from '../stores/tutoriales.store'

const store = useTutorialesStore()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const pipWidth = ref(400)
const pipHeight = ref(240)
const pipX = ref(0)
const pipY = ref(0)
const isDragging = ref(false)
const isResizing = ref(false)

const MIN_W = 280
const MIN_H = 180
const MAX_W = 760
const MAX_H = 520

onMounted(() => {
  pipX.value = window.innerWidth - pipWidth.value - 24
  pipY.value = window.innerHeight - pipHeight.value - 80
})

let dragStartX = 0
let dragStartY = 0
let dragStartPipX = 0
let dragStartPipY = 0

function startDrag(e: MouseEvent) {
  if (isResizing.value) return
  isDragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartPipX = pipX.value
  dragStartPipY = pipY.value
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  pipX.value = Math.max(0, Math.min(window.innerWidth - pipWidth.value, dragStartPipX + dx))
  pipY.value = Math.max(0, Math.min(window.innerHeight - pipHeight.value - 50, dragStartPipY + dy))
}

function stopDrag() {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

let resizeStartX = 0
let resizeStartY = 0
let resizeStartW = 0
let resizeStartH = 0

function startResize(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeStartW = pipWidth.value
  resizeStartH = pipHeight.value
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!isResizing.value) return
  const dx = e.clientX - resizeStartX
  const dy = e.clientY - resizeStartY
  pipWidth.value = Math.max(MIN_W, Math.min(MAX_W, resizeStartW + dx))
  pipHeight.value = Math.max(MIN_H, Math.min(MAX_H, resizeStartH + dy))
}

function stopResize() {
  isResizing.value = false
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
})

const pipStyle = computed(() => ({
  left: `${pipX.value}px`,
  top: `${pipY.value}px`,
  width: `${pipWidth.value}px`,
}))

function abrirEnDrive() {
  if (store.tutorialActivo) {
    window.open(store.tutorialActivo.driveUrl, '_blank', 'noopener,noreferrer')
  }
}

function abrirPantallaCompleta() {
  if (iframeRef.value?.requestFullscreen) {
    iframeRef.value.requestFullscreen()
  }
}
</script>

<template>
  <div
    v-if="store.tutorialActivo && store.pipActivo"
    ref="pipRef"
    :style="pipStyle"
    class="fixed z-9999 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-2xl select-none"
    :class="isDragging ? 'cursor-grabbing' : ''"
  >
    <div
      class="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/80 cursor-grab active:cursor-grabbing"
      @mousedown="startDrag"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <GripHorizontal class="size-3.5 text-slate-300 shrink-0" />
        <p class="text-[11px] font-bold text-slate-700 truncate">
          {{ store.tutorialActivo?.title }}
        </p>
      </div>
      <div class="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          title="Ver en pantalla completa"
          class="rounded p-1 text-slate-400 hover:bg-gray-100 hover:text-slate-600 cursor-pointer transition-colors"
          @mousedown.stop
          @click="abrirPantallaCompleta"
        >
          <Maximize2 class="size-3.5" />
        </button>
        <button
          type="button"
          title="Volver al reproductor integrado"
          class="rounded p-1 text-slate-400 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
          @mousedown.stop
          @click="store.desactivarPip()"
        >
          <PictureInPicture2 class="size-3.5" />
        </button>
        <button
          type="button"
          title="Cerrar"
          class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors"
          @mousedown.stop
          @click="store.cerrarReproductor()"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </div>

    <div
      class="relative bg-slate-900 w-full"
      :style="{ height: `${pipHeight}px` }"
    >
      <iframe
        ref="iframeRef"
        :src="store.embedUrl"
        :title="store.tutorialActivo?.title"
        class="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen"
        allowfullscreen
      />

      <div
        class="absolute bottom-0 right-0 w-6 h-6 z-10 cursor-se-resize flex items-end justify-end pb-1 pr-1"
        @mousedown.stop="startResize"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M9 1L1 9M9 5L5 9"
            stroke="white"
            stroke-opacity="0.4"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>

    <div class="flex items-center gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50/50">
      <AlertCircle class="size-3 text-slate-400 shrink-0" />
      <span class="text-[11px] text-slate-400 font-medium">¿Problemas con el video? Visualízalo en Drive</span>
      <button
        type="button"
        class="ml-auto flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer shrink-0"
        @mousedown.stop
        @click="abrirEnDrive"
      >
        <ExternalLink class="size-3" />
        Abrir
      </button>
    </div>
  </div>
</template>