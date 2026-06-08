<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Building, X, Search, Loader2 } from 'lucide-vue-next'
import { useInscripcionStore } from '../stores/inscripcion.store'

const props = defineProps<{
  modelValue: string | number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const inscripcionStore = useInscripcionStore()

const searchQuery = ref('')
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Conectar con la data real de Pinia (que ya tiene los Types inferidos)
const colegios = computed(() => inscripcionStore.colegios)
const isLoading = computed(() => inscripcionStore.isLoadingColegios)

const selectedColegio = computed(() => 
  colegios.value.find(c => c.id_colegio === props.modelValue)
)

const filteredColegios = computed(() => {
  if (!searchQuery.value) return colegios.value
  const query = searchQuery.value.toLowerCase()
  return colegios.value.filter(c => 
    c.nombre.toLowerCase().includes(query) || 
    c.municipio.toLowerCase().includes(query)
  )
})

const selectColegio = (id: number) => {
  emit('update:modelValue', id)
  searchQuery.value = ''
  isOpen.value = false
}

const clearSelection = () => {
  emit('update:modelValue', null)
  searchQuery.value = ''
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  // Disparar la descarga asíncrona de los colegios al montar el componente
  await inscripcionStore.loadColegios()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <label class="block text-sm font-semibold text-text-main mb-1.5">
      <Building class="w-4 h-4 inline mr-1 text-secondary" /> 
      Buscar Colegio
    </label>

    <div v-if="selectedColegio" class="w-full min-h-[44px] rounded-lg bg-success/5 border border-success/30 p-3 text-sm text-text-main shadow-sm flex items-center justify-between">
      <div>
        <span class="font-bold text-success-dark">{{ selectedColegio.nombre }}</span>
        <span class="text-xs text-text-muted ml-2">({{ selectedColegio.turno }} - {{ selectedColegio.municipio }})</span>
      </div>
      <button type="button" @click="clearSelection" class="text-text-muted hover:text-danger transition-colors">
        <X class="w-5 h-5" />
      </button>
    </div>

    <div v-else class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Loader2 v-if="isLoading" class="h-4 w-4 text-primary animate-spin" />
        <Search v-else class="h-4 w-4 text-gray-400" />
      </div>
      <input
        v-model="searchQuery"
        @focus="isOpen = true"
        type="text"
        :disabled="isLoading"
        class="w-full h-11 rounded-lg bg-gray-50 border border-gray-200 pl-10 pr-3 text-sm text-text-main shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-60"
        :placeholder="isLoading ? 'Cargando lista de colegios...' : 'Escribe el nombre del colegio o municipio...'"
      />
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <ul
        v-if="isOpen && !selectedColegio && !isLoading"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1"
      >
        <li v-if="filteredColegios.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
          No se encontraron colegios.
        </li>
        <li
          v-for="col in filteredColegios"
          :key="col.id_colegio"
          @click="selectColegio(col.id_colegio)"
          class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex flex-col sm:flex-row sm:items-baseline gap-1"
        >
          <span class="font-bold text-text-main">{{ col.nombre }}</span>
          <span class="text-xs text-gray-400 font-medium">({{ col.turno }} - {{ col.municipio }})</span>
        </li>
      </ul>
    </transition>
  </div>
</template>