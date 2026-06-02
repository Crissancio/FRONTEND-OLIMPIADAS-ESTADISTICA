import { customInstance } from '@/app/api/mutator';
import type {
  CategoriaFilters,
  PaginatedCategoriaResponse,
  CategoriaCreateDTO,
  CategoriaResponse,
  CategoriaUpdateDTO,
  CategoriaEstadoUpdateDTO
} from '../types/categorias.api';

export const categoriasService = {
  listarCategorias(params?: CategoriaFilters) {
    return customInstance<PaginatedCategoriaResponse>({
      url: '/api/v1/categorias',
      method: 'GET',
      params
    });
  },

  crearCategoria(data: CategoriaCreateDTO) {
    return customInstance<CategoriaResponse>({
      url: '/api/v1/categorias',
      method: 'POST',
      data
    });
  },

  listarCategoriasPorConvocatoria(convocatoriaId: number, params?: CategoriaFilters) {
    return customInstance<PaginatedCategoriaResponse>({
      url: `/api/v1/categorias/convocatoria/${convocatoriaId}`,
      method: 'GET',
      params
    });
  },

  obtenerCategoriaPorId(categoriaId: number) {
    return customInstance<CategoriaResponse>({
      url: `/api/v1/categorias/${categoriaId}`,
      method: 'GET'
    });
  },

  actualizarCategoria(categoriaId: number, data: CategoriaUpdateDTO) {
    return customInstance<CategoriaResponse>({
      url: `/api/v1/categorias/${categoriaId}`,
      method: 'PUT',
      data
    });
  },

  eliminarCategoriaFisica(categoriaId: number) {
    return customInstance<CategoriaResponse>({
      url: `/api/v1/categorias/${categoriaId}`,
      method: 'DELETE'
    });
  },

  cambiarEstadoCategoria(categoriaId: number, data: CategoriaEstadoUpdateDTO) {
    return customInstance<CategoriaResponse>({
      url: `/api/v1/categorias/${categoriaId}/estado`,
      method: 'PATCH',
      data
    });
  }
};