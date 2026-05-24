<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, FileText, Image as ImageIcon } from 'lucide-vue-next'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import VuePdfEmbed from 'vue-pdf-embed'
import type { HomeConvocatoria } from '../types/home.types'

const props = defineProps<{
  activeConv: HomeConvocatoria
}>()

const activeTab = ref<'AFICHE' | 'CONVOCATORIA'>('AFICHE')

const activeMaterial = computed(() => {
  return props.activeConv.material_principal?.find(m => m.importancia_tipo === activeTab.value)
})

const isPdf = computed(() => {
  const url = activeMaterial.value?.enlace_acceso?.toLowerCase() || ''
  return url.endsWith('.pdf') || activeTab.value === 'CONVOCATORIA'
})

const openDocument = () => {
  if (activeMaterial.value?.enlace_acceso) {
    window.open(activeMaterial.value.enlace_acceso, '_blank')
  }
}
</script>

<template>
  <div class="bg-slate-50 relative flex flex-col p-6 lg:p-8 border-t lg:border-t-0 lg:border-r border-gray-200">
    
    <Badge 
      v-if="props.activeConv.estado === 'ACTIVA'" 
      class="absolute top-4 left-4 bg-success text-white font-bold px-3 py-1 shadow-sm z-10"
    >
      EN CURSO
    </Badge>

    <div class="flex bg-gray-200 p-1 rounded-lg mb-6 mt-8 lg:mt-0 relative z-10 w-full max-w-[320px] mx-auto">
      <button 
        @click="activeTab = 'AFICHE'"
        class="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all duration-300"
        :class="activeTab === 'AFICHE' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <ImageIcon class="w-4 h-4" />
        Afiche
      </button>
      <button 
        @click="activeTab = 'CONVOCATORIA'"
        class="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-all duration-300"
        :class="activeTab === 'CONVOCATORIA' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <FileText class="w-4 h-4" />
        Reglamento
      </button>
    </div>

    <div class="w-full flex-1 flex flex-col items-center justify-start px-4">
      <transition 
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
        mode="out-in"
      >
        <div 
          :key="activeTab" 
          class="w-full bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden cursor-pointer group hover:border-primary hover:shadow-lg transition-all flex flex-col relative"
          @click="openDocument"
        >
          <template v-if="activeMaterial?.enlace_acceso">
            <VuePdfEmbed 
              v-if="isPdf"
              :source="activeMaterial.enlace_acceso"
              :page="1"
              class="w-full h-auto object-contain"
            />
            <img 
              v-else
              :src="activeMaterial.enlace_acceso" 
              class="w-full h-auto object-contain"
              alt="Previsualización del material"
            />
          </template>
          <div v-else class="w-full aspect-[3/4] flex items-center justify-center bg-gray-100 text-gray-400 text-sm font-medium px-4 text-center">
            Documento no disponible
          </div>

          <div class="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
            <Download class="w-12 h-12 mb-3 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300" />
            <span class="font-bold text-lg">Hacer clic para abrir</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>