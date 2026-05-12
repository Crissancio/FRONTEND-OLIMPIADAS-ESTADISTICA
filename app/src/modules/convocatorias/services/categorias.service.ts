import { apiClient } from '@/app/api/api-client'
import type {
  CategoriaCreateDTO,
  CategoriaListResponse,
  CategoriaResponse,
  CategoriaUpdateDTO
} from '@/modules/convocatorias/types/categorias.api'

export const CategoriasService = {
  async list(params?: { page?: number; limit?: number }): Promise<CategoriaListResponse> {
    const { data } = await apiClient.get<CategoriaListResponse>('/categorias', { params })
    return data
  },

  async getById(categoriaId: number): Promise<CategoriaResponse> {
    const { data } = await apiClient.get<CategoriaResponse>(`/categorias/${categoriaId}`)
    return data
  },

  async create(payload: CategoriaCreateDTO): Promise<CategoriaResponse> {
    const { data } = await apiClient.post<CategoriaResponse>('/categorias', payload)
    return data
  },

  async update(categoriaId: number, payload: CategoriaUpdateDTO): Promise<CategoriaResponse> {
    const { data } = await apiClient.put<CategoriaResponse>(`/categorias/${categoriaId}`, payload)
    return data
  },

  async remove(categoriaId: number): Promise<CategoriaResponse> {
    const { data } = await apiClient.delete<CategoriaResponse>(`/categorias/${categoriaId}`)
    return data
  }
}
