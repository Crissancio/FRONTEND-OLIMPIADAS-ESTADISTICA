import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fasesService } from '../services/fases.service';
import type {
  FaseUnionDTO,
  FaseMinifiedDTO,
  FaseFilters,
  FasePreparacionCreateDTO,
  FasePreparacionUpdateDTO,
  FasePruebaCreateDTO,
  FasePruebaUpdateDTO,
  EstadoEntidad
} from '../types/fases.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useFasesStore = defineStore('fases', () => {
  // Estado
  const fases = ref<FaseUnionDTO[]>([]);
  const fasesPruebaMinified = ref<FaseMinifiedDTO[]>([]); // Para selects/combobox
  const currentFase = ref<FaseUnionDTO | null>(null);
  
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Helper local para mantener sincronizada la lista tras actualizar algo
  function updateLocalItem(updatedItem: FaseUnionDTO) {
    const index = fases.value.findIndex(f => f.id_fase === updatedItem.id_fase);
    if (index !== -1) {
      fases.value[index] = updatedItem;
    }
    if (currentFase.value?.id_fase === updatedItem.id_fase) {
      currentFase.value = updatedItem;
    }
  }

  // ---- LISTAR ----
  async function fetchFases(filters?: FaseFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.listarFases(filters);
      fases.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchFasesPorCategoria(categoriaId: number, filters?: FaseFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.listarFasesPorCategoria(categoriaId, filters);
      fases.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchFasesPruebaMinified(categoriaId: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.listarFasesPruebaMinified(categoriaId);
      fasesPruebaMinified.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchFaseById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.obtenerFasePorId(id);
      currentFase.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  // ---- CREAR ----
  async function createFasePreparacion(data: FasePreparacionCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.crearFasePreparacion(data);
      fases.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createFasePrueba(data: FasePruebaCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.crearFasePrueba(data);
      fases.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ---- ACTUALIZAR ----
  async function updateFasePreparacion(id: number, data: FasePreparacionUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.actualizarFasePreparacion(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateFasePrueba(id: number, data: FasePruebaUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.actualizarFasePrueba(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateFaseEstado(id: number, nuevoEstado: EstadoEntidad) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.cambiarEstadoFase(id, { estado: nuevoEstado });
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ---- ELIMINAR ----
  async function removeFaseLogica(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await fasesService.eliminarFaseLogica(id);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeFaseFisica(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await fasesService.eliminarFaseFisica(id);
      fases.value = fases.value.filter(f => f.id_fase !== id);
      if (currentFase.value?.id_fase === id) {
        currentFase.value = null;
      }
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    fases,
    fasesPruebaMinified,
    currentFase,
    loading,
    error,
    meta,
    fetchFases,
    fetchFasesPorCategoria,
    fetchFasesPruebaMinified,
    fetchFaseById,
    createFasePreparacion,
    createFasePrueba,
    updateFasePreparacion,
    updateFasePrueba,
    updateFaseEstado,
    removeFaseLogica,
    removeFaseFisica
  };
});