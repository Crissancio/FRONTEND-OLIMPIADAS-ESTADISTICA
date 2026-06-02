import { defineStore } from 'pinia';
import { ref } from 'vue';
import { administradoresService } from '../services/administradores.service';
import type { 
  AdministradorDTO, 
  AdministradorFilters, 
  AdministradorCreateDTO, 
  AdministradorUpdateDTO,
  PaginationMeta
} from '../types/administradores.api';
import type { ApiError } from '@/app/api/api-error';

export const useAdministradoresStore = defineStore('administradores', () => {
  // Estado
  const administradores = ref<AdministradorDTO[]>([]);
  const currentAdministrador = ref<AdministradorDTO | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Acciones
  async function fetchAdministradores(filters?: AdministradorFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await administradoresService.listarAdministradores(filters);
      administradores.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAdministradorById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await administradoresService.obtenerAdministradorPorId(id);
      currentAdministrador.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createAdministrador(data: AdministradorCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await administradoresService.crearAdministrador(data);
      administradores.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateAdministrador(id: number, data: AdministradorUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await administradoresService.actualizarAdministrador(id, data);
      
      // Actualizar en la lista local
      const index = administradores.value.findIndex(a => a.id_administrador === id);
      if (index !== -1) {
        administradores.value[index] = { ...administradores.value[index], ...response.data };
      }
      
      if (currentAdministrador.value?.id_administrador === id) {
        currentAdministrador.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function toggleBajaLogica(id: number, darDeBaja: boolean) {
    loading.value = true;
    error.value = null;
    try {
      const response = darDeBaja 
        ? await administradoresService.bajaLogicaAdministrador(id)
        : await administradoresService.altaLogicaAdministrador(id);
        
      // Actualizar estado en la lista local
      const index = administradores.value.findIndex(a => a.id_administrador === id);
      if (index !== -1) {
        administradores.value[index] = response.data;
      }
      
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeAdministrador(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await administradoresService.eliminarAdministrador(id);
      administradores.value = administradores.value.filter(a => a.id_administrador !== id);
      if (currentAdministrador.value?.id_administrador === id) {
        currentAdministrador.value = null;
      }
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    administradores,
    currentAdministrador,
    loading,
    error,
    meta,
    fetchAdministradores,
    fetchAdministradorById,
    createAdministrador,
    updateAdministrador,
    toggleBajaLogica,
    removeAdministrador
  };
});