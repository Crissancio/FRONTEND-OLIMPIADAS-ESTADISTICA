import { defineStore } from 'pinia';
import { ref } from 'vue';
import { colegiosService } from '../services/colegios.service';
import type {
  ColegioDTO,
  ColegioDetailDTO,
  ColegioFilters,
  ColegioCreateDTO,
  ColegioUpdateDTO,
  BodySubirCsvColegios,
  CSVUploadResponseData,
  ColegioCSVImportDTO
} from '../types/colegios.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useColegiosStore = defineStore('colegios', () => {
  // ================= ESTADO =================
  const colegios = ref<ColegioDTO[]>([]);
  const currentColegio = ref<ColegioDetailDTO | null>(null);
  
  // Estado para la carga masiva (almacena la validación previa)
  const csvUploadResult = ref<CSVUploadResponseData | null>(null);

  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({ page: 1, limit: 10, total: 0, total_pages: 0 });

  // Helper local para actualización optimista
  function updateLocalItem(updatedItem: ColegioDTO) {
    const index = colegios.value.findIndex(c => c.id_colegio === updatedItem.id_colegio);
    if (index !== -1) colegios.value[index] = updatedItem;
    if (currentColegio.value?.id_colegio === updatedItem.id_colegio) {
      currentColegio.value = { ...currentColegio.value, ...updatedItem };
    }
  }

  // ================= ACCIONES: CRUD BÁSICO =================
  async function fetchColegios(filters?: ColegioFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await colegiosService.listarColegios(filters);
      colegios.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchColegioById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await colegiosService.obtenerColegioPorId(id);
      currentColegio.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createColegio(data: ColegioCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await colegiosService.crearColegio(data);
      colegios.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateColegio(id: number, data: ColegioUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await colegiosService.actualizarColegio(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function toggleBajaColegio(id: number, isAlta: boolean) {
    loading.value = true;
    error.value = null;
    try {
      const response = isAlta
        ? await colegiosService.altaLogicaColegio(id)
        : await colegiosService.bajaLogicaColegio(id);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteColegio(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await colegiosService.eliminarColegio(id);
      colegios.value = colegios.value.filter(c => c.id_colegio !== id);
      if (currentColegio.value?.id_colegio === id) currentColegio.value = null;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ================= ACCIONES: CARGA MASIVA (CSV) =================
  
  // 1. Sube el archivo y guarda el resultado de la validación
  async function uploadCsv(data: BodySubirCsvColegios) {
    loading.value = true;
    error.value = null;
    try {
      const response = await colegiosService.subirCsvColegios(data);
      csvUploadResult.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 2. Procesa la importación final hacia la base de datos
  async function importCsv(validData: ColegioCSVImportDTO[]) {
    loading.value = true;
    error.value = null;
    try {
      const response = await colegiosService.importarColegiosCsv(validData);
      // Limpiamos el estado de validación tras importar con éxito
      csvUploadResult.value = null; 
      // Refrescamos la lista para ver los nuevos
      await fetchColegios();
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 3. Descarga el archivo de errores si la API lo generó
  async function downloadCsvErrorFile(filename: string) {
    loading.value = true;
    error.value = null;
    try {
      const blob = await colegiosService.descargarCsvError(filename);
      // Lógica sencilla para forzar la descarga en el navegador
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function resetCsvUploadResult() {
    csvUploadResult.value = null;
  }

  return {
    colegios,
    currentColegio,
    csvUploadResult,
    loading,
    error,
    meta,
    
    // CRUD
    fetchColegios,
    fetchColegioById,
    createColegio,
    updateColegio,
    toggleBajaColegio,
    deleteColegio,

    // CSV
    uploadCsv,
    importCsv,
    downloadCsvErrorFile,
    resetCsvUploadResult
  };
});