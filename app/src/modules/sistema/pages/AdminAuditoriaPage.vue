<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, X } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import AuditoriaFilters from '../components/AuditoriaFilters.vue'
import AuditoriaTable from '../components/AuditoriaTable.vue'
import AuditoriaDetailDrawer from '../components/AuditoriaDetailDrawer.vue'
import { sistemaService } from '../services/sistema.service'
import { useAuditoriaStore } from '../stores/auditoria.store'
import type { AuditoriaDTO } from '../types/sistema.api'

const store = useAuditoriaStore()

const isLoading = ref(false)
const isExporting = ref(false)
let currentPage = 1
const limitPerPage = 50
const hasMoreData = ref(true)

const observerTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const selectedLog = ref<AuditoriaDTO | null>(null)
const isDrawerOpen = ref(false)

const currentFilters = ref<Record<string, any>>({})

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

const loadData = async (reset = false) => {
  if (reset) {
    currentPage = 1
    hasMoreData.value = true
    store.clearStore()
  }

  if (!hasMoreData.value || isLoading.value) return

  isLoading.value = true
  clearError()

  try {
    const payload = {
      page: currentPage,
      limit: limitPerPage,
      ...currentFilters.value
    }
    
    const res = await sistemaService.listarAuditoria(payload)

    if (res.success && res.data) {
      if (reset) store.setLogs(res.data.items)
      else store.appendLogs(res.data.items)
      
      store.setMeta(res.data.meta)
      
      if (currentPage >= res.data.meta.total_pages) {
        hasMoreData.value = false
      } else {
        currentPage++
      }
    }
  } catch (error) {
    extractError(error, 'Error al cargar los registros de auditoría.')
  } finally {
    isLoading.value = false
  }
}

const handleFilterChange = (filters: any) => {
  currentFilters.value = filters
  loadData(true)
}

const handleExport = async (dates: { start: string, end: string }) => {
  isExporting.value = true
  clearError()
  try {
    const blob = await sistemaService.exportarAuditoriaCsv({
      fecha_start: dates.start,
      fecha_end: dates.end
    })
    
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `auditoria_${dates.start.split('T')[0]}_al_${dates.end.split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

  } catch (error) {
    extractError(error, 'Ocurrió un problema al exportar el archivo CSV.')
  } finally {
    isExporting.value = false
  }
}

const openDetail = (log: AuditoriaDTO) => {
  selectedLog.value = log
  isDrawerOpen.value = true
}

const setupObserver = () => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading.value && hasMoreData.value) {
      loadData(false)
    }
  }, { rootMargin: '100px' })
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

    <div>
      <h1 class="font-heading text-2xl font-bold text-gray-900 tracking-tight">Auditoría de Sistema</h1>
      <p class="mt-1 text-sm text-gray-500 font-medium">Registro inmutable de acciones críticas realizadas por los administradores en la plataforma.</p>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-sm bg-white rounded-xl">
      <CardContent class="p-0">
        
        <AuditoriaFilters 
          :total="store.meta.total"
          :isExporting="isExporting"
          @filterChange="handleFilterChange"
          @export="handleExport"
        />

        <AuditoriaTable 
          :logs="store.logs"
          :isLoading="isLoading"
          @view="openDetail"
        />

        <div ref="observerTarget" class="h-4 w-full"></div>

      </CardContent>
    </Card>

    <AuditoriaDetailDrawer 
      :isOpen="isDrawerOpen"
      :log="selectedLog"
      @close="isDrawerOpen = false"
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