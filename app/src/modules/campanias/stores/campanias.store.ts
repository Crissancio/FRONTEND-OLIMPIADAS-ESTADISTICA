import { defineStore } from 'pinia';
import { ref } from 'vue';
import { campaniasService } from '../services/campanias.service';
import type {
  CampaniaDTO,
  CampaniaFilters,
  CampaniaCreateDTO,
  CampaniaUpdateDTO,
  EstadoCampania
} from '../types/campanias.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useCampaniasStore = defineStore('campanias', () => {
  // Estado
  const campanias = ref<CampaniaDTO[]>([]);
  const currentCampania = ref<CampaniaDTO | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Helper local para mutar datos de forma optimista e inmediata en UI
  function updateLocalItem(updatedItem: CampaniaDTO) {
    const index = campanias.value.findIndex(c => c.id_campania_email === updatedItem.id_campania_email);
    if (index !== -1) {
      campanias.value[index] = updatedItem;
    }
    if (currentCampania.value?.id_campania_email === updatedItem.id_campania_email) {
      currentCampania.value = updatedItem;
    }
  }

  // ---- ACCIONES ----

  async function fetchCampanias(filters?: CampaniaFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await campaniasService.listarCampanias(filters);
      campanias.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCampaniaById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await campaniasService.obtenerCampaniaPorId(id);
      currentCampania.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createCampania(data: CampaniaCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await campaniasService.crearCampania(data);
      campanias.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCampania(id: number, data: CampaniaUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await campaniasService.actualizarCampania(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCampaniaEstado(id: number, nuevoEstado: EstadoCampania) {
    loading.value = true;
    error.value = null;
    try {
      const response = await campaniasService.cambiarEstadoCampania(id, { estado: nuevoEstado });
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeCampania(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await campaniasService.eliminarCampania(id);
      campanias.value = campanias.value.filter(c => c.id_campania_email !== id);
      if (currentCampania.value?.id_campania_email === id) {
        currentCampania.value = null;
      }
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearCurrentCampania() {
    currentCampania.value = null;
  }

  return {
    campanias,
    currentCampania,
    loading,
    error,
    meta,
    fetchCampanias,
    fetchCampaniaById,
    createCampania,
    updateCampania,
    updateCampaniaEstado,
    removeCampania,
    clearCurrentCampania
  };
});