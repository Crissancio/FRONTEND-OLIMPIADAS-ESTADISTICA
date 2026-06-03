import { defineStore } from 'pinia'
import { ref } from 'vue'
import { convocatoriasService } from '../services/convocatorias.service'
import type { ConvocatoriaDTO, ConvocatoriaFilters } from '../types/convocatorias.api'
import type { PaginationMeta } from '@/shared/types/api.types'

export const useConvocatoriasStore = defineStore('convocatorias', () => {
  const convocatorias = ref<ConvocatoriaDTO[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const currentFilters = ref<ConvocatoriaFilters>({
    page: 1,
    limit: 10,
    estado: null,
    estado_temporal: null,
    start_date: null,
    end_date: null
  })

  const fetchConvocatorias = async (filters?: Partial<ConvocatoriaFilters>, loadMore = false) => {
    if (loading.value) return

    loading.value = true
    error.value = null

    if (filters) {
      currentFilters.value = { ...currentFilters.value, ...filters }
    }

    try {
      const response = await convocatoriasService.listarConvocatorias(currentFilters.value)
      
      if (loadMore) {
        convocatorias.value = [...convocatorias.value, ...response.data.items]
      } else {
        convocatorias.value = response.data.items
      }
      
      meta.value = response.data.meta
    } catch (err: any) {
      error.value = err?.message || 'Error al cargar las convocatorias'
    } finally {
      loading.value = false
    }
  }

  const resetStore = () => {
    convocatorias.value = []
    meta.value = null
    error.value = null
    currentFilters.value = {
      page: 1,
      limit: 10,
      estado: null,
      estado_temporal: null,
      start_date: null,
      end_date: null
    }
  }

  return {
    convocatorias,
    meta,
    loading,
    error,
    currentFilters,
    fetchConvocatorias,
    resetStore
  }
})