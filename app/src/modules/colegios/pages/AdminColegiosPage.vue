<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Plus, UploadCloud } from 'lucide-vue-next'
import { useColegiosStore } from '../../colegios/stores/colegio.store'
import { colegiosService } from '../../colegios/services/colegios.service'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import ColegiosFiltros from '../../colegios/components/ColegiosFiltros.vue'
import ColegiosTabla from '../../colegios/components/ColegiosTabla.vue'
import ColegioDetallePanel from '../../colegios/components/ColegioDetallePanel.vue'
import ColegioFormPanel from '../../colegios/components/ColegioFormPanel.vue'
import ColegioDirectoresPanel from '../../colegios/components/ColegioDirectoresPanel.vue'
import ColegioImportWizardPanel from '../../colegios/components/ColegioImportWizardPanel.vue'
import type {  ColegioFilters } from '../../colegios/types/colegios.api'

const colegiosStore = useColegiosStore()

// Lógica de estados locales para el control del flujo del componente
const isLoading = ref(false)
const currentPage = ref(1)
const hasMoreData = ref(true)

const scrollSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const isDetallePanelOpen = ref(false)
const isFormPanelOpen = ref(false)
const isDirectoresPanelOpen = ref(false)
const isImportWizardOpen = ref(false)
const selectedColegioId = ref<number | null>(null)


const cargarColegios = async (page: number, resetList = false) => {
  if (isLoading.value) return
  console.log("🔥 ESTA ES LA VERSION NUEVA DEL ARCHIVO 🔥");
  isLoading.value = true
  try {
    const params: ColegioFilters = {
      ...colegiosStore.currentFilters,
      page,
      limit: 10
    }

    const response = await colegiosService.listarColegios(params)
    const items = response.data?.items || []
    const meta = response.data?.meta

    if (resetList) {
      colegiosStore.listaAcumulada = items
    } else {
      colegiosStore.listaAcumulada = [...colegiosStore.listaAcumulada, ...items]
    }

    if (meta && page >= meta.total_pages) {
      hasMoreData.value = false
    } else {
      hasMoreData.value = true
    }
  } catch (error) {
    console.error('Error al cargar el directorio de colegios:', error)
    hasMoreData.value = false
  } finally {
    isLoading.value = false
  }
}

const onFiltrosCambian = async (filtros: ColegioFilters) => {
  colegiosStore.currentFilters = filtros
  currentPage.value = 1
  hasMoreData.value = true
  await cargarColegios(1, true)
}

const recargarTrasGuardar = async () => {
  currentPage.value = 1
  hasMoreData.value = true
  await cargarColegios(1, true)
}

const setupIntersectionObserver = () => {
  observer = new IntersectionObserver((entries) => {
    const target = entries[0]
    if (target.isIntersecting && hasMoreData.value && !isLoading.value) {
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
  if (colegiosStore.listaAcumulada.length > 0) {
    currentPage.value = Math.ceil(colegiosStore.listaAcumulada.length / 10)
  } else {
    await cargarColegios(1, true)
  }
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
  setTimeout(() => { selectedColegioId.value = null }, 300)
}

const abrirFormulario = (id: number | null = null) => {
  selectedColegioId.value = id
  isFormPanelOpen.value = true
}

const cerrarFormulario = () => {
  isFormPanelOpen.value = false
  setTimeout(() => { selectedColegioId.value = null }, 300)
}

const abrirAdminDirectores = (id: number) => {
  selectedColegioId.value = id
  isDirectoresPanelOpen.value = true
}

const cerrarAdminDirectores = () => {
  isDirectoresPanelOpen.value = false
  setTimeout(() => { selectedColegioId.value = null }, 300)
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Directorio de Colegios</h1>
        <p class="mt-1 text-sm text-text-muted">Gestiona, aprueba e importa instituciones educativas.</p>
      </div>
      <div class="flex gap-2">
        <Button @click="isImportWizardOpen = true" variant="outline" class="h-auto px-4 py-2.5 flex items-center gap-2">
          <UploadCloud class="h-4 w-4" />
          Importar CSV
        </Button>
        <Button @click="abrirFormulario()" variant="accent" class="h-auto px-4 py-2.5 flex items-center gap-2">
          <Plus class="h-4 w-4" />
          Añadir Colegio
        </Button>
      </div>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0 relative">
        <ColegiosFiltros @filter-change="onFiltrosCambian" />
        
        <ColegiosTabla 
          :colegios="colegiosStore.listaAcumulada"
          @ver-detalles="abrirDetalles"
          @admin-colegio="abrirFormulario"
          @admin-directores="abrirAdminDirectores"
        />

        <div ref="scrollSentinel" class="w-full py-6 flex justify-center items-center">
          <div v-if="isLoading" class="flex flex-col items-center gap-2">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span class="text-sm text-text-muted">Cargando colegios...</span>
          </div>
          <span v-else-if="!hasMoreData && colegiosStore.listaAcumulada.length > 0" class="text-sm text-text-muted">
            Has llegado al final de la lista.
          </span>
        </div>
      </CardContent>
    </Card>

    <ColegioDetallePanel :is-open="isDetallePanelOpen" :colegio-id="selectedColegioId" @close="cerrarDetalles" />
    <ColegioFormPanel :is-open="isFormPanelOpen" :colegio-id="selectedColegioId" @close="cerrarFormulario" @saved="recargarTrasGuardar" />
    <ColegioDirectoresPanel :is-open="isDirectoresPanelOpen" :colegio-id="selectedColegioId" @close="cerrarAdminDirectores" @updated="recargarTrasGuardar" />
    <ColegioImportWizardPanel :is-open="isImportWizardOpen" @close="isImportWizardOpen = false" @imported="recargarTrasGuardar" />
  </div>
</template>