import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ActividadRecienteDTO, EventoProximoDTO } from '../types/sistema.api'
import type { PaginationMeta } from '@/shared/types/api.types'

export const useSistemaStore = defineStore('sistema', () => {
  const actividadesRecientes = ref<ActividadRecienteDTO[]>([])
  const eventosProximos = ref<EventoProximoDTO[]>([])

  const metaActividadReciente = ref<PaginationMeta>({
    page: 1, limit: 10, total: 0, total_pages: 1
  })
  
  const metaEventosProximos = ref<PaginationMeta>({
    page: 1, limit: 10, total: 0, total_pages: 1
  })

  const setActividades = (items: ActividadRecienteDTO[], meta: PaginationMeta) => {
    actividadesRecientes.value = items
    metaActividadReciente.value = meta
  }

  const appendActividades = (items: ActividadRecienteDTO[], meta: PaginationMeta) => {
    actividadesRecientes.value.push(...items)
    metaActividadReciente.value = meta
  }

  const setEventos = (items: EventoProximoDTO[], meta: PaginationMeta) => {
    eventosProximos.value = items
    metaEventosProximos.value = meta
  }

  const appendEventos = (items: EventoProximoDTO[], meta: PaginationMeta) => {
    eventosProximos.value.push(...items)
    metaEventosProximos.value = meta
  }

  const clearStore = () => {
    actividadesRecientes.value = []
    eventosProximos.value = []
    metaActividadReciente.value = { page: 1, limit: 10, total: 0, total_pages: 1 }
    metaEventosProximos.value = { page: 1, limit: 10, total: 0, total_pages: 1 }
  }

  return {
    actividadesRecientes,
    eventosProximos,
    metaActividadReciente,
    metaEventosProximos,
    setActividades,
    appendActividades,
    setEventos,
    appendEventos,
    clearStore
  }
})