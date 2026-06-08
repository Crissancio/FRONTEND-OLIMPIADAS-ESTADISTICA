import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdministradorDTO } from '../types/administradores.api'
import type { PaginationMeta } from '@/shared/types/api.types'

export const useAdministradorStore = defineStore('administradores', () => {
  const administradores = ref<AdministradorDTO[]>([])
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1
  })

  const setAdministradores = (items: AdministradorDTO[]) => {
    administradores.value = items
  }

  const appendAdministradores = (items: AdministradorDTO[]) => {
    administradores.value.push(...items)
  }

  const updateAdministrador = (admin: AdministradorDTO) => {
    const index = administradores.value.findIndex(a => a.id_administrador === admin.id_administrador)
    if (index !== -1) {
      administradores.value[index] = admin
    }
  }

  const removeAdministrador = (id: number) => {
    administradores.value = administradores.value.filter(a => a.id_administrador !== id)
  }

  const setMeta = (newMeta: PaginationMeta) => {
    meta.value = newMeta
  }

  const clearStore = () => {
    administradores.value = []
    meta.value = {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 1
    }
  }

  return {
    administradores,
    meta,
    setAdministradores,
    appendAdministradores,
    updateAdministrador,
    removeAdministrador,
    setMeta,
    clearStore
  }
})