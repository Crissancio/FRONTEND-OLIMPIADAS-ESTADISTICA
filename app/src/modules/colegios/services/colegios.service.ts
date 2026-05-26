import { apiClient } from '@/app/api/api-client'
import type { PaginatedResponse, ResponseBase } from '@/shared/types/api.types'
import type {
  ColegioResponseDTO,
  ColegioDetailResponseDTO,
  ColegioCreateDTO,
  ColegioUpdateDTO,
  ColegioFilters,
  CSVUploadResponseDTO,
  CSVImportDBResponseDTO,
  ColegioCSVImportDTO
} from '../types/colegios.api'

export const colegiosService = {
  async listar(page: number = 1, limit: number = 10, filters?: ColegioFilters) {
    const params = { page, limit, ...filters }
    const response = await apiClient.get<PaginatedResponse<ColegioResponseDTO>>('/colegios', { params })
    return response.data
  },

  async obtenerPorId(id: number) {
    const response = await apiClient.get<ResponseBase<ColegioDetailResponseDTO>>(`/colegios/${id}`)
    return response.data
  },

  async crear(data: ColegioCreateDTO) {
    const response = await apiClient.post<ResponseBase<ColegioResponseDTO>>('/colegios', data)
    return response.data
  },

  async actualizar(id: number, data: ColegioUpdateDTO) {
    const response = await apiClient.put<ResponseBase<ColegioResponseDTO>>(`/colegios/${id}`, data)
    return response.data
  },

  async bajaLogica(id: number) {
    const response = await apiClient.patch<ResponseBase<ColegioResponseDTO>>(`/colegios/${id}/baja`)
    return response.data
  },

  async eliminarTotal(id: number) {
    const response = await apiClient.delete<ResponseBase<Record<string, never>>>(`/colegios/${id}`)
    return response.data
  },

  async subirCSV(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ResponseBase<CSVUploadResponseDTO>>('/colegios/subir-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async importarCSV(data: ColegioCSVImportDTO[]) {
    const response = await apiClient.post<ResponseBase<CSVImportDBResponseDTO>>('/colegios/csv', data)
    return response.data
  },

  async descargarErroresCSV(filename: string) {
    const response = await apiClient.get(`/colegios/csv-error/${filename}`, {
      responseType: 'blob'
    })
    return response.data
  }
}