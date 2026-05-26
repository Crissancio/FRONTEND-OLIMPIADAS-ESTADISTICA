import { apiClient } from '@/app/api/api-client'
import type {
  AdministradorCreateDTO,
  AdministradorResponseDTO,
  AdministradorUpdateDTO,
  PaginatedResponse,
  ResponseBase,
} from '@/modules/auth/types/auth.types'

export const AdministradoresService = {
  async list(params?: { page?: number; limit?: number; nombre?: string; correo?: string }): Promise<PaginatedResponse<AdministradorResponseDTO>> {
    const { data } = await apiClient.get<PaginatedResponse<AdministradorResponseDTO>>('/administradores', { params })
    return data
  },

  async getById(id: number): Promise<ResponseBase<AdministradorResponseDTO>> {
    const { data } = await apiClient.get<ResponseBase<AdministradorResponseDTO>>(`/administradores/${id}`)
    return data
  },

  async create(payload: AdministradorCreateDTO): Promise<ResponseBase<AdministradorResponseDTO>> {
    const { data } = await apiClient.post<ResponseBase<AdministradorResponseDTO>>('/administradores', payload)
    return data
  },

  async update(id: number, payload: AdministradorUpdateDTO): Promise<ResponseBase<AdministradorResponseDTO>> {
    const { data } = await apiClient.put<ResponseBase<AdministradorResponseDTO>>(`/administradores/${id}`, payload)
    return data
  },

  async baja(id: number): Promise<ResponseBase<AdministradorResponseDTO>> {
    const { data } = await apiClient.patch<ResponseBase<AdministradorResponseDTO>>(`/administradores/${id}/baja`)
    return data
  },

  async alta(id: number): Promise<ResponseBase<AdministradorResponseDTO>> {
    const { data } = await apiClient.patch<ResponseBase<AdministradorResponseDTO>>(`/administradores/${id}/alta`)
    return data
  },

  async remove(id: number): Promise<ResponseBase<AdministradorResponseDTO>> {
    const { data } = await apiClient.delete<ResponseBase<AdministradorResponseDTO>>(`/administradores/${id}`)
    return data
  },
}
