<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Calendar, RotateCcw } from 'lucide-vue-next'
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import type { EstadoConvocatoria, EstadoTemporal } from '../../convocatorias/types/convocatorias.api'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{
  searchTerm: string
  estado: EstadoConvocatoria | 'all'
  estadoTemporal: EstadoTemporal | 'all'
  dateRange: { start: Date; end: Date } | null
}>()

const emit = defineEmits<{
  (e: 'update:searchTerm', val: string): void
  (e: 'update:estado', val: EstadoConvocatoria | 'all'): void
  (e: 'update:estadoTemporal', val: EstadoTemporal | 'all'): void
  (e: 'update:dateRange', val: { start: Date; end: Date } | null): void
  (e: 'filter-change'): void
  (e: 'clear-filters'): void
}>()

// Sincronización interna reactiva para el Rango de VCalendar sin mutar props directamente
const internalRange = ref(props.dateRange)

watch(() => props.dateRange, (newVal) => {
  internalRange.value = newVal
})

watch(internalRange, (newVal) => {
  emit('update:dateRange', newVal)
  emit('filter-change')
})
</script>

<template>
  <div class="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col gap-4 items-stretch sm:items-center sm:flex-row justify-between">
    <div class="flex flex-col sm:flex-row gap-3 flex-1 items-stretch sm:items-center">
      
      <div class="relative w-full sm:w-64">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-text-muted" />
        </div>
        <input 
          :value="searchTerm"
          @input="emit('update:searchTerm', ($event.target as HTMLInputElement).value)"
          type="text" 
          class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary text-sm transition-colors" 
          placeholder="Buscar por nombre o gestión..."
        />
      </div>

      <div class="w-full sm:w-44">
        <select
          :value="estado"
          @change="emit('update:estado', ($event.target as HTMLSelectElement).value as any); emit('filter-change')"
          class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
        >
          <option value="all">Todos los estados</option>
          <option value="BORRADOR">Borrador</option>
          <option value="PUBLICADA">Publicada</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="OCULTA">Oculta</option>
        </select>
      </div>

      <div class="w-full sm:w-48">
        <select
          :value="estadoTemporal"
          @change="emit('update:estadoTemporal', ($event.target as HTMLSelectElement).value as any); emit('filter-change')"
          class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors"
        >
          <option value="all">Todos los estados temp.</option>
          <option value="BORRADOR">Borrador</option>
          <option value="OCULTA">Oculta</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="PROXIMA">Próxima</option>
          <option value="INSCRIPCIONES PROXIMAS">Inscripciones Próximas</option>
          <option value="INSCRIPCION EN CURSO">Inscripción en Curso</option>
          <option value="EN CURSO">En Curso</option>
          <option value="FINALIZADA">Finalizada</option>
        </select>
      </div>

      <div class="relative w-full sm:w-auto ope-calendar-theme">
        <VDatePicker
          v-model.range="internalRange"
          :popover="{ visibility: 'click', placement: 'bottom-start' }"
        >
          <template #default="{ togglePopover }">
            <Button 
              variant="outline" 
              class="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-2 px-3 rounded-md text-sm font-medium transition-colors"
              @click="togglePopover"
            >
              <Calendar class="w-4 h-4 text-text-muted" />
              <span v-if="dateRange?.start && dateRange?.end">
                {{ new Date(dateRange.start).toLocaleDateString('es-BO', {day:'numeric', month:'short'}) }} - 
                {{ new Date(dateRange.end).toLocaleDateString('es-BO', {day:'numeric', month:'short'}) }}
              </span>
              <span v-else>Rango de Fechas</span>
            </Button>
          </template>
        </VDatePicker>
      </div>
    </div>

    <Button 
      v-if="estado !== 'all' || estadoTemporal !== 'all' || dateRange || searchTerm"
      variant="ghost" 
      size="sm"
      class="text-text-muted hover:text-danger self-start sm:self-auto flex items-center gap-1.5"
      @click="emit('clear-filters')"
    >
      <RotateCcw class="w-3.5 h-3.5" />
      Limpiar filtros
    </Button>
  </div>
</template>