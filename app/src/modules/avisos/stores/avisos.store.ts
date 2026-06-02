import { defineStore } from 'pinia';
import { ref } from 'vue';
import { avisosService } from '../services/avisos.service';
import type {
  AvisoDTO,
  AvisoFilters,
  AvisoCreateDTO,
  AvisoUpdateDTO,
  AvisoEstadoUpdateDTO
} from '../types/avisos.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useAvisosStore = defineStore('avisos', () => {
  // ================= ESTADO =================
  const avisos = ref<AvisoDTO[]>([]);
  const currentAviso = ref<AvisoDTO | null>(null);
  
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({ page: 1, limit: 10, total: 0, total_pages: 0 });

  // Helper local
  function updateLocalItem(updatedItem: AvisoDTO) {
    const index = avisos.value.findIndex(a => a.id_aviso === updatedItem.id_aviso);
    if (index !== -1) avisos.value[index] = updatedItem;
    if (currentAviso.value?.id_aviso === updatedItem.id_aviso) {
      currentAviso.value = { ...currentAviso.value, ...updatedItem };
    }
  }

  // ================= ACCIONES: LECTURA =================
  async function fetchAvisos(filters?: AvisoFilters, isAdmin: boolean = false) {
    loading.value = true;
    error.value = null;
    try {
      const response = isAdmin 
        ? await avisosService.listarAvisosAdmin(filters)
        : await avisosService.listarAvisosPublicos(filters);
      
      avisos.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAvisoById(id: number, isAdmin: boolean = false) {
    loading.value = true;
    error.value = null;
    try {
      const response = isAdmin
        ? await avisosService.obtenerAvisoAdmin(id)
        : await avisosService.obtenerAvisoPublico(id);
        
      currentAviso.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  // ================= ACCIONES: ESCRITURA (ADMIN) =================
  async function createAviso(data: AvisoCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await avisosService.crearAviso(data);
      avisos.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateAviso(id: number, data: AvisoUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await avisosService.actualizarAviso(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function changeEstadoAviso(id: number, data: AvisoEstadoUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await avisosService.cambiarEstadoAviso(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteAviso(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await avisosService.eliminarAviso(id);
      avisos.value = avisos.value.filter(a => a.id_aviso !== id);
      if (currentAviso.value?.id_aviso === id) currentAviso.value = null;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    avisos,
    currentAviso,
    loading,
    error,
    meta,
    
    fetchAvisos,
    fetchAvisoById,
    createAviso,
    updateAviso,
    changeEstadoAviso,
    deleteAviso
  };
});