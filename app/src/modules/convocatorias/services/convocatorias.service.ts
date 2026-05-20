import { apiClient } from '@/app/api/api-client'
import type {
  ConvocatoriaCreateDTO,
  ConvocatoriaResponseDTO,
  ConvocatoriaUpdateDTO,
  PaginatedResponse,
  ResponseBase
} from '@/modules/convocatorias/types/convocatorias.api'

export const ConvocatoriasService = {
  async list(params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<ConvocatoriaResponseDTO>> {
    const { data } = await apiClient.get<PaginatedResponse<ConvocatoriaResponseDTO>>('/convocatorias', {
      params
    })
    return data
  },

  async getById(convocatoria_id: number): Promise<ResponseBase<ConvocatoriaResponseDTO>> {
    const { data } = await apiClient.get<ResponseBase<ConvocatoriaResponseDTO>>(
      `/convocatorias/${convocatoria_id}`
    )
    return data
  },

  async create(payload: ConvocatoriaCreateDTO): Promise<ResponseBase<ConvocatoriaResponseDTO>> {
    const { data } = await apiClient.post<ResponseBase<ConvocatoriaResponseDTO>>('/convocatorias', payload)
    return data
  },

  async update(
    convocatoria_id: number,
    payload: ConvocatoriaUpdateDTO
  ): Promise<ResponseBase<ConvocatoriaResponseDTO>> {
    const { data } = await apiClient.put<ResponseBase<ConvocatoriaResponseDTO>>(
      `/convocatorias/${convocatoria_id}`,
      payload
    )
    return data
  },

  async remove(convocatoria_id: number): Promise<ResponseBase<ConvocatoriaResponseDTO>> {
    const { data } = await apiClient.delete<ResponseBase<ConvocatoriaResponseDTO>>(
      `/convocatorias/${convocatoria_id}`
    )
    return data
  },

  async publish(convocatoria_id: number): Promise<ResponseBase<ConvocatoriaResponseDTO>> {
    const { data } = await apiClient.post<ResponseBase<ConvocatoriaResponseDTO>>(
      `/convocatorias/${convocatoria_id}/publicar`
    )
    return data
  }
}
