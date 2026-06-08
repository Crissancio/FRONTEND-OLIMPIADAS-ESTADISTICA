import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ColaboradorDTO } from '@/modules/personas/types/personas.api'
import type { PaginationMeta } from '@/shared/types/api.types'

export const useColaboradoresStore = defineStore('colaboradores', () => {
  const colaboradores = ref<ColaboradorDTO[]>([])
  const meta = ref<PaginationMeta>({
    total: 0,
    total_pages: 1,
    page: 1,
    limit: 12
  })

  const setColaboradores = (items: ColaboradorDTO[]) => {
    colaboradores.value = items
  }

  const appendColaboradores = (items: ColaboradorDTO[]) => {
    colaboradores.value.push(...items)
  }

  const setMeta = (newMeta: PaginationMeta) => {
    meta.value = newMeta
  }

  const clearStore = () => {
    colaboradores.value = []
    meta.value = {
      total: 0,
      total_pages: 1,
      page: 1,
      limit: 12
    }
  }

  return {
    colaboradores,
    meta,
    setColaboradores,
    appendColaboradores,
    setMeta,
    clearStore
  }
})