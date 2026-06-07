import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ResultadoDTO, ResultadoFilters } from '@/modules/resultados/types/resultados.api'

export const useResultadosStore = defineStore('resultados', () => {
  const resultados = ref<ResultadoDTO[]>([])
  const filtros = ref<ResultadoFilters>({
    id_fase_prueba: 0,
    page: 1,
    limit: 30,
    search: null,
    estado_aprobacion: null,
    sort_by: null,
    sort_order: 'asc',
  })
  const currentPage = ref(1)
  const totalItems = ref(0)
  const hasMore = ref(true)

  const setFiltros = (nuevos: Partial<ResultadoFilters>) => {
    filtros.value = { ...filtros.value, ...nuevos, page: 1 }
    resultados.value = []
    currentPage.value = 1
    hasMore.value = true
  }

  const appendResultados = (items: ResultadoDTO[], meta: { total: number; page: number; limit: number }) => {
    resultados.value.push(...items)
    currentPage.value = meta.page
    totalItems.value = meta.total
    hasMore.value = resultados.value.length < meta.total
  }

  const updateResultado = (updated: ResultadoDTO) => {
    const idx = resultados.value.findIndex((r) => r.id_resultado === updated.id_resultado)
    if (idx !== -1) resultados.value[idx] = updated
  }

  const reset = () => {
    resultados.value = []
    filtros.value = {
      id_fase_prueba: 0,
      page: 1,
      limit: 30,
      search: null,
      estado_aprobacion: null,
      sort_by: null,
      sort_order: 'asc',
    }
    currentPage.value = 1
    totalItems.value = 0
    hasMore.value = true
  }

  return {
    resultados,
    filtros,
    currentPage,
    totalItems,
    hasMore,
    setFiltros,
    appendResultados,
    updateResultado,
    reset,
  }
})