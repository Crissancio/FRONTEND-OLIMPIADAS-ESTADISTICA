import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CampaniaDTO, CampaniaFilters } from '@/modules/campanias/types/campanias.api'

export const useCampaniasStore = defineStore('campanias', () => {
  const items = ref<CampaniaDTO[]>([])
  const filtros = ref<CampaniaFilters>({ page: 1, limit: 25 })
  const currentPage = ref(1)
  const totalItems = ref(0)
  const hasMore = ref(true)
  const isLoading = ref(false)

  const setFiltros = (nuevos: Partial<CampaniaFilters>) => {
    filtros.value = { ...filtros.value, ...nuevos, page: 1 }
    items.value = []
    currentPage.value = 1
    hasMore.value = true
  }

  const append = (newItems: CampaniaDTO[], meta: { total: number; page: number }) => {
    items.value.push(...newItems)
    currentPage.value = meta.page
    totalItems.value = meta.total
    hasMore.value = items.value.length < meta.total
  }

  const upsert = (updated: CampaniaDTO) => {
    const idx = items.value.findIndex((c) => c.id_campania_email === updated.id_campania_email)
    if (idx !== -1) items.value[idx] = updated
    else items.value.unshift(updated)
  }

  const remove = (id: number) => {
    items.value = items.value.filter((c) => c.id_campania_email !== id)
    totalItems.value = Math.max(0, totalItems.value - 1)
  }

  const reset = () => {
    items.value = []
    filtros.value = { page: 1, limit: 25 }
    currentPage.value = 1
    totalItems.value = 0
    hasMore.value = true
    isLoading.value = false
  }

  return { items, filtros, currentPage, totalItems, hasMore, isLoading, setFiltros, append, upsert, remove, reset }
})