import { defineStore } from 'pinia';
import { ref } from 'vue';
import { personasService } from '../services/personas.service';
import type {
  EstadoPersona,
  DirectorDTO,
  DirectorMinifiedDTO,
  ColaboradorDTO,
  DirectorFilters,
  ColaboradorFilters,
  DirectorCreateDTO,
  DirectorUpdateDTO,
  ColaboradorCreateDTO,
  ColaboradorUpdateDTO
} from '../types/personas.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const usePersonasStore = defineStore('personas', () => {
  // ================= ESTADO =================
  const directores = ref<DirectorDTO[]>([]);
  const directoresCorta = ref<DirectorMinifiedDTO[]>([]);
  const colaboradores = ref<ColaboradorDTO[]>([]);
  
  const currentDirector = ref<DirectorDTO | null>(null);
  const currentColaborador = ref<ColaboradorDTO | null>(null);

  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);

  const metaDirectores = ref<PaginationMeta>({ page: 1, limit: 10, total: 0, total_pages: 0 });
  const metaColaboradores = ref<PaginationMeta>({ page: 1, limit: 10, total: 0, total_pages: 0 });

  // Helpers de mutación optimista
  function updateLocalDirector(updatedItem: DirectorDTO) {
    const idx = directores.value.findIndex(d => d.id_director === updatedItem.id_director);
    if (idx !== -1) directores.value[idx] = updatedItem;
    if (currentDirector.value?.id_director === updatedItem.id_director) currentDirector.value = updatedItem;
  }

  function updateLocalColaborador(updatedItem: ColaboradorDTO) {
    const idx = colaboradores.value.findIndex(c => c.id_colaborador === updatedItem.id_colaborador);
    if (idx !== -1) colaboradores.value[idx] = updatedItem;
    if (currentColaborador.value?.id_colaborador === updatedItem.id_colaborador) currentColaborador.value = updatedItem;
  }

  // ================= ACCIONES: DIRECTORES =================

  async function fetchDirectores(filters?: DirectorFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.listarDirectores(filters);
      directores.value = response.data.items;
      metaDirectores.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDirectoresCorta() {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.listarDirectoresCorta();
      directoresCorta.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDirectorById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.obtenerDirectorPorId(id);
      currentDirector.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createDirector(data: DirectorCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.crearDirector(data);
      directores.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateDirector(id: number, data: DirectorUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.actualizarDirector(id, data);
      updateLocalDirector(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function toggleBajaDirector(id: number, isAlta: boolean) {
    loading.value = true;
    error.value = null;
    try {
      const response = isAlta 
        ? await personasService.altaLogicaDirector(id)
        : await personasService.bajaLogicaDirector(id);
      updateLocalDirector(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteDirector(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await personasService.eliminarDirector(id);
      directores.value = directores.value.filter(d => d.id_director !== id);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ================= ACCIONES: COLABORADORES =================

  async function fetchColaboradores(filters?: ColaboradorFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.listarColaboradores(filters);
      colaboradores.value = response.data.items;
      metaColaboradores.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchColaboradorById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.obtenerColaboradorPorId(id);
      currentColaborador.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createColaborador(data: ColaboradorCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.crearColaborador(data);
      colaboradores.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateColaborador(id: number, data: ColaboradorUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await personasService.actualizarColaborador(id, data);
      updateLocalColaborador(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function toggleBajaColaborador(id: number, isAlta: boolean) {
    loading.value = true;
    error.value = null;
    try {
      await (isAlta ? personasService.altaColaborador(id) : personasService.bajaColaborador(id));
      // La API devuelve ResponseBaseDict, así que forzamos la actualización local del estado
      const estadoActualizado: EstadoPersona = isAlta ? 'ACTIVO' : 'INACTIVO';
      const colabToUpdate = colaboradores.value.find(c => c.id_colaborador === id);
      if (colabToUpdate) updateLocalColaborador({ ...colabToUpdate, estado: estadoActualizado });
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteColaborador(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await personasService.eliminarColaborador(id);
      colaboradores.value = colaboradores.value.filter(c => c.id_colaborador !== id);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    directores,
    directoresCorta,
    colaboradores,
    currentDirector,
    currentColaborador,
    loading,
    error,
    metaDirectores,
    metaColaboradores,
    
    // Actions: Directores
    fetchDirectores,
    fetchDirectoresCorta,
    fetchDirectorById,
    createDirector,
    updateDirector,
    toggleBajaDirector,
    deleteDirector,

    // Actions: Colaboradores
    fetchColaboradores,
    fetchColaboradorById,
    createColaborador,
    updateColaborador,
    toggleBajaColaborador,
    deleteColaborador
  };
});