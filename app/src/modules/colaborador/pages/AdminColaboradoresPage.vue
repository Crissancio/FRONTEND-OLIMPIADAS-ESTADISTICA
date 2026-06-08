<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Plus, Search, Loader2, AlertTriangle, X } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import ColaboradorCard from '@/modules/colaborador/components/ColaboradorCard.vue'
import ColaboradorCreateDrawer from '@/modules/colaborador/components/ColaboradorCreateDrawer.vue'
import ColaboradorManageDrawer from '@/modules/colaborador/components/ColaboradorManageDrawer.vue'
import { useColaboradoresStore } from '@/modules/personas/stores/colaborador.store'
import { personasService } from '@/modules/personas/services/personas.service'
import type { ColaboradorFilters, TipoColaborador, EstadoPersona } from '@/modules/personas/types/personas.api'

const store = useColaboradoresStore()

const searchTerm = ref('')
const selectedCategory = ref<TipoColaborador | ''>('')
const selectedEstado = ref<EstadoPersona | ''>('')

const isCreateDrawerOpen = ref(false)
const isManageDrawerOpen = ref(false)
const selectedColaboradorId = ref<number | null>(null)

const observerTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const isLoading = ref(false)
let currentPage = 1
const limitPerPage = 12

const errorMessage = ref('')
let errorTimeout: ReturnType<typeof setTimeout>

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)

  const responseData =
    err?.response?.data ??
    err?.data ??
    err?.details ??
    null

  if (responseData) {
    errorMessage.value =
      responseData.error ||
      responseData.message ||
      responseData.detail ||
      fallbackMsg

    clearTimeout(errorTimeout)
    errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
    return
  }

  errorMessage.value =
    err?.message && !err.message.includes('status code')
      ? err.message
      : fallbackMsg

  clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
}

const clearError = () => {
  errorMessage.value = ''
  clearTimeout(errorTimeout)
}

const handleChildError = (err: any) => {
  extractError(err, 'Ocurrió un error en la operación.')
}

const loadData = async (reset = false) => {
  if (reset) currentPage = 1
  if (isLoading.value) return

  isLoading.value = true
  clearError()

  try {
    const filters: ColaboradorFilters = {
      page: currentPage,
      limit: limitPerPage,
      nombre: searchTerm.value.trim() || null,
      tipo: selectedCategory.value || null,
      estado: selectedEstado.value || null
    }

    const res = await personasService.listarColaboradores(filters)

    if (res.success && res.data) {
      if (reset) {
        store.setColaboradores(res.data.items)
      } else {
        store.appendColaboradores(res.data.items)
      }
      store.setMeta(res.data.meta)
    }
  } catch (error) {
    extractError(error, 'Ocurrió un problema al cargar el directorio de colaboradores.')
  } finally {
    isLoading.value = false
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
      if (entries[0].isIntersecting && !isLoading.value) {
        if (currentPage < store.meta.total_pages) {
          currentPage++
          loadData(false)
        }
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
  store.clearStore()
})

const openManageDrawer = (id: number) => {
  selectedColaboradorId.value = id
  isManageDrawerOpen.value = true
}
</script>

<template>
  <div class="space-y-6 relative">
    
    <transition name="toast-slide">
      <div v-if="errorMessage" class="fixed top-6 right-6 z-9999 flex w-full max-w-sm items-start gap-3 rounded-xl bg-red-600 p-4 text-white shadow-2xl">
        <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5 opacity-90" />
        <div class="flex-1">
          <h3 class="text-sm font-bold">Error en la operación</h3>
          <p class="mt-1 text-xs opacity-90">{{ errorMessage }}</p>
        </div>
        <button @click="clearError" class="shrink-0 rounded-md p-1 opacity-70 hover:bg-red-700 hover:opacity-100 transition-colors">
          <X class="h-4 w-4" />
        </button>
      </div>
    </transition>

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
          class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors text-gray-800" 
          placeholder="Buscar por nombre, apellidos..." 
        />
      </div>
      <select v-model="selectedCategory" class="h-11 w-full sm:w-56 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors cursor-pointer text-gray-800">
        <option value="">Todas las categorías</option>
        <option value="PERSONAL ACADEMICO">Personal académico</option>
        <option value="ADMINISTRATIVO">Administrativo</option>
        <option value="COLABORADOR">Colaborador</option>
      </select>
      <select v-model="selectedEstado" class="h-11 w-full sm:w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors cursor-pointer text-gray-800">
        <option value="">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
    </div>

    <div v-if="store.colaboradores.length === 0 && !isLoading" class="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-center">
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
      <Loader2 v-if="isLoading" class="h-6 w-6 animate-spin text-primary" />
    </div>

    <ColaboradorCreateDrawer 
      :is-open="isCreateDrawerOpen" 
      @close="isCreateDrawerOpen = false" 
      @created="loadData(true)" 
      @error="handleChildError"
    />

    <ColaboradorManageDrawer 
      :is-open="isManageDrawerOpen" 
      :colaborador-id="selectedColaboradorId" 
      @close="isManageDrawerOpen = false" 
      @updated="loadData(true)" 
      @error="handleChildError"
    />
  </div>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>