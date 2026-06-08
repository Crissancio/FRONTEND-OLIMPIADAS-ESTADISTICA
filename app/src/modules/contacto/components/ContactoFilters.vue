<script setup lang="ts">
import { reactive, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import { Search, CalendarDays, X } from 'lucide-vue-next'
import 'v-calendar/style.css'
import type { EstadoContacto, EstadoEmail } from '../types/contacto.api'

const props = defineProps<{
  mode: 'recientes' | 'respondidos'
}>()

const emit = defineEmits(['filterChange'])

const localFilters = reactive({
  correo_electronico: '',
  estado: '' as EstadoContacto | '',
  estado_email: '' as EstadoEmail | '',
  dateRange: null as { start: Date; end: Date } | null
})

let debounceTimeout: ReturnType<typeof setTimeout>

const clearFilters = () => {
  localFilters.correo_electronico = ''
  localFilters.estado = ''
  localFilters.estado_email = ''
  localFilters.dateRange = null
}

const formatDate = (date: Date | null): string | null => {
  if (!date) return null
  return date.toISOString().split('T')[0]
}

watch(localFilters, (newVals) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    const basePayload: Record<string, any> = {
      correo_electronico: newVals.correo_electronico.trim() || null,
      page: 1
    }

    if (props.mode === 'recientes') {
      basePayload.estado = newVals.estado || null
      basePayload.creacion_start = formatDate(newVals.dateRange?.start || null)
      basePayload.creacion_end = formatDate(newVals.dateRange?.end || null)
    } else {
      basePayload.estado_email = newVals.estado_email || null
      basePayload.cambio_start = formatDate(newVals.dateRange?.start || null)
      basePayload.cambio_end = formatDate(newVals.dateRange?.end || null)
    }

    emit('filterChange', basePayload)
  }, 350)
}, { deep: true })

watch(() => props.mode, () => {
  clearFilters()
})
</script>

<template>
  <div class="space-y-4 border-b border-gray-200 p-4 bg-white">
    <div class="relative">
      <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400" />
      <input
        v-model="localFilters.correo_electronico"
        class="h-10 w-full rounded-md border border-gray-300 bg-gray-50 pl-9 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Buscar por correo electrónico..."
      />
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
      <div v-if="mode === 'recientes'">
        <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estado de Contacto</label>
        <select 
          v-model="localFilters.estado" 
          class="h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">TODOS LOS ESTADOS</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="LEIDO">LEÍDO</option>
          <option value="RESPONDIDO">RESPONDIDO</option>
        </select>
      </div>

      <div v-else>
        <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estado del Email</label>
        <select 
          v-model="localFilters.estado_email" 
          class="h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">TODOS LOS ENVÍOS</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="EN_PROCESO">EN PROCESO</option>
          <option value="ENVIADO">ENVIADO</option>
          <option value="FALLIDO">FALLIDO</option>
        </select>
      </div>

      <div>
        <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rango de Fecha</label>
        <DatePicker 
          v-model.range="localFilters.dateRange" 
          mode="date" 
          :popover="{ visibility: 'click', placement: 'bottom-start' }"
        >
          <template #default="{ inputValue, togglePopover }">
            <div class="relative">
              <CalendarDays class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400" />
              <input
                :value="localFilters.dateRange ? `${inputValue.start} a ${inputValue.end}` : ''"
                @click="togglePopover"
                readonly
                placeholder="Seleccionar rango..."
                class="h-10 w-full rounded-md border border-gray-300 bg-gray-50 pl-9 pr-8 text-sm cursor-pointer focus:border-primary focus:outline-none"
              />
              <button 
                v-if="localFilters.dateRange" 
                @click.stop="localFilters.dateRange = null" 
                class="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </template>
        </DatePicker>
      </div>
    </div>
  </div>
</template>