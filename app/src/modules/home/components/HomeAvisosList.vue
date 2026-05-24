<script setup lang="ts">
import { ref } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import type { HomeAviso } from '../types/home.types'

const props = defineProps<{
  avisosData: HomeAviso[]
  inicioLoadedOk: boolean
}>()

const avisosContainerRef = ref<HTMLElement | null>(null)
const focusedAviso = ref(0)

let isScrolling = false
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
  }
}

const scrollToFocused = () => {
  isScrolling = true
  const container = avisosContainerRef.value
  if (!container) return
  
  const item = container.children[focusedAviso.value] as HTMLElement
  if (item) {
    container.scrollTo({ top: item.offsetTop - container.offsetTop, behavior: 'smooth' })
  }
  setTimeout(() => { isScrolling = false }, 500)
}

const handleAvisoClick = (index: number) => {
  if (window.innerWidth >= 1024) {
    focusedAviso.value = index
    scrollToFocused()
  }
}
</script>

<template>
  <div class="relative z-10 w-full lg:w-[350px] shrink-0 bg-primary/30 lg:bg-transparent flex flex-col py-6 lg:py-24 px-0 lg:px-6 border-t lg:border-t-0 lg:border-l border-white/10 backdrop-blur-md lg:backdrop-blur-none">
    
    <div class="flex items-center gap-3 mb-4 lg:mb-6 px-6 lg:px-0 shrink-0">
      <AlertCircle class="w-6 h-6 lg:w-7 lg:h-7 text-yellow-400 drop-shadow-sm" />
      <h2 class="text-xl lg:text-2xl font-heading font-bold text-white drop-shadow">Avisos</h2>
    </div>

    <div 
      class="flex flex-row lg:flex-col gap-4 lg:gap-0 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-hidden px-6 lg:px-0 pb-4 lg:pb-0 h-auto lg:h-full snap-x snap-mandatory lg:snap-none hide-scrollbar"
      @wheel="handleWheel"
      ref="avisosContainerRef"
    >
      <div v-if="props.inicioLoadedOk && props.avisosData.length === 0" class="rounded-2xl border border-white/20 bg-white/10 p-6 text-sm font-semibold text-white/80 w-full">
        Sin avisos por el momento.
      </div>
      
      <div 
        v-for="(aviso, i) in props.avisosData" 
        :key="aviso.id" 
        class="shrink-0 w-[280px] sm:w-[320px] lg:w-full snap-center transition-all duration-500 origin-center cursor-pointer py-2 lg:py-4"
        :class="[
          focusedAviso === i ? 'lg:scale-100 lg:opacity-100 lg:z-10 lg:drop-shadow-xl' : 'lg:scale-90 lg:opacity-50 hover:lg:opacity-80'
        ]"
        @click="handleAvisoClick(i)"
      >
        <div class="bg-white/10 backdrop-blur-md p-5 lg:p-6 rounded-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:bg-white/15 transition-colors h-full flex flex-col">
          <div :class="[
            'absolute left-0 top-0 bottom-0 w-1.5',
            aviso.tipo === 'Urgente' ? 'bg-danger' : 
            aviso.tipo === 'Importante' ? 'bg-warning' : 'bg-secondary'
          ]"></div>
          <div class="pl-3 flex-1">
            <div class="flex items-center justify-between mb-3">
              <span :class="[
                'text-[10px] lg:text-xs font-bold uppercase tracking-widest',
                aviso.tipo === 'Urgente' ? 'text-red-400' : 
                aviso.tipo === 'Importante' ? 'text-yellow-400' : 'text-blue-300'
              ]">
                {{ aviso.tipo }}
              </span>
              <span class="text-[10px] lg:text-xs text-white/60 font-medium">{{ aviso.fecha }}</span>
            </div>
            <h4 class="font-heading font-bold text-white mb-2 text-base lg:text-lg leading-tight">{{ aviso.titulo }}</h4>
            <p class="text-xs lg:text-sm text-white/80 line-clamp-3 leading-relaxed">{{ aviso.descripcion }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>