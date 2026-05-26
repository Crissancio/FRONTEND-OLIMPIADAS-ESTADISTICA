import { defineStore } from 'pinia'
import { ref } from 'vue'
import { directoresService } from '../services/directores.service'
import type { DirectorResponseDTO, DirectorMinifiedDTO, DirectorUpdateDTO, DirectorCreateDTO } from '../types/directores.api'
import type { PaginationMeta } from '@/shared/types/api.types'
import { toApiError } from '@/app/api/api-error'

export const useDirectoresStore = defineStore('directores', () => {
  const directores = ref<DirectorResponseDTO[]>([])
  const directoresMinificados = ref<DirectorMinifiedDTO[]>([])
  const directorActual = ref<DirectorResponseDTO | null>(null)
  const meta = ref<PaginationMeta | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDirectores(page: number = 1, limit: number = 10) {
    isLoading.value = true
    error.value = null
    try {
      const response = await directoresService.listar(page, limit)
      directores.value = response.data.items
      meta.value = response.data.meta
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDirectoresMinificados() {
    isLoading.value = true
    error.value = null
    try {
      const response = await directoresService.listarMinificados()
      directoresMinificados.value = response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDirectorById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await directoresService.obtenerPorId(id)
      directorActual.value = response.data
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createDirector(data: DirectorCreateDTO) {
    isLoading.value = true
    error.value = null
    try {
      const response = await directoresService.crear(data)
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateDirector(id: number, data: DirectorUpdateDTO) {
    isLoading.value = true
    error.value = null
    try {
      const response = await directoresService.actualizar(id, data)
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function disableDirector(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await directoresService.bajaLogica(id)
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteDirector(id: number) {
    isLoading.value = true
    error.value = null
    try {
      await directoresService.eliminarTotal(id)
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    directores,
    directoresMinificados,
    directorActual,
    meta,
    isLoading,
    error,
    fetchDirectores,
    fetchDirectoresMinificados,
    fetchDirectorById,
    createDirector,
    updateDirector,
    disableDirector,
    deleteDirector
  }
})