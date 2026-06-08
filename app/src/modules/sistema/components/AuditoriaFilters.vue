<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Search, CalendarDays, X, Upload, Download } from 'lucide-vue-next'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { TipoAccion, TipoModulo } from '../types/sistema.api'

const props = defineProps<{
  total: number
  isExporting: boolean
}>()

const emit = defineEmits<{
  (e: 'filterChange', filters: any): void
  (e: 'export', dates: { start: string, end: string }): void
}>()

const isExportMode = ref(false)
let debounceTimeout: ReturnType<typeof setTimeout>

const localFilters = reactive({
  busqueda: '',
  modulo: 'all' as TipoModulo | 'all',
  accion: 'all' as TipoAccion | 'all',
})

const exportDateRange = ref<{ start: Date, end: Date } | null>(null)

const initExportDates = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 10)
  exportDateRange.value = { start, end }
}

const emitCurrentFilters = () => {
  if (isExportMode.value) {
    if (exportDateRange.value?.start && exportDateRange.value?.end) {
      emit('filterChange', {
        busqueda: null,
        modulo: null,
        accion: null,
        fecha_start: exportDateRange.value.start.toISOString(),
        fecha_end: exportDateRange.value.end.toISOString()
      })
    }
  } else {
    emit('filterChange', {
      busqueda: localFilters.busqueda.trim() || null,
      modulo: localFilters.modulo === 'all' ? null : localFilters.modulo,
      accion: localFilters.accion === 'all' ? null : localFilters.accion,
      fecha_start: null,
      fecha_end: null
    })
  }
}

const handleExportAction = () => {
  if (!isExportMode.value) {
    isExportMode.value = true
    initExportDates()
    emitCurrentFilters()
  } else {
    if (exportDateRange.value?.start && exportDateRange.value?.end) {
      emit('export', {
        start: exportDateRange.value.start.toISOString(),
        end: exportDateRange.value.end.toISOString()
      })
    }
  }
}

const cancelExportMode = () => {
  isExportMode.value = false
  exportDateRange.value = null
  emitCurrentFilters()
}

watch(localFilters, () => {
  if (isExportMode.value) return
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    emitCurrentFilters()
  }, 400)
}, { deep: true })

watch(exportDateRange, () => {
  if (!isExportMode.value) return
  emitCurrentFilters()
})
</script>

<template>
  <div class="border-b border-gray-200 bg-gray-50/50 p-4 space-y-4">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 flex-1 w-full">
        <div class="relative">
          <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400" />
          <input 
            v-model="localFilters.busqueda" 
            :disabled="isExportMode"
            class="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed" 
            placeholder="Buscar usuario o acción..." 
          />
        </div>
        <select 
          v-model="localFilters.modulo" 
          :disabled="isExportMode"
          class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-800 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
        >
          <option value="all">Todos los módulos</option>
          <optgroup label="Académico">
            <option value="CONVOCATORIA">Convocatoria</option>
            <option value="INSCRIPCION">Inscripción</option>
            <option value="RESULTADO">Resultado</option>
            <option value="CATEGORIA">Categoría</option>
            <option value="FASE_PRUEBA">Fase Prueba</option>
            <option value="FASE_PREPARACION">Fase Preparación</option>
            <option value="MATERIAL">Material</option>
          </optgroup>
          <optgroup label="Personas">
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="DIRECTOR">Director</option>
            <option value="COLEGIO">Colegio</option>
            <option value="COLABORADOR">Colaborador</option>
            <option value="ADMINISTRADOR">Administrador</option>
          </optgroup>
          <optgroup label="Comunicación">
            <option value="AVISO">Aviso</option>
            <option value="CONTACTO">Contacto</option>
            <option value="CAMPANIA">Campaña</option>
            <option value="EMAIL_LOG">Logs Email</option>
          </optgroup>
          <optgroup label="Seguridad">
            <option value="AUTH">Autenticación</option>
          </optgroup>
        </select>
        <select 
          v-model="localFilters.accion" 
          :disabled="isExportMode"
          class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-800 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
        >
          <option value="all">Cualquier acción</option>
          <option value="CREAR">Crear</option>
          <option value="ACTUALIZAR">Actualizar</option>
          <option value="ELIMINAR">Eliminar</option>
          <option value="PUBLICAR">Publicar</option>
          <option value="OCULTAR">Ocultar</option>
          <option value="REPROGRAMAR">Reprogramar</option>
          <option value="RESPONDER">Responder</option>
          <option value="LOGIN_FALLIDO">Login Fallido (Crítica)</option>
        </select>
      </div>
      <div class="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 font-bold shrink-0 shadow-sm">
        {{ total }} registros
      </div>
    </div>
    
    <div class="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-gray-200 justify-between">
      <div class="flex-1 w-full max-w-sm">
        <label class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Rango de fechas para exportación</label>
        <DatePicker 
          v-model.range="exportDateRange" 
          mode="date" 
          :popover="{ visibility: 'click', placement: 'bottom-start' }"
        >
          <template #default="{ inputValue, togglePopover }">
            <div class="relative w-full">
              <CalendarDays class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400" />
              <input
                :value="exportDateRange ? `${inputValue.start} a ${inputValue.end}` : ''"
                @click="togglePopover"
                readonly
                placeholder="Haz clic en 'Configurar Exportación'..."
                :class="[
                  'h-9 w-full rounded-md border pl-9 pr-8 text-xs cursor-pointer focus:outline-none text-gray-800 transition-all font-medium',
                  isExportMode ? 'border-primary ring-2 ring-primary/10 bg-white' : 'border-gray-200 bg-gray-100/70 text-gray-400 cursor-not-allowed'
                ]"
                @click.prevent="isExportMode ? togglePopover() : handleExportAction()"
              />
              <button 
                v-if="exportDateRange && isExportMode" 
                @click.stop="exportDateRange = null" 
                class="absolute right-2 top-2 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </template>
        </DatePicker>
      </div>
      
      <div class="flex items-center gap-2 mt-auto w-full sm:w-auto justify-end">
        <Button 
          v-if="isExportMode"
          variant="ghost" 
          class="h-9 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 border border-transparent"
          :disabled="isExporting"
          @click="cancelExportMode"
        >
          Cancelar
        </Button>
        <Button 
          :variant="isExportMode ? 'default' : 'outline'" 
          class="h-9 shrink-0 flex items-center gap-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-xs px-4" 
          :disabled="isExporting || (isExportMode && !exportDateRange)" 
          @click="handleExportAction"
        >
          <Upload v-if="!isExportMode" class="h-4 w-4 text-gray-500" />
          <Download v-else class="h-4 w-4 text-white animate-pulse" />
          <span>
            {{ isExporting ? 'Procesando...' : isExportMode ? 'Descargar Archivo CSV' : 'Configurar Exportación' }}
          </span>
        </Button>
      </div>
    </div>
  </div>
</template>