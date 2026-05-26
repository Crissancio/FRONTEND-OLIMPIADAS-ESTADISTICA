import { apiClient } from '@/app/api/api-client'
import type {
  AdministradorCreateDTO,
  AdministradorResponse,
  AdministradorUpdateDTO,
  AdministradoresListParams,
  AdministradoresListResponse
} from '../types/administradores.api'

export const AdministradoresService = {
  async list(params: AdministradoresListParams = {}): Promise<AdministradoresListResponse> {
    const { data } = await apiClient.get<AdministradoresListResponse>('/administradores', { params })
    return data
  },

  async getById(administradorId: number): Promise<AdministradorResponse> {
    const { data } = await apiClient.get<AdministradorResponse>(`/administradores/${administradorId}`)
    return data
  },

  async create(payload: AdministradorCreateDTO): Promise<AdministradorResponse> {
    const { data } = await apiClient.post<AdministradorResponse>('/administradores', payload)
    return data
  },

  async update(administradorId: number, payload: AdministradorUpdateDTO): Promise<AdministradorResponse> {
    const { data } = await apiClient.put<AdministradorResponse>(`/administradores/${administradorId}`, payload)
    return data
  },

  async remove(administradorId: number): Promise<AdministradorResponse> {
    const { data } = await apiClient.delete<AdministradorResponse>(`/administradores/${administradorId}`)
    return data
  },

  async baja(administradorId: number): Promise<AdministradorResponse> {
    const { data } = await apiClient.patch<AdministradorResponse>(`/administradores/${administradorId}/baja`)
    return data
  },

  async alta(administradorId: number): Promise<AdministradorResponse> {
    const { data } = await apiClient.patch<AdministradorResponse>(`/administradores/${administradorId}/alta`)
    return data
  }
}
