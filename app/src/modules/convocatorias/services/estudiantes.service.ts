import { apiClient } from '@/app/api/api-client'
import type {
  EstudianteCreateDTO,
  EstudianteListResponse,
  EstudianteResponse
} from '@/modules/convocatorias/types/estudiantes.api'

export const EstudiantesService = {
  async list(params?: { page?: number; limit?: number }): Promise<EstudianteListResponse> {
    const { data } = await apiClient.get<EstudianteListResponse>('/personas/estudiantes', { params })
    return data
  },

  async create(payload: EstudianteCreateDTO): Promise<EstudianteResponse> {
    const { data } = await apiClient.post<EstudianteResponse>('/personas/estudiantes', payload)
    return data
  }
}
