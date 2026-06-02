import { customInstance } from '@/app/api/mutator';
import type {
  FaseFilters,
  PaginatedFaseUnionResponse,
  FaseUnionResponse,
  FasePreparacionCreateDTO,
  FasePreparacionUpdateDTO,
  FasePreparacionResponse,
  FasePruebaCreateDTO,
  FasePruebaUpdateDTO,
  FasePruebaResponse,
  FaseEstadoUpdateDTO,
  ListaFaseMinifiedResponse
} from '../types/fases.api';

export const fasesService = {
  listarFases(params?: FaseFilters) {
    return customInstance<PaginatedFaseUnionResponse>({
      url: '/api/v1/fases',
      method: 'GET',
      params
    });
  },

  listarFasesPorCategoria(categoriaId: number, params?: FaseFilters) {
    return customInstance<PaginatedFaseUnionResponse>({
      url: `/api/v1/fases/categoria/${categoriaId}`,
      method: 'GET',
      params
    });
  },

  listarFasesPruebaMinified(categoriaId: number) {
    return customInstance<ListaFaseMinifiedResponse>({
      url: `/api/v1/fases/prueba/${categoriaId}/minified`,
      method: 'GET'
    });
  },

  obtenerFasePorId(faseId: number) {
    return customInstance<FaseUnionResponse>({
      url: `/api/v1/fases/${faseId}`,
      method: 'GET'
    });
  },

  // ---- CREAR ----
  crearFasePreparacion(data: FasePreparacionCreateDTO) {
    return customInstance<FasePreparacionResponse>({
      url: '/api/v1/fases/preparacion',
      method: 'POST',
      data
    });
  },

  crearFasePrueba(data: FasePruebaCreateDTO) {
    return customInstance<FasePruebaResponse>({
      url: '/api/v1/fases/prueba',
      method: 'POST',
      data
    });
  },

  // ---- ACTUALIZAR ----
  actualizarFasePreparacion(faseId: number, data: FasePreparacionUpdateDTO) {
    return customInstance<FasePreparacionResponse>({
      url: `/api/v1/fases/preparacion/${faseId}`,
      method: 'PUT',
      data
    });
  },

  actualizarFasePrueba(faseId: number, data: FasePruebaUpdateDTO) {
    return customInstance<FasePruebaResponse>({
      url: `/api/v1/fases/prueba/${faseId}`,
      method: 'PUT',
      data
    });
  },

  cambiarEstadoFase(faseId: number, data: FaseEstadoUpdateDTO) {
    return customInstance<FaseUnionResponse>({
      url: `/api/v1/fases/${faseId}/estado`,
      method: 'PATCH',
      data
    });
  },

  // ---- ELIMINAR ----
  eliminarFaseLogica(faseId: number) {
    return customInstance<FaseUnionResponse>({
      url: `/api/v1/fases/${faseId}`,
      method: 'PATCH' // Nota: Tu API usa PATCH para el borrado lógico
    });
  },

  eliminarFaseFisica(faseId: number) {
    return customInstance<unknown>({
      url: `/api/v1/fases/${faseId}`,
      method: 'DELETE'
    });
  }
};