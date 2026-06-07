<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Image as ImageIcon, ChevronLeft, ChevronRight, ExternalLink, FileText } from 'lucide-vue-next'
import VuePdfEmbed from 'vue-pdf-embed'
import type { MaterialPrincipalPorTipo } from '@/modules/material/types/material.api'

import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{
  materiales: MaterialPrincipalPorTipo[]
}>()

const currentIndex = ref(0)

const currentSlide = computed(() => props.materiales[currentIndex.value] || null)

let slideTimer: ReturnType<typeof setInterval> | null = null

const startAutoSlide = () => {
  if (props.materiales.length <= 1) return
  
  slideTimer = setInterval(() => {
    nextSlideAuto()
  }, 15000)
}

const stopAutoSlide = () => {
  if (slideTimer) {
    clearInterval(slideTimer)
    slideTimer = null
  }
}

const resetAutoSlide = () => {
  stopAutoSlide()
  startAutoSlide()
}

onMounted(() => {
  startAutoSlide()
})

onUnmounted(() => {
  stopAutoSlide() 
})

const nextSlideAuto = () => {
  if (props.materiales.length === 0) return
  currentIndex.value = currentIndex.value === props.materiales.length - 1 ? 0 : currentIndex.value + 1
}

const prevSlide = () => {
  if (props.materiales.length === 0) return
  currentIndex.value = currentIndex.value === 0 ? props.materiales.length - 1 : currentIndex.value - 1
  resetAutoSlide()
}

const nextSlide = () => {
  if (props.materiales.length === 0) return
  currentIndex.value = currentIndex.value === props.materiales.length - 1 ? 0 : currentIndex.value + 1
  resetAutoSlide()
}

const goToSlide = (index: number) => {
  currentIndex.value = index
  resetAutoSlide()
}

const isPdf = computed(() => currentSlide.value?.enlace_acceso.toLowerCase().endsWith('.pdf'))
const isImage = computed(() => currentSlide.value?.enlace_acceso.match(/\.(jpeg|jpg|gif|png)$/i) != null)
</script>

<template>
  <div 
    class="w-full shrink-0 rounded-xl bg-white flex flex-col overflow-hidden h-125 border border-gray-200 relative group shadow-sm"
    @mouseenter="stopAutoSlide"
    @mouseleave="startAutoSlide"
  >
    
    <div class="flex-1 relative bg-gray-50 overflow-hidden flex items-center justify-center p-2">
      
      <template v-if="currentSlide">
        <img 
          v-if="isImage" 
          :src="currentSlide.enlace_acceso" 
          class="max-w-full max-h-full w-auto h-auto object-contain" 
          alt="Previsualización del material"
        />
        
        <div v-else-if="isPdf" class="w-full h-full flex items-center justify-center overflow-hidden">
          <VuePdfEmbed 
            :source="currentSlide.enlace_acceso" 
            :page="1" 
            class="max-w-full max-h-full object-contain drop-shadow-md" 
          />
        </div>
        
        <div v-else class="flex flex-col items-center justify-center p-4 text-center h-full w-full">
          <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 drop-shadow-sm">
            <FileText class="h-8 w-8 text-blue-600" />
          </div>
          <p class="text-sm font-bold text-blue-900 mb-1">Documento Oficial</p>
          <p class="text-xs text-gray-500 leading-tight max-w-50">La previsualización no está disponible para este formato.</p>
        </div>
      </template>

      <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 p-6 text-center">
        <ImageIcon class="h-12 w-12 opacity-40" />
        <span class="text-sm font-medium">Sin materiales visuales</span>
        <p class="text-xs text-text-muted">No se han cargado documentos principales para esta convocatoria.</p>
      </div>

      <template v-if="materiales.length > 1">
        <button @click="prevSlide" class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110 z-10">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button @click="nextSlide" class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110 z-10">
          <ChevronRight class="w-5 h-5" />
        </button>
      </template>
    </div>

    <div v-if="currentSlide" class="bg-white border-t border-gray-200 flex flex-col px-5 py-3 shrink-0 gap-3">
      
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-bold text-text-main truncate" :title="currentSlide.nombre_material">
            {{ currentSlide.nombre_material }}
          </h4>
          <Badge variant="outline" class="text-[10px] mt-1 bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-wider">
            {{ currentSlide.tipo_material.replace('_', ' ') }}
          </Badge>
        </div>
        <a :href="currentSlide.enlace_acceso" target="_blank" class="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-secondary-dark transition-colors shrink-0 mt-1">
          Abrir en pestaña <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </div>
      
      <div v-if="materiales.length > 1" class="flex items-center justify-center gap-2 pt-2 border-t border-gray-50">
        <button 
          v-for="(_, index) in materiales" 
          :key="index"
          @click="goToSlide(index)"
          class="h-2 rounded-full transition-all duration-300"
          :class="currentIndex === index ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'"
          :title="`Ver material ${index + 1}`"
        ></button>
      </div>
      
    </div>
  </div>
</template>