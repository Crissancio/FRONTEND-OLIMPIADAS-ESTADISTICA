import { defineStore } from 'pinia';
import { ref } from 'vue';
import { resultadosService } from '../services/resultados.service';
import type {
  ResultadoDTO,
  ResultadoAprobatorioDTO,
  AnalisisImportacionDTO,
  ResultadoFilters,
  AprobadosFaseFilters,
  ResultadoCreateDTO,
  ResultadoUpdateDTO,
  EstadoResultado,
  ResultadoMasivoCreateDTO,
  ResultadoMasivoUpdateDTO,
  ConfirmarImportacionDTO,
  ExportarFaseFilters
} from '../types/resultados.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useResultadosStore = defineStore('resultados', () => {
  // Estado
  const resultados = ref<ResultadoDTO[]>([]);
  const aprobados = ref<ResultadoAprobatorioDTO[]>([]);
  const currentResultado = ref<ResultadoDTO | null>(null);
  const ultimoAnalisisImportacion = ref<AnalisisImportacionDTO | null>(null);
  
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Mutación en memoria optimista local
  function updateLocalItem(updatedItem: ResultadoDTO) {
    const index = resultados.value.findIndex(r => r.id_resultado === updatedItem.id_resultado);
    if (index !== -1) {
      resultados.value[index] = updatedItem;
    }
    if (currentResultado.value?.id_resultado === updatedItem.id_resultado) {
      currentResultado.value = updatedItem;
    }
  }

  // ---- ACCIONES PRINCIPALES ----

  async function fetchResultados(filters: ResultadoFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await resultadosService.listarResultados(filters);
      resultados.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchResultadoById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await resultadosService.obtenerResultadoPorId(id);
      currentResultado.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createResultado(data: ResultadoCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await resultadosService.crearResultado(data);
      resultados.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateResultado(id: number, data: ResultadoUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await resultadosService.actualizarResultado(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateResultadoEstado(id: number, nuevoEstado: EstadoResultado) {
    loading.value = true;
    error.value = null;
    try {
      const response = await resultadosService.cambiarEstadoResultadoIndividual(id, { estado: nuevoEstado });
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ---- ACCIONES MASIVAS MANUALES ----

  async function createMasivo(data: ResultadoMasivoCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      return await resultadosService.crearResultadosMasivos(data);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateMasivo(data: ResultadoMasivoUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      return await resultadosService.actualizarResultadosMasivos(data);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ---- OPERACIONES DE CONTROL DE FASE ----

  async function publishFase(idFasePrueba: number) {
    loading.value = true;
    error.value = null;
    try {
      return await resultadosService.publicarResultadosFase(idFasePrueba);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function hideFase(idFasePrueba: number) {
    loading.value = true;
    error.value = null;
    try {
      return await resultadosService.ocultarResultadosFase(idFasePrueba);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAprobadosFase(idFasePrueba: number, filters?: AprobadosFaseFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await resultadosService.listarAprobadosPorFase(idFasePrueba, filters);
      aprobados.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  // ---- FLUJO DE PROCESAMIENTO CSV IMPORTER ----

  async function analyzeImportCsv(idFasePrueba: number, archivo: Blob) {
    loading.value = true;
    error.value = null;
    ultimoAnalisisImportacion.value = null;
    try {
      const response = await resultadosService.analizarCsvFase(idFasePrueba, archivo);
      ultimoAnalisisImportacion.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function confirmImportCsv(idFasePrueba: number, payload: ConfirmarImportacionDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await resultadosService.importarCsvDefinitivo(idFasePrueba, payload);
      ultimoAnalisisImportacion.value = null; // Limpiar tras importar con éxito
      return response;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function downloadErrorFile(filename: string) {
    loading.value = true;
    error.value = null;
    try {
      // Pasa { responseType: 'blob' } si manejas descargas nativas
      return await resultadosService.descargarCsvErrores(filename);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ---- EXPORTACIÓN DE REPORTES ----

  async function exportFaseToCsv(idFasePrueba: number, params?: ExportarFaseFilters) {
    loading.value = true;
    error.value = null;
    try {
      return await resultadosService.exportarFaseCsv(idFasePrueba, params);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function exportFaseToPdf(idFasePrueba: number, params?: ExportarFaseFilters) {
    loading.value = true;
    error.value = null;
    try {
      return await resultadosService.exportarFasePdf(idFasePrueba, params);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearUltimoAnalisis() {
    ultimoAnalisisImportacion.value = null;
  }

  return {
    resultados,
    aprobados,
    currentResultado,
    ultimoAnalisisImportacion,
    loading,
    error,
    meta,
    fetchResultados,
    fetchResultadoById,
    createResultado,
    updateResultado,
    updateResultadoEstado,
    createMasivo,
    updateMasivo,
    publishFase,
    hideFase,
    fetchAprobadosFase,
    analyzeImportCsv,
    confirmImportCsv,
    downloadErrorFile,
    exportFaseToCsv,
    exportFaseToPdf,
    clearUltimoAnalisis
  };
});