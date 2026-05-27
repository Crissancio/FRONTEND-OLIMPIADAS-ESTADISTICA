<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Plus, Search, Loader2 } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import ColaboradorCard from '@/modules/colaborador/components/ColaboradorCard.vue'
import ColaboradorCreateDrawer from '@/modules/colaborador/components/ColaboradorCreateDrawer.vue'
import ColaboradorManageDrawer from '@/modules/colaborador/components/ColaboradorManageDrawer.vue'
import { useColaboradoresStore } from '@/modules/colaborador/stores/colaboradores.store'

const store = useColaboradoresStore()

const searchTerm = ref('')
const selectedCategory = ref('')
const selectedEstado = ref('') // Nueva variable para el estado
const isCreateDrawerOpen = ref(false)
const isManageDrawerOpen = ref(false)
const selectedColaboradorId = ref<number | null>(null)

const observerTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
const currentPage = ref(1)
const hasMoreData = ref(true)

const loadData = async (reset = false) => {
  if (reset) {
    currentPage.value = 1
    hasMoreData.value = true
    store.colaboradores = []
  }

  if (!hasMoreData.value || store.isLoading) return

  await store.fetchColaboradores({
    page: currentPage.value,
    limit: 12,
    nombre: searchTerm.value || null,
    tipo: selectedCategory.value || null,
    estado: selectedEstado.value || null // Se envía el estado a la petición
  })

  if (store.meta && currentPage.value >= store.meta.total_pages) {
    hasMoreData.value = false
  } else {
    currentPage.value++
  }
}

let timeoutId: ReturnType<typeof setTimeout>
watch([searchTerm, selectedCategory, selectedEstado], () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => loadData(true), 500)
})

const setupObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMoreData.value && !store.isLoading) {
        loadData()
      }
    },
    { rootMargin: '100px' }
  )
  if (observerTarget.value) observer.observe(observerTarget.value)
}

onMounted(() => {
  loadData(true)
  setupObserver()
})

onUnmounted(() => {
  if (observer && observerTarget.value) observer.unobserve(observerTarget.value)
})

const openManageDrawer = (id: number) => {
  selectedColaboradorId.value = id
  isManageDrawerOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Comité y Colaboradores</h1>
        <p class="mt-1 text-sm text-text-muted">Gestiona el directorio mostrado en "Acerca de".</p>
      </div>
      <Button variant="accent" class="h-auto px-4 py-2.5 flex items-center gap-2 shadow-sm" @click="isCreateDrawerOpen = true">
        <Plus class="h-4 w-4" />Añadir Miembro
      </Button>
    </div>

    <div class="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100 sm:flex-row">
      <div class="relative w-full flex-1">
        <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
        <input 
          v-model="searchTerm" 
          class="input-base w-full pl-9" 
          placeholder="Buscar por nombre, apellidos..." 
        />
      </div>
      <select v-model="selectedCategory" class="input-base sm:w-56 cursor-pointer">
        <option value="">Todas las categorías</option>
        <option value="PERSONAL ACADEMICO">Personal académico</option>
        <option value="ADMINISTRATIVO">Administrativo</option>
        <option value="COLABORADOR">Colaborador</option>
      </select>
      <select v-model="selectedEstado" class="input-base sm:w-48 cursor-pointer">
        <option value="">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
    </div>

    <div v-if="store.colaboradores.length === 0 && !store.isLoading" class="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-center">
      <p class="text-lg font-medium text-text-main">No se encontraron resultados</p>
      <p class="text-sm text-text-muted mt-1">Prueba con otros términos de búsqueda o añade un nuevo miembro.</p>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ColaboradorCard 
        v-for="col in store.colaboradores" 
        :key="col.id_colaborador" 
        :colaborador="col" 
        @click="openManageDrawer"
      />
    </div>

    <div ref="observerTarget" class="flex h-20 w-full items-center justify-center">
      <Loader2 v-if="store.isLoading" class="h-6 w-6 animate-spin text-primary" />
    </div>

    <ColaboradorCreateDrawer 
      :is-open="isCreateDrawerOpen" 
      @close="isCreateDrawerOpen = false" 
      @created="loadData(true)" 
    />

    <ColaboradorManageDrawer 
      :is-open="isManageDrawerOpen" 
      :colaborador-id="selectedColaboradorId" 
      @close="isManageDrawerOpen = false" 
      @updated="loadData(true)" 
    />
  </div>
</template>