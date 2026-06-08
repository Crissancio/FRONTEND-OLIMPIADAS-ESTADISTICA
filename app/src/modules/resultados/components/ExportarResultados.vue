<script setup lang="ts">
import { ref } from 'vue'
import { Upload, FileText, Loader2, ChevronDown, Check } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { resultadosService } from '@/modules/resultados/services/resultados.service'
import type { ExportarFaseFilters, EstadoAprobacion } from '@/modules/resultados/types/resultados.api'

const props = defineProps<{
  faseId: number
  selectedIds: number[]
}>()

const emit = defineEmits<{
  (e: 'error', msg: string): void
}>()

const isOpen = ref(false)
const isExporting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const filtroExport = ref<EstadoAprobacion>('TODOS')
const incluirNombres = ref(true)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  // Limpiamos el error si vuelve a abrir el menú
  if (isOpen.value) {
    errorMessage.value = ''
  }
}

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  
  let msg = fallbackMsg
  if (responseData) {
    msg = responseData.error || responseData.message || responseData.detail || fallbackMsg
  } else {
    msg = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
  }
  
  errorMessage.value = msg
  emit('error', msg) // Opcional, por si el padre también lo necesita
}

const exportar = async (formato: 'csv' | 'pdf') => {
  isExporting.value = true
  isOpen.value = false
  errorMessage.value = ''
  isSuccess.value = false
  
  try {
    const params: ExportarFaseFilters = {
      estado_aprobacion: filtroExport.value,
      incluir_nombres: incluirNombres.value,
    }
    const res = formato === 'csv'
      ? await resultadosService.exportarFaseCsv(props.faseId, params, { responseType: 'blob' })
      : await resultadosService.exportarFasePdf(props.faseId, params, { responseType: 'blob' })

    const blob = new Blob([res as BlobPart], {
      type: formato === 'csv' ? 'text/csv' : 'application/pdf',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultados_fase_${props.faseId}.${formato}`
    a.click()
    URL.revokeObjectURL(url)
    
    // Mostramos el éxito (botón verde)
    isSuccess.value = true
    setTimeout(() => {
      isSuccess.value = false
    }, 3000)
    
  } catch (err) {
    extractError(err, `No se pudo exportar el archivo ${formato.toUpperCase()}.`)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="relative flex flex-col items-end">
    
    <transition name="fade-tooltip">
      <div 
        v-if="errorMessage" 
        class="absolute right-0 bottom-[calc(100%+12px)] z-99999 w-72 rounded-xl border border-red-400 bg-red-50 p-3.5 shadow-2xl"
      >
        <div class="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-red-400 bg-red-50"></div>
        
        <div class="relative z-10 flex items-start justify-between gap-3">
          <p class="text-xs font-bold text-red-800 leading-tight">{{ errorMessage }}</p>
          <button 
            class="shrink-0 text-red-500 hover:scale-110 hover:text-red-700 transition-transform" 
            @click.stop="errorMessage = ''"
          >
            ✕
          </button>
        </div>
      </div>
    </transition>

    <Button
      variant="outline"
      class="flex items-center gap-2 transition-all duration-300"
      :class="isSuccess ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' : ''"
      :disabled="isExporting"
      @click="toggleDropdown"
    >
      <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin" />
      <Check v-else-if="isSuccess" class="h-4 w-4 text-green-600" />
      <Upload v-else class="h-4 w-4" />
      {{ isSuccess ? '¡Archivo descargado!' : 'Exportar' }}
      <ChevronDown v-if="!isSuccess" class="h-3 w-3" />
    </Button>

    <transition name="fade-dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 top-[calc(100%+8px)] z-9000 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg space-y-3"
      >
        <div>
          <label class="mb-1 block text-xs font-bold text-text-muted">Filtrar por</label>
          <select
            v-model="filtroExport"
            class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
          >
            <option value="TODOS">Todos</option>
            <option value="APROBADO">Solo aprobados</option>
            <option value="REPROBADO">Solo reprobados</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input id="nombres" v-model="incluirNombres" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
          <label for="nombres" class="text-xs font-medium text-text-main cursor-pointer select-none">Incluir nombres</label>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
          <button
            class="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-bold text-text-muted transition-colors hover:border-green-600 hover:bg-green-50 hover:text-green-700 shadow-sm"
            @click="exportar('csv')"
          >
            <FileText class="h-3.5 w-3.5" />CSV
          </button>
          <button
            class="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-bold text-text-muted transition-colors hover:border-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"
            @click="exportar('pdf')"
          >
            <FileText class="h-3.5 w-3.5" />PDF
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Transiciones suaves para evitar clases no detectadas de Tailwind */
.fade-tooltip-enter-active,
.fade-tooltip-leave-active,
.fade-dropdown-enter-active,
.fade-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

/* El globo de texto viene desde abajo hacia arriba */
.fade-tooltip-enter-from,
.fade-tooltip-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* El menú desplegable viene de arriba hacia abajo */
.fade-dropdown-enter-from,
.fade-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>