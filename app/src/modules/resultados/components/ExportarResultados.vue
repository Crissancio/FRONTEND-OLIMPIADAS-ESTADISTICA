<script setup lang="ts">
import { ref } from 'vue'
import { Download, FileText, Loader2, ChevronDown } from 'lucide-vue-next'
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
const filtroExport = ref<EstadoAprobacion>('TODOS')
const incluirNombres = ref(true)

const exportar = async (formato: 'csv' | 'pdf') => {
  isExporting.value = true
  isOpen.value = false
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
  } catch {
    emit('error', `No se pudo exportar el archivo ${formato.toUpperCase()}.`)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="relative">
    <Button
      variant="outline"
      class="flex items-center gap-2"
      :disabled="isExporting"
      @click="isOpen = !isOpen"
    >
      <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin" />
      <Download v-else class="h-4 w-4" />
      Exportar
      <ChevronDown class="h-3 w-3" />
    </Button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-soft space-y-3"
    >
      <div>
        <label class="mb-1 block text-xs font-bold text-text-muted">Filtrar por</label>
        <select
          v-model="filtroExport"
          class="h-9 w-full rounded-lg border border-gray-300 px-2 text-sm"
        >
          <option value="TODOS">Todos</option>
          <option value="APROBADO">Solo aprobados</option>
          <option value="REPROBADO">Solo reprobados</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <input id="nombres" v-model="incluirNombres" type="checkbox" class="h-4 w-4" />
        <label for="nombres" class="text-xs font-medium text-text-main cursor-pointer">Incluir nombres</label>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
        <button
          class="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-text-muted hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
          @click="exportar('csv')"
        >
          <FileText class="h-3.5 w-3.5" />CSV
        </button>
        <button
          class="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-text-muted hover:border-error/40 hover:bg-error/5 hover:text-error transition-colors"
          @click="exportar('pdf')"
        >
          <FileText class="h-3.5 w-3.5" />PDF
        </button>
      </div>
    </div>
  </div>
</template>