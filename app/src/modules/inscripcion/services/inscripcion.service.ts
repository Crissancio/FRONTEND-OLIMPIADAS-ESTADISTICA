import { customInstance } from '@/app/api/mutator';
import type {
  InscripcionFilters,
  PaginatedInscripcionResponse,
  InscripcionResponse,
  EstudianteBuscarRequestDTO,
  EstudianteBusquedaResponse,
  InscripcionFormularioRequestDTO,
  InscripcionFormularioResponse,
  InscripcionAdminCreateDTO,
  InscripcionEstadoUpdateDTO,
  ExportarInscripcionesRequestDTO,
  GeneralDictResponse
} from '../types/inscripcion.api';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const inscripcionesService = {
  listarInscripciones(params?: InscripcionFilters) {
    return customInstance<PaginatedInscripcionResponse>({
      url: '/api/v1/inscripciones',
      method: 'GET',
      params
    });
  },

  obtenerInscripcionPorId(id: number) {
    return customInstance<InscripcionResponse>({
      url: `/api/v1/inscripciones/${id}`,
      method: 'GET'
    });
  },

  verificarEstudiante(data: EstudianteBuscarRequestDTO) {
    return customInstance<EstudianteBusquedaResponse>({
      url: '/api/v1/inscripciones/verificar-estudiante',
      method: 'POST',
      data
    });
  },

  registrarPorFormulario(data: InscripcionFormularioRequestDTO) {
    return customInstance<InscripcionFormularioResponse>({
      url: '/api/v1/inscripciones/formulario',
      method: 'POST',
      data
    });
  },

  crearInscripcionManualAdmin(data: InscripcionAdminCreateDTO) {
    return customInstance<InscripcionResponse>({
      url: '/api/v1/inscripciones/admin',
      method: 'POST',
      data
    });
  },

  cambiarEstadoInscripcion(id: number, data: InscripcionEstadoUpdateDTO) {
    return customInstance<InscripcionResponse>({
      url: `/api/v1/inscripciones/${id}/estado`,
      method: 'PATCH',
      data
    });
  },

  eliminarInscripcionFisica(id: number) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/inscripciones/${id}`,
      method: 'DELETE'
    });
  },

  exportarCsv(data: ExportarInscripcionesRequestDTO, options?: SecondParameter<typeof customInstance>) {
    return customInstance<unknown>({
      url: '/api/v1/inscripciones/exportar/csv',
      method: 'POST',
      data,
      ...options
    });
  },

  exportarPdf(data: ExportarInscripcionesRequestDTO, options?: SecondParameter<typeof customInstance>) {
    return customInstance<unknown>({
      url: '/api/v1/inscripciones/exportar/pdf',
      method: 'POST',
      data,
      ...options
    });
  }
};