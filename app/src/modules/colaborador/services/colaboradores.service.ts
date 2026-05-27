import { apiClient } from '@/app/api/api-client'
import type { PaginatedResponse, ResponseBase } from '@/shared/types/api.types'
import type { 
  ColaboradorResponseDTO, 
  GetColaboradoresParams, 
  ColaboradorPayload 
} from '../types/colaboradores.api'

const BASE_URL = '/personas/colaboradores'

const createFormData = (payload: Partial<ColaboradorPayload>): FormData => {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob)
    }
  })
  return formData
}

export const ColaboradoresService = {
  async listar(params?: GetColaboradoresParams): Promise<PaginatedResponse<ColaboradorResponseDTO>> {
    const { data } = await apiClient.get<PaginatedResponse<ColaboradorResponseDTO>>(BASE_URL, {
      params
    })
    return data
  },

  async obtener(id: number): Promise<ResponseBase<ColaboradorResponseDTO>> {
    const { data } = await apiClient.get<ResponseBase<ColaboradorResponseDTO>>(`${BASE_URL}/${id}`)
    return data
  },

  async crear(payload: ColaboradorPayload): Promise<ResponseBase<ColaboradorResponseDTO>> {
    const formData = createFormData(payload)
    const { data } = await apiClient.post<ResponseBase<ColaboradorResponseDTO>>(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  },

  async actualizar(id: number, payload: Partial<ColaboradorPayload>): Promise<ResponseBase<ColaboradorResponseDTO>> {
    const formData = createFormData(payload)
    const { data } = await apiClient.put<ResponseBase<ColaboradorResponseDTO>>(`${BASE_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  },

  async eliminar(id: number): Promise<ResponseBase<Record<string, never>>> {
    const { data } = await apiClient.delete<ResponseBase<Record<string, never>>>(`${BASE_URL}/${id}`)
    return data
  },

  async darBaja(id: number): Promise<ResponseBase<Record<string, never>>> {
    const { data } = await apiClient.patch<ResponseBase<Record<string, never>>>(`${BASE_URL}/${id}/baja`)
    return data
  },
  async darAlta(id: number): Promise<ResponseBase<Record<string, never>>> {
    const { data } = await apiClient.patch<ResponseBase<Record<string, never>>>(`${BASE_URL}/${id}/alta`)
    return data
  }
}