<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Mail } from 'lucide-vue-next'
import EmailLogsFiltros from '@/modules/email_logs/components/EmailLogsFiltros.vue'
import EmailLogsTabla from '@/modules/email_logs/components/EmailLogsTabla.vue'
import DrawerEmailLog from '@/modules/email_logs/components/DrawerEmailLog.vue'
import { useEmailLogsStore } from '@/modules/email_logs/stores/email-logs.store'
import { emailLogsService } from '@/modules/email_logs/services/email-logs.service'
import type { EmailLogDTO, EmailLogFilters } from '@/modules/email_logs/types/email-logs.api'

const store = useEmailLogsStore()
const errorMessage = ref('')
const selectedLog = ref<EmailLogDTO | null>(null)
const isDrawerOpen = ref(false)
const isRetryingAll = ref(false)

const extractError = (err: any, fallback: string) => {
  const d = err?.response?.data ?? err?.data ?? err?.details ?? null
  errorMessage.value = d ? (d.error || d.message || d.detail || fallback) : (err?.message && !err.message.includes('status code') ? err.message : fallback)
}

const loadMore = async (reset = false) => {
  if (store.isLoading) return
  if (!store.hasMore && !reset) return
  store.isLoading = true
  try {
    const nextPage = reset ? 1 : store.currentPage + 1
    const res = await emailLogsService.listarLogs({ ...store.filtros, page: nextPage })
    if (reset) {
      store.reset()
      store.filtros.page = 1
    }
    store.append(res.data.items, { total: res.data.meta.total, page: res.data.meta.page })
  } catch (err) {
    extractError(err, 'No se pudieron cargar los logs.')
  } finally {
    store.isLoading = false
  }
}

const onFiltrosChange = (nuevos: Partial<EmailLogFilters>) => {
  store.setFiltros(nuevos)
  loadMore(true)
}

const verLog = (l: EmailLogDTO) => {
  selectedLog.value = l
  isDrawerOpen.value = true
}

const onUpdated = (l: EmailLogDTO) => {
  store.upsert(l)
  selectedLog.value = l
}

const reintentarIndividual = async (l: EmailLogDTO) => {
  try {
    const res = await emailLogsService.reintentarLogIndividual(l.id_email_log)
    store.upsert(res.data)
  } catch (err) {
    extractError(err, 'No se pudo reintentar el envío.')
  }
}

const reintentarTodos = async () => {
  isRetryingAll.value = true
  try {
    await emailLogsService.reintentarTodosLosFallidos()
    await loadMore(true)
  } catch (err) {
    extractError(err, 'No se pudo reintentar todos los fallidos.')
  } finally {
    isRetryingAll.value = false
  }
}

loadMore(true)
onUnmounted(() => store.reset())
</script>

<template>
  <div class="min-h-screen bg-background">
    <div
      v-if="errorMessage"
      class="fixed top-4 right-4 z-100 max-w-sm rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error shadow-soft"
    >
      {{ errorMessage }}
      <button class="ml-3 font-bold hover:opacity-70" @click="errorMessage = ''">✕</button>
    </div>

    <div class="space-y-5 p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="font-heading text-2xl font-bold text-text-main flex items-center gap-2">
            <Mail class="h-7 w-7 text-primary" />
            Registro de Emails
          </h1>
          <p class="mt-1 text-sm text-text-muted">Monitoreo de todos los envíos del sistema.</p>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-center shadow-soft">
          <p class="text-2xl font-bold text-primary">{{ store.totalItems }}</p>
          <p class="text-xs text-text-muted">registros totales</p>
        </div>
      </div>

      <EmailLogsFiltros
        :model-value="store.filtros"
        :is-retrying="isRetryingAll"
        @update:model-value="onFiltrosChange"
        @retry-all="reintentarTodos"
      />

      <EmailLogsTabla
        :items="store.items"
        :is-loading="store.isLoading"
        :has-more="store.hasMore"
        :total-items="store.totalItems"
        @load-more="loadMore(false)"
        @ver="verLog"
        @reintentar="reintentarIndividual"
      />
    </div>

    <DrawerEmailLog
      :open="isDrawerOpen"
      :log="selectedLog"
      @close="isDrawerOpen = false"
      @updated="onUpdated"
      @error="(msg) => { errorMessage = msg }"
    />
  </div>
</template>