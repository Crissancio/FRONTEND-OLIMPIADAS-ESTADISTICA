<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { AlertTriangle, X, Loader2 } from 'lucide-vue-next'
import { useSistemaStore } from '@/modules/sistema/stores/sistema.store'
import { sistemaService } from '@/modules/sistema/services/sistema.service'
import type { AdminDashboardDTO } from '@/modules/sistema/types/sistema.api'

import DashboardMetrics from '../components/DashboardMetrics.vue'
import RecentActivityList from '../components/RecentActivityList.vue'
import UpcomingEventsTimeline from '../components/UpcomingEventsTimeline.vue'

const sistemaStore = useSistemaStore()

const dashboardData = ref<AdminDashboardDTO | null>(null)
const isLoadingDashboard = ref(true)

const activityPage = ref(1)
const eventsPage = ref(1)

const loadingMoreActivities = ref(false)
const loadingMoreEvents = ref(false)

const errorMessage = ref('')
let errorTimeout: ReturnType<typeof setTimeout>

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)

  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null

  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    clearTimeout(errorTimeout)
    errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
    return
  }

  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
  clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
}

const clearError = () => {
  errorMessage.value = ''
  clearTimeout(errorTimeout)
}

const loadInitialData = async () => {
  isLoadingDashboard.value = true
  clearError()
  
  try {
    const [dashRes, actRes, evRes] = await Promise.all([
      sistemaService.obtenerDashboardAdmin(),
      sistemaService.obtenerActividadReciente({ page: 1, limit: 10 }),
      sistemaService.obtenerEventosProximos({ page: 1, limit: 10 })
    ])

    if (dashRes.success && dashRes.data) {
      dashboardData.value = dashRes.data
    }
    
    if (actRes.success && actRes.data) {
      sistemaStore.setActividades(actRes.data.items, actRes.data.meta)
    }

    if (evRes.success && evRes.data) {
      sistemaStore.setEventos(evRes.data.items, evRes.data.meta)
    }
  } catch (error) {
    extractError(error, 'Ocurrió un error al cargar la información inicial del dashboard.')
  } finally {
    isLoadingDashboard.value = false
  }
}

const handleLoadMoreActivities = async () => {
  if (loadingMoreActivities.value) return

  const meta = sistemaStore.metaActividadReciente
  if (meta && sistemaStore.actividadesRecientes.length >= meta.total) return

  loadingMoreActivities.value = true
  activityPage.value++
  
  try {
    const res = await sistemaService.obtenerActividadReciente({ 
      page: activityPage.value, 
      limit: 10 
    })
    
    if (res.success && res.data) {
      sistemaStore.appendActividades(res.data.items, res.data.meta)
    }
  } catch (error) {
    extractError(error, 'Error al cargar más actividades recientes.')
    activityPage.value-- 
  } finally {
    loadingMoreActivities.value = false
  }
}

const handleLoadMoreEvents = async () => {
  if (loadingMoreEvents.value) return

  const meta = sistemaStore.metaEventosProximos
  if (meta && sistemaStore.eventosProximos.length >= meta.total) return

  loadingMoreEvents.value = true
  eventsPage.value++

  try {
    const res = await sistemaService.obtenerEventosProximos({ 
      page: eventsPage.value, 
      limit: 10 
    })

    if (res.success && res.data) {
      sistemaStore.appendEventos(res.data.items, res.data.meta)
    }
  } catch (error) {
    extractError(error, 'Error al cargar más eventos próximos.')
    eventsPage.value--
  } finally {
    loadingMoreEvents.value = false
  }
}

onMounted(() => {
  loadInitialData()
})

onUnmounted(() => {
  sistemaStore.clearStore()
})
</script>

<template>
  <div class="space-y-6 relative">
    
    <transition name="toast-slide">
      <div v-if="errorMessage" class="fixed top-6 right-6 z-9999 flex w-full max-w-sm items-start gap-3 rounded-xl bg-red-600 p-4 text-white shadow-2xl">
        <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5 opacity-90" />
        <div class="flex-1">
          <h3 class="text-sm font-bold">Error del Sistema</h3>
          <p class="mt-1 text-xs opacity-90">{{ errorMessage }}</p>
        </div>
        <button @click="clearError" class="shrink-0 rounded-md p-1 opacity-70 hover:bg-red-700 hover:opacity-100 transition-colors">
          <X class="h-4 w-4" />
        </button>
      </div>
    </transition>

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Dashboard General</h1>
        <p class="text-gray-500 text-sm mt-1 font-medium">Panel de control unificado y resumen de estado de las Olimpiadas.</p>
      </div>
    </div>

    <div v-if="isLoadingDashboard" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <Loader2 class="h-8 w-8 animate-spin text-primary mb-3" />
      <span class="text-sm font-medium">Recopilando información del sistema...</span>
    </div>

    <div v-else-if="dashboardData" class="space-y-6">
      <DashboardMetrics :data="dashboardData" />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2">
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