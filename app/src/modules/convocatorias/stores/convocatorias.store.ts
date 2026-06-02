import { defineStore } from 'pinia';
import { ref } from 'vue';
import { convocatoriasService } from '../services/convocatorias.service';
import type {
  ConvocatoriaDTO,
  ConvocatoriaFilters,
  ConvocatoriaCreateDTO,
  ConvocatoriaUpdateDTO
} from '../types/convocatorias.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useConvocatoriasStore = defineStore('convocatorias', () => {
  // Estado
  const convocatorias = ref<ConvocatoriaDTO[]>([]);
  const currentConvocatoria = ref<ConvocatoriaDTO | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Acciones Auxiliares locales para mantener sincronizado el estado interno
  function updateLocalItem(updatedItem: ConvocatoriaDTO) {
    const index = convocatorias.value.findIndex(c => c.id_convocatoria === updatedItem.id_convocatoria);
    if (index !== -1) {
      convocatorias.value[index] = updatedItem;
    }
    if (currentConvocatoria.value?.id_convocatoria === updatedItem.id_convocatoria) {
      currentConvocatoria.value = updatedItem;
    }
  }

  // Acciones Principales
  async function fetchConvocatorias(filters?: ConvocatoriaFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await convocatoriasService.listarConvocatorias(filters);
      
      // SI LA PÁGINA ES MAYOR A 1, ACUMULAMOS; SI NO, REEMPLAZAMOS (Filtro nuevo o F5)
      if (filters?.page && filters.page > 1) {
        convocatorias.value = [...convocatorias.value, ...response.data.items];
      } else {
        convocatorias.value = response.data.items;
      }
      
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }
  async function fetchConvocatoriaById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await convocatoriasService.obtenerConvocatoriaPorId(id);
      currentConvocatoria.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createConvocatoria(data: ConvocatoriaCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await convocatoriasService.crearConvocatoria(data);
      convocatorias.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateConvocatoria(id: number, data: ConvocatoriaUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await convocatoriasService.actualizarConvocatoria(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeConvocatoriaFisica(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await convocatoriasService.eliminarConvocatoriaFisica(id);
      convocatorias.value = convocatorias.value.filter(c => c.id_convocatoria !== id);
      if (currentConvocatoria.value?.id_convocatoria === id) {
        currentConvocatoria.value = null;
      }
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function publishConvocatoria(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await convocatoriasService.publicarConvocatoria(id);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function hideConvocatoria(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await convocatoriasService.ocultarConvocatoria(id);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function cancelConvocatoria(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await convocatoriasService.cancelarConvocatoria(id);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    convocatorias,
    currentConvocatoria,
    loading,
    error,
    meta,
    fetchConvocatorias,
    fetchConvocatoriaById,
    createConvocatoria,
    updateConvocatoria,
    removeConvocatoriaFisica,
    publishConvocatoria,
    hideConvocatoria,
    cancelConvocatoria
  };
});