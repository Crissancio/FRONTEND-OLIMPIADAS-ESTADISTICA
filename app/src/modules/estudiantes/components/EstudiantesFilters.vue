<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Filter, X, Building, ChevronDown } from 'lucide-vue-next'
import { useEstudiantesStore } from '@/modules/estudiantes/stores/estudiantes.store'
import { useInscripcionStore } from '@/modules/inscripcion/stores/inscripcion.store'
import Button from '@/shared/components/ui/atoms/Button.vue'

const emit = defineEmits<{
  (e: 'filter-change'): void
}>()

const estudiantesStore = useEstudiantesStore()
const inscripcionStore = useInscripcionStore()

const showAdvancedFilters = ref(false)
const colegioSearchText = ref('')
const showColegioDropdown = ref(false)

const triggerChange = () => {
  emit('filter-change')
}

const searchModel = computed({
  get: () => estudiantesStore.filters.search || '',
  set: (val) => { estudiantesStore.filters.search = val; triggerChange() }
})
const estadoModel = computed({
  get: () => estudiantesStore.filters.estado || 'ALL',
  set: (val) => { estudiantesStore.filters.estado = val; triggerChange() }
})
const cursoModel = computed({
  get: () => estudiantesStore.filters.curso || 'ALL',
  set: (val) => { estudiantesStore.filters.curso = val; triggerChange() }
})
const nivelModel = computed({
  get: () => estudiantesStore.filters.nivel || 'ALL',
  set: (val) => { estudiantesStore.filters.nivel = val; triggerChange() }
})
const carnetModel = computed({
  get: () => estudiantesStore.filters.carnet || '',
  set: (val) => { estudiantesStore.filters.carnet = val; triggerChange() }
})
const telefonoModel = computed({
  get: () => estudiantesStore.filters.telefono || '',
  set: (val) => { estudiantesStore.filters.telefono = val; triggerChange() }
})
const rudeModel = computed({
  get: () => estudiantesStore.filters.rude || '',
  set: (val) => { estudiantesStore.filters.rude = val; triggerChange() }
})
const mesNacimientoModel = computed({
  get: () => estudiantesStore.filters.mes_nacimiento || '',
  set: (val) => { estudiantesStore.filters.mes_nacimiento = val ? Number(val) : null; triggerChange() }
})
const anioNacimientoModel = computed({
  get: () => estudiantesStore.filters.anio_nacimiento || '',
  set: (val) => { estudiantesStore.filters.anio_nacimiento = val ? Number(val) : null; triggerChange() }
})

const filteredColegios = computed(() => {
  if (!colegioSearchText.value) return inscripcionStore.colegios.slice(0, 50)
  const search = colegioSearchText.value.toLowerCase()
  return inscripcionStore.colegios.filter(c => c.nombre.toLowerCase().includes(search)).slice(0, 50)
})

const selectColegio = (col: any) => {
  estudiantesStore.filters.id_colegio = col.id_colegio
  colegioSearchText.value = col.nombre
  showColegioDropdown.value = false
  triggerChange()
}

const clearColegio = () => {
  estudiantesStore.filters.id_colegio = null
  colegioSearchText.value = ''
  triggerChange()
}

const hideColegioDropdown = () => {
  setTimeout(() => {
    showColegioDropdown.value = false
  }, 200)
}
</script>

<template>
  <div class="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative w-full sm:w-80">
        <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
        <input v-model="searchModel" class="h-10 w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" placeholder="Buscar por nombre, apellido..." />
      </div>
      
      <div class="relative w-full sm:w-64">
        <Building class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
        <input 
          v-model="colegioSearchText"
          @focus="showColegioDropdown = true"
          @blur="hideColegioDropdown"
          class="h-10 w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors" 
          placeholder="Buscar colegio..." 
        />
        <button v-if="colegioSearchText" @click="clearColegio" class="absolute inset-y-0 right-2 my-auto text-gray-400 hover:text-gray-600">
          <X class="h-4 w-4" />
        </button>
        <div v-if="showColegioDropdown && filteredColegios.length > 0" class="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
          <div v-for="col in filteredColegios" :key="col.id_colegio" @mousedown.prevent="selectColegio(col)" class="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
            <p class="font-medium text-text-main truncate">{{ col.nombre }}</p>
            <p class="text-xs text-text-muted">{{ col.municipio }} - {{ col.turno }}</p>
          </div>
        </div>
      </div>

      <select v-model="estadoModel" class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:w-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors">
        <option value="ALL">Todos los Estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
      
      <Button variant="outline" @click="showAdvancedFilters = !showAdvancedFilters" class="h-10 px-3 flex items-center gap-2 ml-auto">
        <Filter class="h-4 w-4" />
        Filtros Avanzados
        <ChevronDown class="h-4 w-4 transition-transform" :class="{'rotate-180': showAdvancedFilters}" />
      </Button>
    </div>

    <div v-if="showAdvancedFilters" class="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 border-t border-gray-200 animate-fade-in">
      <div>
        <label class="block text-xs font-bold text-text-muted mb-1">Carnet</label>
        <input v-model="carnetModel" class="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Ej: 1234567" />
      </div>
      <div>
        <label class="block text-xs font-bold text-text-muted mb-1">Teléfono</label>
        <input v-model="telefonoModel" class="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Ej: 71234567" />
      </div>
      <div>
        <label class="block text-xs font-bold text-text-muted mb-1">RUDE</label>
        <input v-model="rudeModel" class="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Código RUDE" />
      </div>
      <div>
        <label class="block text-xs font-bold text-text-muted mb-1">Nivel</label>
        <select v-model="nivelModel" class="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <option value="ALL">Ambos niveles</option>
          <option value="SECUNDARIA">Secundaria</option>
          <option value="PRIMARIA">Primaria</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-text-muted mb-1">Curso</label>
        <select v-model="cursoModel" class="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <option value="ALL">Todos los Cursos</option>
          <option value="1">1ro</option><option value="2">2do</option>
          <option value="3">3ro</option><option value="4">4to</option>
          <option value="5">5to</option><option value="6">6to</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs font-bold text-text-muted mb-1">Mes Nac.</label>
          <input v-model="mesNacimientoModel" type="number" min="1" max="12" class="h-9 w-full rounded-md border border-gray-300 px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Mes" />
        </div>
        <div>
          <label class="block text-xs font-bold text-text-muted mb-1">Año Nac.</label>
          <input v-model="anioNacimientoModel" type="number" min="1990" class="h-9 w-full rounded-md border border-gray-300 px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Año" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>