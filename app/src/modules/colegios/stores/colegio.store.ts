import { defineStore } from 'pinia'
import { ref } from 'vue'
import { colegiosService } from '../services/colegios.service'
import type { 
  ColegioResponseDTO, 
  ColegioDetailResponseDTO, 
  ColegioCreateDTO, 
  ColegioUpdateDTO, 
  ColegioFilters,
  ColegioCSVImportDTO,
  CSVUploadResponseDTO
} from '../types/colegios.api'
import type { PaginationMeta } from '@/shared/types/api.types'
import { toApiError } from '@/app/api/api-error'

export const useColegiosStore = defineStore('colegios', () => {
  const colegios = ref<ColegioResponseDTO[]>([])
  const colegioActual = ref<ColegioDetailResponseDTO | null>(null)
  const meta = ref<PaginationMeta | null>(null)
  const uploadResult = ref<CSVUploadResponseDTO | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchColegios(page: number = 1, limit: number = 10, filters?: ColegioFilters) {
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.listar(page, limit, filters)
      colegios.value = response.data.items
      meta.value = response.data.meta
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchColegioById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.obtenerPorId(id)
      colegioActual.value = response.data
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createColegio(data: ColegioCreateDTO) {
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.crear(data)
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateColegio(id: number, data: ColegioUpdateDTO) {
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.actualizar(id, data)
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function disableColegio(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.bajaLogica(id)
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function enableColegio(id:number){
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.altaLogica(id)
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteColegio(id: number) {
    isLoading.value = true
    error.value = null
    try {
      await colegiosService.eliminarTotal(id)
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function uploadCsv(departamento: string, file: File) {
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.subirCsv(departamento, file)
      uploadResult.value = response.data
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function importCSV(data: ColegioCSVImportDTO[]) {
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.importarCSV(data)
      return response.data
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function downloadCSVErrors(filename: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await colegiosService.descargarErroresCSV(filename)
      return response
    } catch (e) {
      error.value = toApiError(e).message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    colegios,
    colegioActual,
    meta,
    uploadResult,
    isLoading,
    error,
    fetchColegios,
    fetchColegioById,
    createColegio,
    updateColegio,
    disableColegio,
    enableColegio,
    deleteColegio,
    uploadCsv,
    importCSV,
    downloadCSVErrors
  }
})