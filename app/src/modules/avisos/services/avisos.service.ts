import { apiClient } from '@/app/api/api-client'
import { toApiError } from '@/app/api/api-error'
import type { ResponseBase, PaginatedResponse } from '@/shared/types/api.types'
import type { 
  AvisoDTO, 
  AvisoCreateDTO, 
  AvisoUpdateDTO, 
  AvisoEstadoUpdateDTO, 
  AvisoFilters 
} from '../types/avisos.api'
export const avisosService = {
  async obtenerAvisos(page: number, limit: number, filters: AvisoFilters = {}) {
    try {
      const response = await apiClient.get<PaginatedResponse<AvisoDTO>>('/avisos', {
        params: { page, limit, ...filters }
      })
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async obtenerAvisoPorId(id: number) {
    try {
      const response = await apiClient.get<ResponseBase<AvisoDTO>>(`/avisos/${id}`)
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async obtenerAvisosAdmin(page: number, limit: number, filters: AvisoFilters = {}) {
    try {
      const response = await apiClient.get<PaginatedResponse<AvisoDTO>>('/avisos/admin', {
        params: { page, limit, ...filters }
      })
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async obtenerAvisoAdminPorId(id: number) {
    try {
      const response = await apiClient.get<ResponseBase<AvisoDTO>>(`/avisos/admin/${id}`)
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async crearAviso(data: AvisoCreateDTO) {
    try {
      const response = await apiClient.post<ResponseBase<AvisoDTO>>('/avisos', data)
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async actualizarAviso(id: number, data: AvisoUpdateDTO) {
    try {
      const response = await apiClient.put<ResponseBase<AvisoDTO>>(`/avisos/${id}`, data)
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async cambiarEstadoAviso(id: number, data: AvisoEstadoUpdateDTO) {
    try {
      const response = await apiClient.patch<ResponseBase<AvisoDTO>>(`/avisos/${id}/estado`, data)
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async eliminarAviso(id: number) {
    try {
      const response = await apiClient.delete<ResponseBase<AvisoDTO>>(`/avisos/${id}`)
      return response.data
    } catch (error) {
      throw toApiError(error)
    }
  }
}