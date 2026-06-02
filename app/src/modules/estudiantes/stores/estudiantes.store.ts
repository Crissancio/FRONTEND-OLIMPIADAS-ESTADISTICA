import { defineStore } from 'pinia';
import { ref } from 'vue';
import { estudiantesService } from '../services/estudiantes.service';
import type {
  EstudianteDTO,
  EstudianteFilters,
  EstudianteCreateDTO,
  EstudianteUpdateDTO,
  EstadoPersona,
  ExportarEstudiantesDTO
} from '../types/estudiantes.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useEstudiantesStore = defineStore('estudiantes', () => {
  // Estado
  const estudiantes = ref<EstudianteDTO[]>([]);
  const currentEstudiante = ref<EstudianteDTO | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Utilidad interna para mantener sincronizado el estado local
  function updateLocalItem(updatedItem: EstudianteDTO) {
    const index = estudiantes.value.findIndex(e => e.id_estudiante === updatedItem.id_estudiante);
    if (index !== -1) {
      estudiantes.value[index] = updatedItem;
    }
    if (currentEstudiante.value?.id_estudiante === updatedItem.id_estudiante) {
      currentEstudiante.value = updatedItem;
    }
  }

  // Acciones
  async function fetchEstudiantes(filters?: EstudianteFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await estudiantesService.listarEstudiantes(filters);
      estudiantes.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchEstudianteById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await estudiantesService.obtenerEstudiantePorId(id);
      currentEstudiante.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createEstudiante(data: EstudianteCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await estudiantesService.crearEstudiante(data);
      estudiantes.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateEstudiante(id: number, data: EstudianteUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await estudiantesService.actualizarEstudiante(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateEstudianteEstado(id: number, nuevoEstado: EstadoPersona) {
    loading.value = true;
    error.value = null;
    try {
      const response = await estudiantesService.cambiarEstadoEstudiante(id, { estado: nuevoEstado });
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Métodos para desencadenar las exportaciones
  async function exportStudentsCsv(data: ExportarEstudiantesDTO) {
    loading.value = true;
    error.value = null;
    try {
      // Puedes pasar { responseType: 'blob' } si tu mutador customInstance lo requiere
      return await estudiantesService.exportarCsv(data);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function exportStudentsPdf(data: ExportarEstudiantesDTO) {
    loading.value = true;
    error.value = null;
    try {
      return await estudiantesService.exportarPdf(data);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    estudiantes,
    currentEstudiante,
    loading,
    error,
    meta,
    fetchEstudiantes,
    fetchEstudianteById,
    createEstudiante,
    updateEstudiante,
    updateEstudianteEstado,
    exportStudentsCsv,
    exportStudentsPdf
  };
});