<script setup lang="ts">
import { reactive, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import { Search, X } from 'lucide-vue-next'
import 'v-calendar/style.css'

const emit = defineEmits(['filter'])

const localFilters = reactive({
  busqueda: '',
  tipo: '',
  prioridad: '',
  estado: '',
  fecha_publicacion: null as string | null,
  fecha_creacion: null as string | null
})

const tipos = ['CONVOCATORIA', 'INSCRIPCION', 'EXAMEN', 'RESULTADO', 'LOGISTICA', 'MANTENIMIENTO', 'SOPORTE', 'RECLAMO', 'CRONOGRAMA', 'MATERIAL', 'CEREMONIA', 'CAPACITACION', 'GENERAL']

let searchTimeout: ReturnType<typeof setTimeout>

watch(localFilters, (newVals) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    
    // Capturamos la búsqueda general
    const searchVal = newVals.busqueda?.trim() || undefined

    // Mapeamos a la interfaz estricta del backend
    const activeFilters = {
      titulo: searchVal,
      descripcion: searchVal, // Pasamos el mismo parámetro a descripción
      tipo: newVals.tipo || undefined,
      prioridad: newVals.prioridad || undefined,
      estado: newVals.estado || undefined,
      fecha_publicacion: newVals.fecha_publicacion || undefined,
      fecha_creacion: newVals.fecha_creacion || undefined
    }

    // Limpiamos las propiedades undefined para no enviar basura en la URL
    const cleanedFilters = Object.fromEntries(
      Object.entries(activeFilters).filter(([_, v]) => v !== undefined && v !== '')
    )
    
    emit('filter', cleanedFilters)
  }, 300)
}, { deep: true })
</script>

<template>
  <div class="bg-white p-4 rounded-md shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
    
    <div class="lg:col-span-2 relative">
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Buscar por Título / Descripción</label>
      <div class="relative">
        <Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input 
          v-model="localFilters.busqueda" 
          type="text" 
          placeholder="Ej: Mantenimiento programado..." 
          class="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
        />
        <button 
          v-if="localFilters.busqueda" 
          @click="localFilters.busqueda = ''"
          class="absolute right-2 top-2 text-gray-400 hover:text-gray-700 p-0.5"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div>
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo</label>
      <select v-model="localFilters.tipo" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)]">
        <option value="">TODOS</option>
        <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div>
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Prioridad / Estado</label>
      <div class="flex gap-2">
        <select v-model="localFilters.prioridad" class="w-1/2 px-2 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)]">
          <option value="">PRIO.</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>
        <select v-model="localFilters.estado" class="w-1/2 px-2 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)]">
          <option value="">EST.</option>
          <option value="BORRADOR">Borrador</option>
          <option value="PUBLICADO">Público</option>
          <option value="OCULTO">Oculto</option>
        </select>
      </div>
    </div>

    <div>
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Publicación</label>
      <DatePicker v-model.string="localFilters.fecha_publicacion" mode="date" :masks="{ modelValue: 'YYYY-MM-DD' }" :popover="{ visibility: 'click', placement: 'bottom-start' }">
        <template #default="{ inputValue, inputEvents }">
          <div class="relative">
            <input 
              :value="inputValue" 
              v-on="inputEvents" 
              placeholder="Seleccionar" 
              readonly 
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer" 
            />
            <button v-if="localFilters.fecha_publicacion" @click.stop="localFilters.fecha_publicacion = null" class="absolute right-2 top-2 text-gray-400 hover:text-gray-700 bg-gray-50">
              <X class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DatePicker>
    </div>

    <div>
      <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Creación</label>
      <DatePicker v-model.string="localFilters.fecha_creacion" mode="date" :masks="{ modelValue: 'YYYY-MM-DD' }" :popover="{ visibility: 'click', placement: 'bottom-start' }">
        <template #default="{ inputValue, inputEvents }">
          <div class="relative">
            <input 
              :value="inputValue" 
              v-on="inputEvents" 
              placeholder="Seleccionar" 
              readonly 
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer" 
            />
            <button v-if="localFilters.fecha_creacion" @click.stop="localFilters.fecha_creacion = null" class="absolute right-2 top-2 text-gray-400 hover:text-gray-700 bg-gray-50">
              <X class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DatePicker>
    </div>
  </div>
</template>