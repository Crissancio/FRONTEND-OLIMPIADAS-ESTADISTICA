<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Loader2 } from 'lucide-vue-next'
import { useConvocatoriasStore } from '../../convocatorias/stores/convocatorias.store'
import type { EstadoConvocatoria, EstadoTemporal, ConvocatoriaFilters } from '../../convocatorias/types/convocatorias.api'

import ConvocatoriasFilters from '@/modules/convocatorias/components/ConvocatoriasFilters.vue'
import ConvocatoriasTable from '@/modules/convocatorias/components/ConvocatoriasTable.vue'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import CreateConvocatoriaDialog from '@/modules/convocatorias/components/CreateConvocatoriaDialog.vue'

const router = useRouter()
const convocatoriasStore = useConvocatoriasStore()

const isDialogOpen = ref(false)
const searchTerm = ref('')
const estadoFilter = ref<EstadoConvocatoria | 'all'>('all')
const estadoTemporalFilter = ref<EstadoTemporal | 'all'>('all')
const dateRangeFilter = ref<{ start: Date; end: Date } | null>(null)

const buildFilters = (): ConvocatoriaFilters => ({
  page: convocatoriasStore.currentFilters.page || 1,
  limit: 10,
  estado: estadoFilter.value === 'all' ? null : estadoFilter.value,
  estado_temporal: estadoTemporalFilter.value === 'all' ? null : estadoTemporalFilter.value,
  start_date: dateRangeFilter.value?.start ? dateRangeFilter.value.start.toISOString().split('T')[0] : null,
  end_date: dateRangeFilter.value?.end ? dateRangeFilter.value.end.toISOString().split('T')[0] : null
})

const handleFilterChange = async () => {
  const filters = buildFilters()
  filters.page = 1 
  await convocatoriasStore.fetchConvocatorias(filters, false)
}

const handleClearFilters = async () => {
  searchTerm.value = ''
  estadoFilter.value = 'all'
  estadoTemporalFilter.value = 'all'
  dateRangeFilter.value = null
  await convocatoriasStore.fetchConvocatorias({ page: 1, limit: 10, estado: null, estado_temporal: null, start_date: null, end_date: null }, false)
}

const handleLoadMore = async () => {
  if (convocatoriasStore.loading) return
  
  const meta = convocatoriasStore.meta
  if (meta && convocatoriasStore.convocatorias.length >= meta.total) return

  const nextPage = (convocatoriasStore.currentFilters.page || 1) + 1
  await convocatoriasStore.fetchConvocatorias({ ...buildFilters(), page: nextPage }, true)
}

const handleManageConvocatoria = (id: number) => {
  router.push(`/admin/convocatoria/${id}/gestionar`)
}

onMounted(async () => {
  if (convocatoriasStore.convocatorias.length === 0) {
    await convocatoriasStore.fetchConvocatorias(buildFilters(), false)
  }
})

onUnmounted(() => {
  if (!router.currentRoute.value.path.includes('/convocatoria')) {
    convocatoriasStore.resetStore()
  }
})

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

    <div v-if="convocatoriasStore.error && !convocatoriasStore.convocatorias.length" class="bg-red-50 border border-red-100 text-danger p-4 rounded-xl text-sm">
      {{ convocatoriasStore.error }}
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
          :is-loading="convocatoriasStore.loading && convocatoriasStore.currentFilters.page === 1"
          :is-loading-more="convocatoriasStore.loading && (convocatoriasStore.currentFilters.page || 1) > 1"
          @manage="handleManageConvocatoria"
          @load-more="handleLoadMore"
        />

        <div class="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-text-muted bg-gray-50/50">
          <span>
            Mostrando {{ filteredConvocatorias.length }} de {{ convocatoriasStore.meta?.total || filteredConvocatorias.length }} convocatorias
          </span>
          <span v-if="convocatoriasStore.loading" class="flex items-center gap-2 text-primary font-medium">
            <Loader2 class="w-4 h-4 animate-spin" />
            Sincronizando...
          </span>
        </div>
      </CardContent>
    </Card>

    <CreateConvocatoriaDialog v-model:open="isDialogOpen" />
  </div>
</template>