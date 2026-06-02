<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSistemaStore } from '../../sistema/stores/sistema.store'
import DashboardMetrics from '../components/DashboardMetrics.vue'
import RecentActivityList from '../components/RecentActivityList.vue'
import UpcomingEventsTimeline from '../components/UpcomingEventsTimeline.vue'

const sistemaStore = useSistemaStore()

// Estados locales para el control de paginación independiente
const activityPage = ref(1)
const eventsPage = ref(1)

const loadingMoreActivities = ref(false)
const loadingMoreEvents = ref(false)

onMounted(async () => {
  // Inicialización limpia en paralelo con límite estándar (ej. 10 ítems por página)
  await Promise.all([
    sistemaStore.fetchDashboard(),
    sistemaStore.fetchActividadesRecientes({ page: 1, limit: 10 }),
    sistemaStore.fetchEventosProximos({ page: 1, limit: 10 })
  ])
})

// Handler para cargar más Actividades Recientes
const handleLoadMoreActivities = async () => {
  if (loadingMoreActivities.value || sistemaStore.loading) return

  const meta = sistemaStore.metaActividadReciente
  // Validamos si ya cargamos todos los ítems existentes según el DTO Meta
  if (meta && sistemaStore.actividadesRecientes.length >= meta.total) return

  loadingMoreActivities.value = true
  activityPage.value++
  
  await sistemaStore.fetchActividadesRecientes({ 
    page: activityPage.value, 
    limit: 10 
  })
  loadingMoreActivities.value = false
}

// Handler para cargar más Eventos Próximos
const handleLoadMoreEvents = async () => {
  if (loadingMoreEvents.value || sistemaStore.loading) return

  const meta = sistemaStore.metaEventosProximos
  // Validamos si ya cargamos todos los eventos según el DTO Meta
  if (meta && sistemaStore.eventosProximos.length >= meta.total) return

  loadingMoreEvents.value = true
  eventsPage.value++

  await sistemaStore.fetchEventosProximos({ 
    page: eventsPage.value, 
    limit: 10 
  })
  loadingMoreEvents.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-heading font-bold text-text-main">Dashboard General</h1>
        <p class="text-text-muted text-sm mt-1">Bienvenido al panel de administración de las Olimpiadas.</p>
      </div>
    </div>

    <div v-if="sistemaStore.loading && !sistemaStore.dashboard" class="text-center py-12 text-text-muted animate-pulse">
      Cargando información del sistema...
    </div>

    <div v-else-if="sistemaStore.error && !sistemaStore.dashboard" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
      Ocurrió un error al cargar los datos del dashboard. Por favor, intente de nuevo.
    </div>

    <div v-else class="space-y-6">
      <DashboardMetrics :data="sistemaStore.dashboard" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <RecentActivityList 
            :activities="sistemaStore.actividadesRecientes" 
            :is-loading-more="loadingMoreActivities"
            @load-more="handleLoadMoreActivities"
          />
        </div>
        <div>
          <UpcomingEventsTimeline 
            :events="sistemaStore.eventosProximos" 
            :is-loading-more="loadingMoreEvents"
            @load-more="handleLoadMoreEvents"
          />
        </div>
      </div>
    </div>
  </div>
</template>