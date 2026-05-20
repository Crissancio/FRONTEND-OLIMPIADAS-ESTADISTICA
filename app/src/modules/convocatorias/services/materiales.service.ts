import { apiClient } from '@/app/api/api-client'
import type {
  MaterialCreateDTO,
  MaterialListBaseResponse,
  MaterialListResponse,
  MaterialResponse,
  MaterialUpdateDTO
} from '@/modules/convocatorias/types/materiales.api'

const toFormData = (payload: object) => {
  const formData = new FormData()

  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    formData.append(key, value instanceof File ? value : String(value))
  })

  return formData
}

type ConvocatoriaArchivoPayload = FormData

export const MaterialesService = {
  async list(params?: { page?: number; limit?: number }): Promise<MaterialListResponse> {
    const { data } = await apiClient.get<MaterialListResponse>('/materiales', { params })
    return data
  },

  async listAdmin(params?: { page?: number; limit?: number }): Promise<MaterialListResponse> {
    const { data } = await apiClient.get<MaterialListResponse>('/materiales/admin', { params })
    return data
  },

  async listPrincipales(params?: {
    importancia_tipo?: string | null
  }): Promise<MaterialListBaseResponse> {
    const { data } = await apiClient.get<MaterialListBaseResponse>('/materiales/principales', { params })
    return data
  },

  async getById(materialId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.get<MaterialResponse>(`/materiales/${materialId}`)
    return data
  },

  async create(payload: MaterialCreateDTO): Promise<MaterialResponse> {
    const { data } = await apiClient.post<MaterialResponse>('/materiales', toFormData(payload))
    return data
  },

  async update(materialId: number, payload: MaterialUpdateDTO): Promise<MaterialResponse> {
    const { data } = await apiClient.put<MaterialResponse>(`/materiales/${materialId}`, toFormData(payload))
    return data
  },

  async remove(materialId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.delete<MaterialResponse>(`/materiales/${materialId}`)
    return data
  },

  async getAfiche(convocatoriaId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.get<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/afiche`
    )
    return data
  },

  async createAfiche(convocatoriaId: number, payload: ConvocatoriaArchivoPayload): Promise<MaterialResponse> {
    const { data } = await apiClient.post<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/afiche`,
      payload
    )
    return data
  },

  async updateAfiche(convocatoriaId: number, payload: ConvocatoriaArchivoPayload): Promise<MaterialResponse> {
    const { data } = await apiClient.put<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/afiche`,
      payload
    )
    return data
  },

  async getReglamento(convocatoriaId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.get<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/reglamento`
    )
    return data
  },

  async createReglamento(convocatoriaId: number, payload: ConvocatoriaArchivoPayload): Promise<MaterialResponse> {
    const { data } = await apiClient.post<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/reglamento`,
      payload
    )
    return data
  },

  async updateReglamento(convocatoriaId: number, payload: ConvocatoriaArchivoPayload): Promise<MaterialResponse> {
    const { data } = await apiClient.put<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/reglamento`,
      payload
    )
    return data
  },

  async getConvocatoriaPrincipal(convocatoriaId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.get<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/convocatoria`
    )
    return data
  },

  async createConvocatoriaPrincipal(
    convocatoriaId: number,
    payload: ConvocatoriaArchivoPayload
  ): Promise<MaterialResponse> {
    const { data } = await apiClient.post<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/convocatoria`,
      payload
    )
    return data
  },

  async updateConvocatoriaPrincipal(
    convocatoriaId: number,
    payload: ConvocatoriaArchivoPayload
  ): Promise<MaterialResponse> {
    const { data } = await apiClient.put<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/convocatoria`,
      payload
    )
    return data
  },

  async assignAfiche(convocatoriaId: number, materialId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.post<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/afiche/asignar`,
      null,
      { params: { material_id: materialId } }
    )
    return data
  },

  async assignReglamento(convocatoriaId: number, materialId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.post<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/reglamento/asignar`,
      null,
      { params: { material_id: materialId } }
    )
    return data
  },

  async assignConvocatoriaPrincipal(convocatoriaId: number, materialId: number): Promise<MaterialResponse> {
    const { data } = await apiClient.post<MaterialResponse>(
      `/materiales/convocatorias/${convocatoriaId}/convocatoria/asignar`,
      null,
      { params: { material_id: materialId } }
    )
    return data
  }
}
