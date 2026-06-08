import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EmailLogDTO, EmailLogFilters } from '@/modules/email_logs/types/email-logs.api'

export const useEmailLogsStore = defineStore('emailLogs', () => {
  const items = ref<EmailLogDTO[]>([])
  const filtros = ref<EmailLogFilters>({ page: 1, limit: 30 })
  const currentPage = ref(1)
  const totalItems = ref(0)
  const hasMore = ref(true)
  const isLoading = ref(false)

  const setFiltros = (nuevos: Partial<EmailLogFilters>) => {
    filtros.value = { ...filtros.value, ...nuevos, page: 1 }
    items.value = []
    currentPage.value = 1
    hasMore.value = true
  }

  const append = (newItems: EmailLogDTO[], meta: { total: number; page: number }) => {
    items.value.push(...newItems)
    currentPage.value = meta.page
    totalItems.value = meta.total
    hasMore.value = items.value.length < meta.total
  }

  const upsert = (updated: EmailLogDTO) => {
    const idx = items.value.findIndex((l) => l.id_email_log === updated.id_email_log)
    if (idx !== -1) items.value[idx] = updated
  }

  const reset = () => {
    items.value = []
    filtros.value = { page: 1, limit: 30 }
    currentPage.value = 1
    totalItems.value = 0
    hasMore.value = true
    isLoading.value = false
  }

  return { items, filtros, currentPage, totalItems, hasMore, isLoading, setFiltros, append, upsert, reset }
})