<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { useConvocatoriasStore } from '../../convocatorias/stores/convocatorias.store'
import type { EstadoConvocatoria, EstadoTemporal, ConvocatoriaFilters } from '../../convocatorias/types/convocatorias.api'

// Importación de componentes especializados
import ConvocatoriasFilters from '../components/ConvocatoriasFilters.vue'
import ConvocatoriasTable from '../components/ConvocatoriasTable.vue'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import CreateConvocatoriaDialog from '@/modules/admin/components/CreateConvocatoriaDialog.vue'

const router = useRouter()
const convocatoriasStore = useConvocatoriasStore()

// Estados reactivos locales para los filtros y control de scroll
const isDialogOpen = ref(false)
const searchTerm = ref('')
const estadoFilter = ref<EstadoConvocatoria | 'all'>('all')
const estadoTemporalFilter = ref<EstadoTemporal | 'all'>('all')
const dateRangeFilter = ref<{ start: Date; end: Date } | null>(null)

const currentPage = ref(1)
const isLoadingMore = ref(false)

// Función unificada de llamadas al Store
const syncConvocatorias = async (isScrollLoad = false) => {
  if (isScrollLoad) {
    isLoadingMore.value = true
  }

  const filters: ConvocatoriaFilters = {
    page: currentPage.value,
    limit: 10,
    estado: estadoFilter.value === 'all' ? null : estadoFilter.value,
    estado_temporal: estadoTemporalFilter.value === 'all' ? null : estadoTemporalFilter.value,
    start_date: dateRangeFilter.value?.start ? dateRangeFilter.value.start.toISOString().split('T')[0] : null,
    end_date: dateRangeFilter.value?.end ? dateRangeFilter.value.end.toISOString().split('T')[0] : null
  }

  await convocatoriasStore.fetchConvocatorias(filters)
  isLoadingMore.value = false
}

// Resetea la página a 1 ante cualquier cambio de filtros de Servidor
const handleFilterChange = async () => {
  currentPage.value = 1
  await syncConvocatorias(false)
}

// Resetea todos los controles a su estado inicial limpio
const handleClearFilters = async () => {
  searchTerm.value = ''
  estadoFilter.value = 'all'
  estadoTemporalFilter.value = 'all'
  dateRangeFilter.value = null
  currentPage.value = 1
  await syncConvocatorias(false)
}

// Manejador del trigger de scroll infinito emitido por la tabla
const handleLoadMore = async () => {
  if (isLoadingMore.value || convocatoriasStore.loading) return
  
  const meta = convocatoriasStore.meta
  // Validamos si ya se descargaron todos los ítems existentes según la metadata del API
  if (meta && convocatoriasStore.convocatorias.length >= meta.total) return

  currentPage.value++
  await syncConvocatorias(true)
}

// Redirección a la futura página de administración detallada
const handleManageConvocatoria = (id: number) => {
  router.push(`/admin/convocatoria/${id}/gestionar`)
}

onMounted(async () => {
  currentPage.value = 1
  await syncConvocatorias(false)
})

// Búsqueda en tiempo real local (instantánea sobre el dataset acumulado en el store)
const filteredConvocatorias = computed(() => {
  return convocatoriasStore.convocatorias.filter((conv) => {
    if (!searchTerm.value) return true
    const term = searchTerm.value.toLowerCase()
    return (
      conv.nombre_convocatoria.toLowerCase().includes(term) ||
      String(conv.gestion).includes(term)
    )
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-heading font-bold text-text-main">Convocatorias</h1>
        <p class="text-text-muted text-sm mt-1">Gestiona las olimpiadas, fases y parámetros generales.</p>
      </div>
      <Button 
        @click="isDialogOpen = true"
        variant="accent"
        class="h-auto px-4 py-2.5 flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        Crear Convocatoria
      </Button>
    </div>

    <div v-if="convocatoriasStore.error && currentPage === 1" class="bg-red-50 border border-red-100 text-danger p-4 rounded-xl text-sm">
      Error al sincronizar datos de convocatorias. Por favor, intente de nuevo.
    </div>

    <Card v-else class="rounded-xl border-gray-200 shadow-soft overflow-hidden bg-white">
      <CardContent class="p-0 flex flex-col">
        
        <ConvocatoriasFilters 
          v-model:searchTerm="searchTerm"
          v-model:estado="estadoFilter"
          v-model:estadoTemporal="estadoTemporalFilter"
          v-model:dateRange="dateRangeFilter"
          @filter-change="handleFilterChange"
          @clear-filters="handleClearFilters"
        />

        <ConvocatoriasTable 
          :items="filteredConvocatorias"
          :is-loading="convocatoriasStore.loading && currentPage === 1"
          :is-loading-more="isLoadingMore"
          @manage="handleManageConvocatoria"
          @load-more="handleLoadMore"
        />

        <div class="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-text-muted bg-gray-50/50">
          <span>
            Mostrando {{ filteredConvocatorias.length }} de {{ convocatoriasStore.meta?.total || filteredConvocatorias.length }} convocatorias
          </span>
          <span v-if="convocatoriasStore.loading && currentPage === 1" class="text-xs text-primary animate-pulse font-medium">
            Sincronizando...
          </span>
        </div>
      </CardContent>
    </Card>

    <CreateConvocatoriaDialog v-model:open="isDialogOpen" />
  </div>
</template>