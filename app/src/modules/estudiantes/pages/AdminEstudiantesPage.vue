<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Download, Upload, Plus, Loader2, AlertCircle, X } from 'lucide-vue-next'
import { estudiantesService } from '@/modules/estudiantes/services/estudiantes.service'
import { useEstudiantesStore } from '@/modules/estudiantes/stores/estudiantes.store'
import { useInscripcionStore } from '@/modules/inscripcion/stores/inscripcion.store'
import type { EstudianteDTO, EstudianteFilters } from '@/modules/estudiantes/types/estudiantes.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import EstudiantesFilters from '@/modules/estudiantes/components/EstudiantesFilters.vue'
import EstudiantesTable from '@/modules/estudiantes/components/EstudiantesTable.vue'
import EstudianteCreateDrawer from '@/modules/estudiantes/components/EstudianteCreateDrawer.vue'
import EstudianteManageDrawer from '@/modules/estudiantes/components/EstudianteManageDrawer.vue'

const estudiantesStore = useEstudiantesStore()
const inscripcionStore = useInscripcionStore()

const estudiantes = ref<EstudianteDTO[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isExporting = ref(false)
const errorMessage = ref('')

const currentPage = ref(1)
const totalItems = ref(0)
const hasMorePages = ref(true)
const limitPerPage = 15

const isExportMode = ref(false)
const selectedIds = ref<number[]>([])

const isCreateDrawerOpen = ref(false)
const isManageDrawerOpen = ref(false)
const selectedStudentId = ref<number | null>(null)

let debounceTimeout: any = null

const handleFilterChange = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    fetchEstudiantes(1, false)
  }, 350)
}

const fetchEstudiantes = async (page: number, append = false) => {
  if (page === 1) {
    isLoading.value = true
    errorMessage.value = ''
  } else {
    isLoadingMore.value = true
  }

  try {
    const apiFilters: EstudianteFilters = {
      page,
      limit: limitPerPage,
      ...estudiantesStore.getCleanFilters
    }

    const response = await estudiantesService.listarEstudiantes(apiFilters)
    const fetchedItems = response.data.items || []
    const meta = response.data.meta

    if (append) {
      estudiantes.value = [...estudiantes.value, ...fetchedItems]
    } else {
      estudiantes.value = fetchedItems
      if (isExportMode.value) {
        selectedIds.value = []
      }
    }

    totalItems.value = meta.total || estudiantes.value.length
    currentPage.value = page
    hasMorePages.value = fetchedItems.length === limitPerPage && estudiantes.value.length < totalItems.value

  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Error al cargar los estudiantes de la plataforma.'
    hasMorePages.value = false
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = () => {
  fetchEstudiantes(currentPage.value + 1, true)
}

const toggleExportMode = () => {
  isExportMode.value = true
  selectedIds.value = []
}

const cancelExportMode = () => {
  isExportMode.value = false
  selectedIds.value = []
}

const handleExport = async (format: 'csv' | 'pdf') => {
  if (selectedIds.value.length === 0) return
  isExporting.value = true
  try {
    const payload = { ids: selectedIds.value }
    let response: any
    
    if (format === 'csv') {
      response = await estudiantesService.exportarCsv(payload, { responseType: 'blob' })
    } else {
      response = await estudiantesService.exportarPdf(payload, { responseType: 'blob' })
    }

    const blob = new Blob([response], { type: format === 'csv' ? 'text/csv' : 'application/pdf' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `reporte_estudiantes_${Date.now()}.${format}`
    link.click()
    window.URL.revokeObjectURL(link.href)
    
    cancelExportMode()
  } catch (err) {
    errorMessage.value = 'Ocurrió un error al intentar exportar los registros seleccionados.'
  } finally {
    isExporting.value = false
  }
}

const openCreateDrawer = () => {
  isCreateDrawerOpen.value = true
}

const openManageDrawer = (idEstudiante: number) => {
  selectedStudentId.value = idEstudiante
  isManageDrawerOpen.value = true
}

const handleToggleStatus = async (estudiante: EstudianteDTO) => {
  try {
    const nuevoEstado = estudiante.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    await estudiantesService.cambiarEstadoEstudiante(estudiante.id_estudiante, { estado: nuevoEstado })
    estudiante.estado = nuevoEstado
  } catch (err) {
    errorMessage.value = 'No se pudo actualizar el estado del estudiante.'
  }
}

onMounted(async () => {
  await inscripcionStore.loadColegios()
  fetchEstudiantes(1, false)
})
</script>

<template>
  <div class="space-y-6 relative overflow-hidden">
    
    <div v-if="errorMessage" class="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      <AlertCircle class="h-5 w-5 shrink-0" />
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="ml-auto font-bold hover:underline">Cerrar</button>
    </div>

    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-text-main">Directorio de Estudiantes</h1>
        <p class="mt-1 text-sm text-text-muted">Gestiona estudiantes inscritos en la plataforma.</p>
      </div>
      <div class="flex flex-wrap w-full gap-2 sm:w-auto">
        <Button @click="openCreateDrawer" class="h-auto flex-1 px-4 py-2.5 sm:flex-none flex items-center justify-center gap-2">
          <Plus class="h-4 w-4" />
          Registrar Estudiante
        </Button>
        
        <template v-if="!isExportMode">
          <Button variant="outline" @click="toggleExportMode" class="h-auto flex-1 px-4 py-2.5 sm:flex-none flex items-center justify-center gap-2 border-gray-300">
            <Upload class="h-4 w-4" />
            EXPORTAR
          </Button>
        </template>
        <template v-else>
          <Button @click="handleExport('csv')" :disabled="selectedIds.length === 0 || isExporting" class="bg-green-600 hover:bg-green-700 text-white h-auto px-4 py-2.5 flex items-center gap-2 shadow-sm border-transparent disabled:opacity-50">
            <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin" />
            <Download v-else class="h-4 w-4" />
            CSV ({{ selectedIds.length }})
          </Button>
          <Button @click="handleExport('pdf')" :disabled="selectedIds.length === 0 || isExporting" class="bg-red-600 hover:bg-red-700 text-white h-auto px-4 py-2.5 flex items-center gap-2 shadow-sm border-transparent disabled:opacity-50">
            <Loader2 v-if="isExporting" class="h-4 w-4 animate-spin" />
            <Download v-else class="h-4 w-4" />
            PDF ({{ selectedIds.length }})
          </Button>
          <Button variant="outline" @click="cancelExportMode" class="h-auto px-3 py-2.5 flex items-center gap-1 border-gray-300">
            <X class="h-4 w-4" /> Cancelar
          </Button>
        </template>
      </div>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white">
      <CardContent class="p-0">
        
        <EstudiantesFilters @filter-change="handleFilterChange" />

        <EstudiantesTable 
          :estudiantes="estudiantes"
          :isExportMode="isExportMode"
          v-model:selectedIds="selectedIds"
          :isLoading="isLoading"
          :isLoadingMore="isLoadingMore"
          :totalItems="totalItems"
          :hasMorePages="hasMorePages"
          @load-more="loadMore"
          @manage="openManageDrawer"
          @toggle-status="handleToggleStatus"
        />

      </CardContent>
    </Card>

    <EstudianteCreateDrawer 
      :open="isCreateDrawerOpen" 
      @close="isCreateDrawerOpen = false" 
      @saved="fetchEstudiantes(1, false)" 
    />

    <EstudianteManageDrawer 
      :open="isManageDrawerOpen" 
      :studentId="selectedStudentId" 
      @close="isManageDrawerOpen = false; selectedStudentId = null" 
      @updated="fetchEstudiantes(currentPage, false)"
      @deleted="fetchEstudiantes(1, false)"
    />

    <div 
      v-if="isCreateDrawerOpen || isManageDrawerOpen" 
      @click="isCreateDrawerOpen = false; isManageDrawerOpen = false; selectedStudentId = null" 
      class="fixed inset-0 z-90 bg-black/40 backdrop-blur-sm transition-opacity" 
    />

    <div v-if="isCreateDrawerOpen || isManageDrawerOpen" @click="isCreateDrawerOpen = false; isManageDrawerOpen = false; selectedStudentId = null" class="fixed inset-0 z-90 bg-black/40 backdrop-blur-sm transition-opacity" />

  </div>
</template>

<style scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>