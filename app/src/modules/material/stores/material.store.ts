import { defineStore } from 'pinia';
import { ref } from 'vue';
import { materialesService } from '../services/material.service';
import type {
  MaterialDTO,
  MaterialDetalleDTO,
  MaterialFilters,
  MaterialExternoCreateDTO,
  MaterialArchivoCreateDTO,
  MaterialPrincipalCreateDTO,
  MaterialUpdateDTO
} from '../types/material.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useMaterialesStore = defineStore('materiales', () => {
  // Estado
  const materiales = ref<MaterialDTO[]>([]);
  const currentMaterial = ref<MaterialDetalleDTO | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  
  const meta = ref<PaginationMeta>({ page: 1, limit: 10, total: 0, total_pages: 0 });

  // Helper local
  function updateLocalItem(updatedItem: MaterialDTO) {
    const index = materiales.value.findIndex(m => m.id_material === updatedItem.id_material);
    if (index !== -1) materiales.value[index] = updatedItem;
    if (currentMaterial.value?.id_material === updatedItem.id_material) {
      currentMaterial.value = { ...currentMaterial.value, ...updatedItem };
    }
  }

  // ---- ACCIONES: LECTURA ----
  async function fetchMateriales(filters?: MaterialFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await materialesService.listarMateriales(filters);
      materiales.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMaterialById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await materialesService.obtenerMaterialPorId(id);
      currentMaterial.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  // ---- ACCIONES: CREACIÓN ----
  async function createExterno(data: MaterialExternoCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await materialesService.crearMaterialExterno(data);
      materiales.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createArchivo(data: MaterialArchivoCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await materialesService.crearMaterialArchivo(data);
      materiales.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createPrincipal(data: MaterialPrincipalCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await materialesService.crearMaterialPrincipal(data);
      materiales.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ---- ACCIONES: EDICIÓN Y ESTADOS ----
  async function updateMaterial(id: number, data: MaterialUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await materialesService.actualizarMaterial(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function toggleVisibilidadMaterial(id: number, publicar: boolean) {
    loading.value = true;
    error.value = null;
    try {
      const response = publicar 
        ? await materialesService.publicarMaterial(id)
        : await materialesService.ocultarMaterial(id);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteMaterial(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await materialesService.eliminarMaterial(id);
      materiales.value = materiales.value.filter(m => m.id_material !== id);
      if (currentMaterial.value?.id_material === id) currentMaterial.value = null;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ---- ACCIONES: RELACIONES (Ligar/Desligar) ----
  // Nota: Al modificar relaciones, es ideal recargar el detalle completo del material
  async function linkConvocatoria(idMaterial: number, idConvocatoria: number) {
    loading.value = true;
    error.value = null;
    try {
      await materialesService.ligarConvocatoria(idMaterial, idConvocatoria);
      await fetchMaterialById(idMaterial); // Refresca el detalle para obtener la nueva lista de convocatorias
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function unlinkConvocatoria(idMaterial: number, idConvocatoria: number) {
    loading.value = true;
    error.value = null;
    try {
      await materialesService.desligarConvocatoria(idMaterial, idConvocatoria);
      await fetchMaterialById(idMaterial);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function linkFase(idMaterial: number, idFase: number) {
    loading.value = true;
    error.value = null;
    try {
      await materialesService.ligarFase(idMaterial, idFase);
      await fetchMaterialById(idMaterial);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function unlinkFase(idMaterial: number, idFase: number) {
    loading.value = true;
    error.value = null;
    try {
      await materialesService.desligarFase(idMaterial, idFase);
      await fetchMaterialById(idMaterial);
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    materiales,
    currentMaterial,
    loading,
    error,
    meta,
    
    fetchMateriales,
    fetchMaterialById,
    createExterno,
    createArchivo,
    createPrincipal,
    updateMaterial,
    toggleVisibilidadMaterial,
    deleteMaterial,
    
    linkConvocatoria,
    unlinkConvocatoria,
    linkFase,
    unlinkFase
  };
});