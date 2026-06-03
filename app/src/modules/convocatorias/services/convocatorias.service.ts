import { customInstance } from '@/app/api/mutator';
import type {
  ConvocatoriaFilters,
  PaginatedConvocatoriaResponse,
  ConvocatoriaCreateDTO,
  ConvocatoriaResponse,
  ConvocatoriaUpdateDTO,
  BaseDictResponse,
  ConvocatoriaEstadisticaResponse
} from '../types/convocatorias.api';

export const convocatoriasService = {
  listarConvocatorias(params?: ConvocatoriaFilters) {
    return customInstance<PaginatedConvocatoriaResponse>({
      url: '/api/v1/convocatorias',
      method: 'GET',
      params
    });
  },

  crearConvocatoria(data: ConvocatoriaCreateDTO) {
    return customInstance<ConvocatoriaResponse>({
      url: '/api/v1/convocatorias',
      method: 'POST',
      data
    });
  },

  obtenerConvocatoriaPorId(id: number) {
    return customInstance<ConvocatoriaResponse>({
      url: `/api/v1/convocatorias/${id}`,
      method: 'GET'
    });
  },

  actualizarConvocatoria(id: number, data: ConvocatoriaUpdateDTO) {
    return customInstance<ConvocatoriaResponse>({
      url: `/api/v1/convocatorias/${id}`,
      method: 'PUT',
      data
    });
  },

  eliminarConvocatoriaFisica(id: number) {
    return customInstance<BaseDictResponse>({
      url: `/api/v1/convocatorias/${id}`,
      method: 'DELETE'
    });
  },

  publicarConvocatoria(id: number) {
    return customInstance<ConvocatoriaResponse>({
      url: `/api/v1/convocatorias/${id}/publicar`,
      method: 'PUT'
    });
  },

  ocultarConvocatoria(id: number) {
    return customInstance<ConvocatoriaResponse>({
      url: `/api/v1/convocatorias/${id}/ocultar`,
      method: 'PUT'
    });
  },

  cancelarConvocatoria(id: number) {
    return customInstance<ConvocatoriaResponse>({
      url: `/api/v1/convocatorias/${id}/cancelar`,
      method: 'PUT'
    });
  },

  estadisticasConvocatoria(id: number) {
    return customInstance<ConvocatoriaEstadisticaResponse>({
      url: `/api/v1/convocatorias/${id}/estadisticas`,
      method: 'GET'
    });
  }
}