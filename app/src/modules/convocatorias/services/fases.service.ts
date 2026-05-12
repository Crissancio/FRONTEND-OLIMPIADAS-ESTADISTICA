import { apiClient } from '@/app/api/api-client'
import type {
  FaseCreateDTO,
  FaseListResponse,
  FasePreparacionCreateDTO,
  FasePruebaCreateDTO,
  FaseResponse,
  FaseUpdateDTO
} from '@/modules/convocatorias/types/fases.api'

export const FasesService = {
  async list(params?: { page?: number; limit?: number }): Promise<FaseListResponse> {
    const { data } = await apiClient.get<FaseListResponse>('/fases', { params })
    return data
  },

  async getById(faseId: number): Promise<FaseResponse> {
    const { data } = await apiClient.get<FaseResponse>(`/fases/${faseId}`)
    return data
  },

  async create(payload: FaseCreateDTO): Promise<FaseResponse> {
    const { data } = await apiClient.post<FaseResponse>('/fases', payload)
    return data
  },

  async createPreparacion(payload: FasePreparacionCreateDTO): Promise<FaseResponse> {
    const { data } = await apiClient.post<FaseResponse>('/fases/preparacion', payload)
    return data
  },

  async createPrueba(payload: FasePruebaCreateDTO): Promise<FaseResponse> {
    const { data } = await apiClient.post<FaseResponse>('/fases/prueba', payload)
    return data
  },

  async update(faseId: number, payload: FaseUpdateDTO): Promise<FaseResponse> {
    const { data } = await apiClient.put<FaseResponse>(`/fases/${faseId}`, payload)
    return data
  },

  async remove(faseId: number): Promise<FaseResponse> {
    const { data } = await apiClient.delete<FaseResponse>(`/fases/${faseId}`)
    return data
  }
}
