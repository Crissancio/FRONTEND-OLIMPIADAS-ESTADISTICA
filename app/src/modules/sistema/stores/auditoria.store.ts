import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuditoriaDTO } from '../types/sistema.api'
import type { PaginationMeta } from '@/shared/types/api.types'

export const useAuditoriaStore = defineStore('auditoria', () => {
  const logs = ref<AuditoriaDTO[]>([])
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 1
  })

  const setLogs = (items: AuditoriaDTO[]) => {
    logs.value = items
  }

  const appendLogs = (items: AuditoriaDTO[]) => {
    logs.value.push(...items)
  }

  const setMeta = (newMeta: PaginationMeta) => {
    meta.value = newMeta
  }

  const clearStore = () => {
    logs.value = []
    meta.value = {
      page: 1,
      limit: 50,
      total: 0,
      total_pages: 1
    }
  }

  return {
    logs,
    meta,
    setLogs,
    appendLogs,
    setMeta,
    clearStore
  }
})