<script setup lang="ts">
import { reactive, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import { Search } from 'lucide-vue-next'
import 'v-calendar/style.css'

const emit = defineEmits(['filter'])

const localFilters = reactive({
  busqueda: '',
  tipo: '',
  prioridad: '',
  estado: '',
  rango_publicacion: null as any,
  rango_creacion: null as any
})

const tipos = ['CONVOCATORIA', 'INSCRIPCION', 'EXAMEN', 'RESULTADO', 'LOGISTICA', 'MANTENIMIENTO', 'SOPORTE', 'RECLAMO', 'CRONOGRAMA', 'MATERIAL', 'CEREMONIA', 'CAPACITACION', 'GENERAL']

let searchTimeout: ReturnType<typeof setTimeout>

watch(localFilters, (newVals) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const activeFilters = { ...newVals }
    emit('filter', activeFilters)
  }, 300)
}, { deep: true })
</script>

<template>
  <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
    <div class="lg:col-span-2 relative">
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Buscar por Título / Descripción</label>
      <div class="relative">
        <Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input 
          v-model="localFilters.busqueda" 
          type="text" 
          placeholder="Ej: Mantenimiento programado..." 
          class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
        />
      </div>
    </div>

    <div>
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo</label>
      <select v-model="localFilters.tipo" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)]">
        <option value="">Todos</option>
        <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div>
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Prioridad / Estado</label>
      <div class="flex gap-2">
        <select v-model="localFilters.prioridad" class="w-1/2 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)]">
          <option value="">Prio.</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>
        <select v-model="localFilters.estado" class="w-1/2 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)]">
          <option value="">Est.</option>
          <option value="BORRADOR">Borrador</option>
          <option value="PUBLICADO">Público</option>
          <option value="OCULTO">Oculto</option>
        </select>
      </div>
    </div>

    <div>
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rango Publicación</label>
      <DatePicker v-model.range="localFilters.rango_publicacion" mode="date" :popover="{ visibility: 'click', placement: 'bottom-start' }">
        <template #default="{ inputValue, inputEvents }">
          <input :value="inputValue.start ? `${inputValue.start} - ${inputValue.end}` : ''" v-on="inputEvents.start" placeholder="Seleccionar" readonly class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer" />
        </template>
      </DatePicker>
    </div>

    <div>
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rango Creación</label>
      <DatePicker v-model.range="localFilters.rango_creacion" mode="date" :popover="{ visibility: 'click', placement: 'bottom-start' }">
        <template #default="{ inputValue, inputEvents }">
          <input :value="inputValue.start ? `${inputValue.start} - ${inputValue.end}` : ''" v-on="inputEvents.start" placeholder="Seleccionar" readonly class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer" />
        </template>
      </DatePicker>
    </div>
  </div>
</template>