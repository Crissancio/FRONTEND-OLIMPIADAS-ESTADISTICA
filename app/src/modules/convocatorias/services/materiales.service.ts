import { apiClient } from '@/app/api/api-client'
import type {
  MaterialCreateDTO,
  MaterialListResponse,
  MaterialResponse,
  MaterialUpdateDTO
} from '@/modules/convocatorias/types/materiales.api'

const toFormData = (payload: MaterialCreateDTO | MaterialUpdateDTO) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    formData.append(key, value instanceof File ? value : String(value))
  })

  return formData
}

export const MaterialesService = {
  async list(params?: { page?: number; limit?: number }): Promise<MaterialListResponse> {
    const { data } = await apiClient.get<MaterialListResponse>('/materiales', { params })
    return data
  },

  async listAdmin(params?: { page?: number; limit?: number }): Promise<MaterialListResponse> {
    const { data } = await apiClient.get<MaterialListResponse>('/materiales/admin', { params })
    return data
  },

  async getById(materialId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.get<MaterialResponse>(`/materiales/${materialId}`)
    return data
  },

  async create(payload: MaterialCreateDTO): Promise<MaterialResponse> {
    const { data } = await apiClient.post<MaterialResponse>('/materiales', toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  async update(materialId: number, payload: MaterialUpdateDTO): Promise<MaterialResponse> {
    const { data } = await apiClient.put<MaterialResponse>(`/materiales/${materialId}`, toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  async remove(materialId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.delete<MaterialResponse>(`/materiales/${materialId}`)
    return data
  }
}
