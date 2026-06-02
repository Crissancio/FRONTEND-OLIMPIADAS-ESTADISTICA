import { customInstance } from '@/app/api/mutator';
import type {
  EstudianteFilters,
  PaginatedEstudianteResponse,
  EstudianteCreateDTO,
  EstudianteResponse,
  EstudianteUpdateDTO,
  EstudianteEstadoUpdateDTO,
  ExportarEstudiantesDTO
} from '../types/estudiantes.api';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const estudiantesService = {
  listarEstudiantes(params?: EstudianteFilters) {
    return customInstance<PaginatedEstudianteResponse>({
      url: '/api/v1/estudiantes/',
      method: 'GET',
      params
    });
  },

  crearEstudiante(data: EstudianteCreateDTO) {
    return customInstance<EstudianteResponse>({
      url: '/api/v1/estudiantes/',
      method: 'POST',
      data
    });
  },

  obtenerEstudiantePorId(id: number) {
    return customInstance<EstudianteResponse>({
      url: `/api/v1/estudiantes/${id}`,
      method: 'GET'
    });
  },

  actualizarEstudiante(id: number, data: EstudianteUpdateDTO) {
    return customInstance<EstudianteResponse>({
      url: `/api/v1/estudiantes/${id}`,
      method: 'PATCH',
      data
    });
  },

  cambiarEstadoEstudiante(id: number, data: EstudianteEstadoUpdateDTO) {
    return customInstance<EstudianteResponse>({
      url: `/api/v1/estudiantes/${id}/estado`,
      method: 'PATCH',
      data
    });
  },

  exportarCsv(data: ExportarEstudiantesDTO, options?: SecondParameter<typeof customInstance>) {
    return customInstance<unknown>({
      url: '/api/v1/estudiantes/exportar/csv',
      method: 'POST',
      data,
      ...options
    });
  },

  exportarPdf(data: ExportarEstudiantesDTO, options?: SecondParameter<typeof customInstance>) {
    return customInstance<unknown>({
      url: '/api/v1/estudiantes/exportar/pdf',
      method: 'POST',
      data,
      ...options
    });
  }
};