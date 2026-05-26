<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import type { ColegioFilters } from '../types/colegios.api'

const emit = defineEmits<{
  (e: 'filter-change', filters: ColegioFilters): void
}>()

const filters = ref<ColegioFilters>({
  nombre: '',
  municipio: '',
  estado: '',
  tipo: '',
  turno: '',
  director_nombre: ''
})

let timeout: ReturnType<typeof setTimeout>
watch(filters, (newFilters) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== '')
    )
    emit('filter-change', cleanFilters)
  }, 300)
}, { deep: true })
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 border-b border-gray-200 bg-gray-50/50 p-4 rounded-t-xl">
    <div class="relative xl:col-span-2">
      <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
      <input 
        v-model="filters.nombre" 
        class="input-base pl-9 py-2 w-full bg-white" 
        placeholder="Buscar colegio..." 
      />
    </div>

    <input v-model="filters.municipio" class="input-base py-2 bg-white" placeholder="Municipio" />
    <input v-model="filters.director_nombre" class="input-base py-2 bg-white" placeholder="Director" />

    <select v-model="filters.estado" class="input-base py-2 bg-white cursor-pointer">
      <option value="">Todos los Estados</option>
      <option value="REVISADO">Revisado</option>
      <option value="PENDIENTE">Pendiente</option>
      <option value="RECHAZADO">Rechazado</option>
      <option value="INACTIVO">Inactivo</option>
    </select>

    <select v-model="filters.tipo" class="input-base py-2 bg-white cursor-pointer">
      <option value="">Tipo (Todos)</option>
      <option value="PUBLICO">Público</option>
      <option value="PRIVADO">Privado</option>
      <option value="CONVENIO">Convenio</option>
    </select>

    <select v-model="filters.turno" class="input-base py-2 bg-white cursor-pointer">
      <option value="">Turno (Todos)</option>
      <option value="MAÑANA">Mañana</option>
      <option value="TARDE">Tarde</option>
      <option value="NOCHE">Noche</option>
      <option value="MIXTO">Mixto</option>
    </select>
  </div>
</template>