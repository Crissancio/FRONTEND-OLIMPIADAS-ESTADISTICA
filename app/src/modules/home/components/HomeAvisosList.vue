<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import HomeAvisoCard from './HomeAvisoCard.vue'
import type { HomeAviso } from '../types/home.types'

const props = defineProps<{
  avisosData: HomeAviso[]
  inicioLoadedOk: boolean
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

const avisosContainerRef = ref<HTMLElement | null>(null)
const focusedAviso = ref(0)

let autoScrollTimer: ReturnType<typeof setInterval> | null = null
const isHovered = ref(false)
let isScrolling = false
let wheelListener: ((e: WheelEvent) => void) | null = null

const handleWheel = (e: WheelEvent) => {
  const isDesktop = window.innerWidth >= 1024
  if (!isDesktop || isScrolling) return

  e.preventDefault()

  if (e.deltaY > 0 && focusedAviso.value < props.avisosData.length - 1) {
    focusedAviso.value++
    scrollToFocused()
  } else if (e.deltaY < 0 && focusedAviso.value > 0) {
    focusedAviso.value--
    scrollToFocused()
  } else if (e.deltaY > 0 && focusedAviso.value >= props.avisosData.length - 1) {
    emit('load-more')
  }
}

const handleScroll = () => {
  const container = avisosContainerRef.value
  if (!container) return
  const nearEnd = window.innerWidth >= 1024
    ? container.scrollTop + container.clientHeight >= container.scrollHeight - 80
    : container.scrollLeft + container.clientWidth >= container.scrollWidth - 80
  if (nearEnd) emit('load-more')
}

const scrollToFocused = () => {
  isScrolling = true
  const container = avisosContainerRef.value
  if (!container) return
  
  const item = container.children[focusedAviso.value] as HTMLElement
  if (item) {
    if (window.innerWidth >= 1024) {
      container.scrollTo({ top: item.offsetTop - container.offsetTop, behavior: 'smooth' })
    } else {
      container.scrollTo({ left: item.offsetLeft - container.offsetLeft, behavior: 'smooth' })
    }
  }
  setTimeout(() => { isScrolling = false }, 500)
}

const handleAvisoClick = (index: number) => {
  focusedAviso.value = index
  scrollToFocused()
}

const startAutoScroll = () => {
  if (autoScrollTimer) clearInterval(autoScrollTimer)
  autoScrollTimer = setInterval(() => {
    if (isHovered.value || props.avisosData.length <= 1) return
    focusedAviso.value = (focusedAviso.value + 1) % props.avisosData.length
    scrollToFocused()
  }, 4000)
}

const stopAutoScroll = () => {
  if (autoScrollTimer) clearInterval(autoScrollTimer)
}

onMounted(() => {
  startAutoScroll()
  const container = avisosContainerRef.value
  if (container) {
    wheelListener = handleWheel
    container.addEventListener('wheel', wheelListener, { passive: false })
  }
})

onUnmounted(() => {
  stopAutoScroll()
  if (avisosContainerRef.value && wheelListener) {
    avisosContainerRef.value.removeEventListener('wheel', wheelListener)
  }
})
</script>

<template>
  <div class="relative z-10 w-full lg:w-87.5 shrink-0 bg-primary/30 lg:bg-transparent flex flex-col py-2 lg:py-24 px-0 lg:px-6 border-t lg:border-t-0 lg:border-l border-white/10 backdrop-blur-md lg:backdrop-blur-none">
    
    <div class="flex items-center gap-3 mb-2 lg:mb-6 px-6 lg:px-0 shrink-0">
      <AlertCircle class="w-6 h-6 lg:w-7 lg:h-7 text-warning drop-shadow-sm" />
      <h2 class="text-xl lg:text-2xl font-heading font-bold text-white drop-shadow">Avisos</h2>
    </div>

    <div 
      class="flex flex-row lg:flex-col gap-4 lg:gap-0 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-hidden px-6 lg:px-0 pb-2 lg:pb-0 h-auto lg:h-full snap-x snap-mandatory lg:snap-none hide-scrollbar mask-edges-responsive"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @touchstart="isHovered = true"
      @touchend="isHovered = false"
      @scroll="handleScroll"
      ref="avisosContainerRef"
    >
      <div v-if="props.inicioLoadedOk && props.avisosData.length === 0" class="rounded-2xl border border-white/20 bg-white/10 p-6 text-sm font-semibold text-white/80 w-full">
        Sin avisos por el momento.
      </div>
      
      <HomeAvisoCard
        v-for="(aviso, i) in props.avisosData"
        :key="aviso.id"
        :aviso="aviso"
        :is-focused="focusedAviso === i"
        @click="handleAvisoClick(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.mask-edges-responsive {
  mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
}

@media (min-width: 1024px) {
  .mask-edges-responsive {
    mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
  }
}
</style>