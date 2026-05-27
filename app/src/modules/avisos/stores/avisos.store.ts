import { defineStore } from 'pinia'
import { ref } from 'vue'
import { avisosService } from '../services/avisos.service'
import type { AvisoDTO, AvisoFilters, AvisoCreateDTO, AvisoUpdateDTO } from '../types/avisos.api'
import type { PaginationMeta } from '@/shared/types/api.types'
import type { ApiError } from '@/app/api/api-error'

export const useAvisosStore = defineStore('avisos', () => {
  const avisos = ref<AvisoDTO[]>([])
  const currentAviso = ref<AvisoDTO | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<ApiError | null>(null)
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })

  async function fetchAvisos(page: number = 1, limit: number = 10, filters?: AvisoFilters) {
    loading.value = true
    error.value = null
    try {
      const response = await avisosService.obtenerAvisos(page, limit, filters)
      avisos.value = response.data.items
      meta.value = response.data.meta
    } catch (err) {
      error.value = err as ApiError
    } finally {
      loading.value = false
    }
  }

  async function fetchAvisoById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await avisosService.obtenerAvisoPorId(id)
      currentAviso.value = response.data
    } catch (err) {
      error.value = err as ApiError
    } finally {
      loading.value = false
    }
  }

  async function fetchAvisosAdmin(page: number = 1, limit: number = 10, filters?: AvisoFilters) {
    loading.value = true
    error.value = null
    try {
      const response = await avisosService.obtenerAvisosAdmin(page, limit, filters)
      avisos.value = response.data.items
      meta.value = response.data.meta
    } catch (err) {
      error.value = err as ApiError
    } finally {
      loading.value = false
    }
  }

  async function fetchAvisoAdminById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await avisosService.obtenerAvisoAdminPorId(id)
      currentAviso.value = response.data
    } catch (err) {
      error.value = err as ApiError
    } finally {
      loading.value = false
    }
  }

  async function createAviso(data: AvisoCreateDTO) {
    loading.value = true
    error.value = null
    try {
      const response = await avisosService.crearAviso(data)
      avisos.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAviso(id: number, data: AvisoUpdateDTO) {
    loading.value = true
    error.value = null
    try {
      const response = await avisosService.actualizarAviso(id, data)
      const index = avisos.value.findIndex((a) => a.id_aviso === id)
      if (index !== -1) {
        avisos.value[index] = response.data
      }
      if (currentAviso.value?.id_aviso === id) {
        currentAviso.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleAvisoEstado(id: number, nuevoEstado: 'BORRADOR' | 'PUBLICADO' | 'OCULTO') {
    loading.value = true
    error.value = null
    try {
      const response = await avisosService.cambiarEstadoAviso(id, { estado: nuevoEstado })
      const index = avisos.value.findIndex((a) => a.id_aviso === id)
      if (index !== -1) {
        avisos.value[index] = response.data
      }
      if (currentAviso.value?.id_aviso === id) {
        currentAviso.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeAviso(id: number) {
    loading.value = true
    error.value = null
    try {
      await avisosService.eliminarAviso(id)
      avisos.value = avisos.value.filter((a) => a.id_aviso !== id)
      if (currentAviso.value?.id_aviso === id) {
        currentAviso.value = null
      }
    } catch (err) {
      error.value = err as ApiError
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    avisos,
    currentAviso,
    loading,
    error,
    meta,
    fetchAvisos,
    fetchAvisoById,
    fetchAvisosAdmin,
    fetchAvisoAdminById,
    createAviso,
    updateAviso,
    toggleAvisoEstado,
    removeAviso
  }
})