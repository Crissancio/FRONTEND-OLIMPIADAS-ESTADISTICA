<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Plus, UploadCloud } from 'lucide-vue-next'
import { useColegiosStore } from '../stores/colegio.store'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import ColegiosFiltros from '../components/ColegiosFiltros.vue'
import ColegiosTabla from '../components/ColegiosTabla.vue'
import ColegioDetallePanel from '../components/ColegioDetallePanel.vue'
import type { ColegioResponseDTO, ColegioFilters } from '../types/colegios.api'

const colegiosStore = useColegiosStore()

const listaAcumulada = ref<ColegioResponseDTO[]>([])
const currentFilters = ref<ColegioFilters>({})
const currentPage = ref(1)
const hasMoreData = ref(true)

const scrollSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const isDetallePanelOpen = ref(false)
const selectedColegioId = ref<number | null>(null)

const cargarColegios = async (page: number, resetList = false) => {
  if (colegiosStore.isLoading) return

  await colegiosStore.fetchColegios(page, 15, currentFilters.value)
  
  if (resetList) {
    listaAcumulada.value = colegiosStore.colegios
  } else {
    listaAcumulada.value = [...listaAcumulada.value, ...colegiosStore.colegios]
  }

  if (colegiosStore.meta && page >= colegiosStore.meta.total_pages) {
    hasMoreData.value = false
  } else {
    hasMoreData.value = true
  }
}

const onFiltrosCambian = async (filtros: ColegioFilters) => {
  currentFilters.value = filtros
  currentPage.value = 1
  hasMoreData.value = true
  await cargarColegios(1, true)
}

const setupIntersectionObserver = () => {
  observer = new IntersectionObserver((entries) => {
    const target = entries[0]
    if (target.isIntersecting && hasMoreData.value && !colegiosStore.isLoading) {
      currentPage.value++
      cargarColegios(currentPage.value)
    }
  }, {
    rootMargin: '100px',
  })

  if (scrollSentinel.value) {
    observer.observe(scrollSentinel.value)
  }
}

onMounted(async () => {
  await cargarColegios(1, true)
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const abrirDetalles = (id: number) => {
  selectedColegioId.value = id
  isDetallePanelOpen.value = true
}

const cerrarDetalles = () => {
  isDetallePanelOpen.value = false
  setTimeout(() => {
    selectedColegioId.value = null
  }, 300)
}

const abrirAdminColegio = (id: number) => console.log('Admin colegio:', id)
const abrirAdminDirectores = (id: number) => console.log('Admin directores:', id)
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Directorio de Colegios</h1>
        <p class="mt-1 text-sm text-text-muted">Gestiona, aprueba e importa instituciones educativas.</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" class="h-auto px-4 py-2.5 flex items-center gap-2">
          <UploadCloud class="h-4 w-4" />
          Importar CSV
        </Button>
        <Button variant="accent" class="h-auto px-4 py-2.5 flex items-center gap-2">
          <Plus class="h-4 w-4" />
          Añadir Colegio
        </Button>
      </div>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0 relative">
        <ColegiosFiltros @filter-change="onFiltrosCambian" />
        
        <ColegiosTabla 
          :colegios="listaAcumulada"
          @ver-detalles="abrirDetalles"
          @admin-colegio="abrirAdminColegio"
          @admin-directores="abrirAdminDirectores"
        />

        <div ref="scrollSentinel" class="w-full py-6 flex justify-center items-center">
          <div v-if="colegiosStore.isLoading" class="flex flex-col items-center gap-2">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span class="text-sm text-text-muted">Cargando colegios...</span>
          </div>
          <span v-else-if="!hasMoreData && listaAcumulada.length > 0" class="text-sm text-text-muted">
            Has llegado al final de la lista.
          </span>
          <span v-else-if="listaAcumulada.length === 0 && !colegiosStore.isLoading" class="text-sm text-text-muted">
            No se encontraron resultados.
          </span>
        </div>
      </CardContent>
    </Card>

    <ColegioDetallePanel 
      :is-open="isDetallePanelOpen"
      :colegio-id="selectedColegioId"
      @close="cerrarDetalles"
    />
  </div>
</template>