import { customInstance } from '@/app/api/mutator';
import type {
  CampaniaFilters,
  PaginatedCampaniaResponse,
  CampaniaCreateDTO,
  CampaniaResponse,
  CampaniaUpdateDTO,
  CampaniaEstadoUpdateDTO
} from '../types/campanias.api';

export const campaniasService = {
  listarCampanias(params?: CampaniaFilters) {
    return customInstance<PaginatedCampaniaResponse>({
      url: '/api/v1/campanias/',
      method: 'GET',
      params
    });
  },

  crearCampania(data: CampaniaCreateDTO) {
    return customInstance<CampaniaResponse>({
      url: '/api/v1/campanias/',
      method: 'POST',
      data
    });
  },

  obtenerCampaniaPorId(id: number) {
    return customInstance<CampaniaResponse>({
      url: `/api/v1/campanias/${id}`,
      method: 'GET'
    });
  },

  actualizarCampania(id: number, data: CampaniaUpdateDTO) {
    return customInstance<CampaniaResponse>({
      url: `/api/v1/campanias/${id}`,
      method: 'PUT',
      data
    });
  },

  eliminarCampania(id: number) {
    return customInstance<unknown>({
      url: `/api/v1/campanias/${id}`,
      method: 'DELETE'
    });
  },

  cambiarEstadoCampania(id: number, data: CampaniaEstadoUpdateDTO) {
    return customInstance<CampaniaResponse>({
      url: `/api/v1/campanias/${id}/estado`,
      method: 'PATCH',
      data
    });
  }
};