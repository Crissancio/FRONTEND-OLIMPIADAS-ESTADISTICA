import { apiClient } from '@/app/api/api-client'
import type {
  PublicDetalleResponse,
  PublicFasesResponse,
  PublicInicioResponse,
  PublicMaterialesResponse,
  PublicPersonalResponse,
  TipoColaborador
} from '@/modules/public/types/public.api'

export const PublicService = {
  async getInicio(): Promise<PublicInicioResponse> {
    const { data } = await apiClient.get<PublicInicioResponse>('/public/inicio')
    return data
  },

  async getPersonal(tipo: TipoColaborador): Promise<PublicPersonalResponse> {
    const { data } = await apiClient.get<PublicPersonalResponse>('/public/acerca-de/personal', {
      params: { tipo }
    })
    return data
  },

  async getConvocatoriaDetalle(convocatoriaId: number): Promise<PublicDetalleResponse> {
    const { data } = await apiClient.get<PublicDetalleResponse>(`/public/convocatorias/${convocatoriaId}/detalle`)
    return data
  },

  async getFasesPorCategoria(categoriaId: number): Promise<PublicFasesResponse> {
    const { data } = await apiClient.get<PublicFasesResponse>(`/public/categorias/${categoriaId}/fases`)
    return data
  },

  async getMaterialesPorFase(faseId: number): Promise<PublicMaterialesResponse> {
    const { data } = await apiClient.get<PublicMaterialesResponse>(`/public/fases/${faseId}/materiales`)
    return data
  }
}
