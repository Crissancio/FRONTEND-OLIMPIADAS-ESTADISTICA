import { defineStore } from 'pinia';
import { ref } from 'vue';
import { inscripcionesService } from '../services/inscripcion.service';
import type {
  InscripcionDTO,
  InscripcionFilters,
  EstudianteBuscarRequestDTO,
  EstudianteBusquedaDTO,
  InscripcionFormularioRequestDTO,
  InscripcionAdminCreateDTO,
  EstadoInscripcion,
  ExportarInscripcionesRequestDTO
} from '../types/inscripcion.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useInscripcionesStore = defineStore('inscripciones', () => {
  // Estado
  const inscripciones = ref<InscripcionDTO[]>([]);
  const currentInscripcion = ref<InscripcionDTO | null>(null);
  const estudianteVerificado = ref<EstudianteBusquedaDTO | null>(null); // Datos pre-inscripción
  
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Helper local para mutar datos en memoria de inmediato
  function updateLocalItem(updatedItem: InscripcionDTO) {
    const index = inscripciones.value.findIndex(i => i.id_inscripcion === updatedItem.id_inscripcion);
    if (index !== -1) {
      inscripciones.value[index] = updatedItem;
    }
    if (currentInscripcion.value?.id_inscripcion === updatedItem.id_inscripcion) {
      currentInscripcion.value = updatedItem;
    }
  }

  // ---- ACCIONES ----

  async function fetchInscripciones(filters?: InscripcionFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await inscripcionesService.listarInscripciones(filters);
      inscripciones.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchInscripcionById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await inscripcionesService.obtenerInscripcionPorId(id);
      currentInscripcion.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  // Flujo Público/Formulario: Verificar antes de inscribir
  async function verifyEstudiante(data: EstudianteBuscarRequestDTO) {
    loading.value = true;
    error.value = null;
    estudianteVerificado.value = null;
    try {
      const response = await inscripcionesService.verificarEstudiante(data);
      estudianteVerificado.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Flujo Público: Confirmar inscripción desde formulario publico
  async function registerInscripcionFormulario(data: InscripcionFormularioRequestDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await inscripcionesService.registrarPorFormulario(data);
      // Opcional: meterlo al array si el admin está usando este form
      inscripciones.value.unshift(response.data.inscripcion);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Flujo de Panel: Inscripción manual directa por el Administrador
  async function createInscripcionManual(data: InscripcionAdminCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await inscripcionesService.crearInscripcionManualAdmin(data);
      inscripciones.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateInscripcionEstado(id: number, nuevoEstado: EstadoInscripcion) {
    loading.value = true;
    error.value = null;
    try {
      const response = await inscripcionesService.cambiarEstadoInscripcion(id, { estado: nuevoEstado });
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeInscripcion(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await inscripcionesService.eliminarInscripcionFisica(id);
      inscripciones.value = inscripciones.value.filter(i => i.id_inscripcion !== id);
      if (currentInscripcion.value?.id_inscripcion === id) {
        currentInscripcion.value = null;
      }
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ---- REPORTES ----
  async function exportInscriptionsCsv(data: ExportarInscripcionesRequestDTO) {
    loading.value = true;
    error.value = null;
    try {
      return await inscripcionesService.exportarCsv(data);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function exportInscriptionsPdf(data: ExportarInscripcionesRequestDTO) {
    loading.value = true;
    error.value = null;
    try {
      return await inscripcionesService.exportarPdf(data);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearEstudianteVerificado() {
    estudianteVerificado.value = null;
  }

  return {
    inscripciones,
    currentInscripcion,
    estudianteVerificado,
    loading,
    error,
    meta,
    fetchInscripciones,
    fetchInscripcionById,
    verifyEstudiante,
    registerInscripcionFormulario,
    createInscripcionManual,
    updateInscripcionEstado,
    removeInscripcion,
    exportInscriptionsCsv,
    exportInscriptionsPdf,
    clearEstudianteVerificado
  };
});