import { apiClient } from '@/app/api/api-client'
import type { PaginatedResponse, ResponseBase } from '@/shared/types/api.types'
import type { DirectorResponseDTO, DirectorMinifiedDTO, DirectorUpdateDTO, DirectorCreateDTO } from '../types/directores.api'

export const directoresService = {
  async listar(page: number = 1, limit: number = 10) {
    const params = { page, limit }
    const response = await apiClient.get<PaginatedResponse<DirectorResponseDTO>>('/personas/directores', { params })
    return response.data
  },

  async listarMinificados() {
    const response = await apiClient.get<ResponseBase<DirectorMinifiedDTO[]>>('/personas/directores/lista-corta')
    return response.data
  },

  async obtenerPorId(id: number) {
    const response = await apiClient.get<ResponseBase<DirectorResponseDTO>>(`/personas/directores/${id}`)
    return response.data
  },

  async crear(data: DirectorCreateDTO) {
    const response = await apiClient.post<ResponseBase<DirectorResponseDTO>>('/personas/directores', data)
    return response.data
  },

  async actualizar(id: number, data: DirectorUpdateDTO) {
    const response = await apiClient.put<ResponseBase<DirectorResponseDTO>>(`/personas/directores/${id}`, data)
    return response.data
  },

  async bajaLogica(id: number) {
    const response = await apiClient.patch<ResponseBase<DirectorResponseDTO>>(`/personas/directores/${id}/baja`)
    return response.data
  },

  async eliminarTotal(id: number) {
    const response = await apiClient.delete<ResponseBase<Record<string, never>>>(`/personas/directores/${id}`)
    return response.data
  }
}