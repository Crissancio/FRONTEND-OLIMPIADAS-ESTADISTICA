import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AvisoDTO, AvisoFilters } from '../types/avisos.api'
import type { PaginationMeta } from '@/shared/types/api.types'

export const useAvisosStore = defineStore('avisos', () => {
  const avisos = ref<AvisoDTO[]>([])
  const meta = ref<PaginationMeta>({
    total: 0,
    total_pages: 1,
    page: 1,
    limit: 12
  })
  const filters = ref<AvisoFilters>({
    titulo: '',
    descripcion: '',
    tipo: null,
    prioridad: null,
    estado: null,
    fecha_creacion: null,
    fecha_publicacion: null
  })

  const setAvisos = (items: AvisoDTO[]) => {
    avisos.value = items
  }

  const appendAvisos = (items: AvisoDTO[]) => {
    avisos.value.push(...items)
  }

  const setMeta = (newMeta: PaginationMeta) => {
    meta.value = newMeta
  }

  const setFilters = (newFilters: Partial<AvisoFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearStore = () => {
    avisos.value = []
    meta.value = {
      total: 0,
      total_pages: 1,
      page: 1,
      limit: 12
    }
    filters.value = {
      titulo: '',
      descripcion: '',
      tipo: null,
      prioridad: null,
      estado: null,
      fecha_creacion: null,
      fecha_publicacion: null
    }
  }

  return {
    avisos,
    meta,
    filters,
    setAvisos,
    appendAvisos,
    setMeta,
    setFilters,
    clearStore
  }
})