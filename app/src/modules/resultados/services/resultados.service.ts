import { customInstance } from '@/app/api/mutator';
import type {
  ResultadoFilters,
  PaginatedResultadoResponse,
  ResultadoCreateDTO,
  ResultadoResponse,
  AprobadosFaseFilters,
  ListAprobadosResponse,
  ResultadoUpdateDTO,
  ResultadoMasivoUpdateDTO,
  GeneralIntResponse,
  ResultadoMasivoCreateDTO,
  ResultadoEstadoUpdateDTO,
  AnalisisImportacionResponse,
  ConfirmarImportacionDTO,
  GeneralDictResponse,
  ExportarFaseFilters
} from '../types/resultados.api';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const resultadosService = {
  listarResultados(params: ResultadoFilters) {
    return customInstance<PaginatedResultadoResponse>({
      url: '/api/v1/resultados',
      method: 'GET',
      params
    });
  },

  crearResultado(data: ResultadoCreateDTO) {
    return customInstance<ResultadoResponse>({
      url: '/api/v1/resultados',
      method: 'POST',
      data
    });
  },

  obtenerResultadoPorId(id: number) {
    return customInstance<ResultadoResponse>({
      url: `/api/v1/resultados/${id}`,
      method: 'GET'
    });
  },

  actualizarResultado(id: number, data: ResultadoUpdateDTO) {
    return customInstance<ResultadoResponse>({
      url: `/api/v1/resultados/${id}`,
      method: 'PUT',
      data
    });
  },

  cambiarEstadoResultadoIndividual(id: number, data: ResultadoEstadoUpdateDTO) {
    return customInstance<ResultadoResponse>({
      url: `/api/v1/resultados/${id}/estado`,
      method: 'PATCH',
      data
    });
  },

  // ---- PROCESAMIENTO MASIVO MANUAL ----
  crearResultadosMasivos(data: ResultadoMasivoCreateDTO) {
    return customInstance<GeneralIntResponse>({
      url: '/api/v1/resultados/masivo',
      method: 'POST',
      data
    });
  },

  actualizarResultadosMasivos(data: ResultadoMasivoUpdateDTO) {
    return customInstance<GeneralIntResponse>({
      url: '/api/v1/resultados/masivo',
      method: 'PUT',
      data
    });
  },

  // ---- CONTROL DE FASE ----
  publicarResultadosFase(idFasePrueba: number) {
    return customInstance<GeneralIntResponse>({
      url: `/api/v1/resultados/fase/${idFasePrueba}/publicar`,
      method: 'PUT'
    });
  },

  ocultarResultadosFase(idFasePrueba: number) {
    return customInstance<GeneralIntResponse>({
      url: `/api/v1/resultados/fase/${idFasePrueba}/ocultar`,
      method: 'PUT'
    });
  },

  listarAprobadosPorFase(idFasePrueba: number, params?: AprobadosFaseFilters) {
    return customInstance<ListAprobadosResponse>({
      url: `/api/v1/resultados/fase/${idFasePrueba}/aprobados`,
      method: 'GET',
      params
    });
  },

  // ---- IMPORTACIÓN INTELIGENTE (CSV) ----
  analizarCsvFase(idFasePrueba: number, archivo: Blob) {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return customInstance<AnalisisImportacionResponse>({
      url: `/api/v1/resultados/import-csv/analizar/${idFasePrueba}`,
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData
    });
  },

  importarCsvDefinitivo(idFasePrueba: number, data: ConfirmarImportacionDTO) {
    return customInstance<GeneralDictResponse>({
      url: `/api/v1/resultados/import-csv/${idFasePrueba}`,
      method: 'POST',
      data
    });
  },

  descargarCsvErrores(filename: string, options?: SecondParameter<typeof customInstance>) {
    return customInstance<unknown>({
      url: `/api/v1/resultados/import-csv/download/${filename}`,
      method: 'GET',
      ...options
    });
  },

  // ---- EXPORTACIONES Y REPORTES ----
  exportarFaseCsv(idFasePrueba: number, params?: ExportarFaseFilters, options?: SecondParameter<typeof customInstance>) {
    return customInstance<unknown>({
      url: `/api/v1/resultados/export/csv/${idFasePrueba}`,
      method: 'GET',
      params,
      ...options
    });
  },

  exportarFasePdf(idFasePrueba: number, params?: ExportarFaseFilters, options?: SecondParameter<typeof customInstance>) {
    return customInstance<unknown>({
      url: `/api/v1/resultados/export/pdf/${idFasePrueba}`,
      method: 'GET',
      params,
      ...options
    });
  }
};