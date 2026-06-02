import { defineStore } from 'pinia';
import { ref } from 'vue';
import { categoriasService } from '../services/categorias.service';
import type {
  CategoriaDTO,
  CategoriaFilters,
  CategoriaCreateDTO,
  CategoriaUpdateDTO,
  EstadoEntidad
} from '../types/categorias.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useCategoriasStore = defineStore('categorias', () => {
  // Estado
  const categorias = ref<CategoriaDTO[]>([]);
  const currentCategoria = ref<CategoriaDTO | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Utilidad interna para actualizar elementos en la lista local
  function updateLocalItem(updatedItem: CategoriaDTO) {
    const index = categorias.value.findIndex(c => c.id_categoria === updatedItem.id_categoria);
    if (index !== -1) {
      categorias.value[index] = updatedItem;
    }
    if (currentCategoria.value?.id_categoria === updatedItem.id_categoria) {
      currentCategoria.value = updatedItem;
    }
  }

  // Acciones
  async function fetchCategorias(filters?: CategoriaFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await categoriasService.listarCategorias(filters);
      categorias.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategoriasPorConvocatoria(convocatoriaId: number, filters?: CategoriaFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await categoriasService.listarCategoriasPorConvocatoria(convocatoriaId, filters);
      categorias.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategoriaById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await categoriasService.obtenerCategoriaPorId(id);
      currentCategoria.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function createCategoria(data: CategoriaCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await categoriasService.crearCategoria(data);
      categorias.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCategoria(id: number, data: CategoriaUpdateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await categoriasService.actualizarCategoria(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCategoriaEstado(id: number, nuevoEstado: EstadoEntidad) {
    loading.value = true;
    error.value = null;
    try {
      const response = await categoriasService.cambiarEstadoCategoria(id, { estado: nuevoEstado });
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeCategoriaFisica(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await categoriasService.eliminarCategoriaFisica(id);
      categorias.value = categorias.value.filter(c => c.id_categoria !== id);
      if (currentCategoria.value?.id_categoria === id) {
        currentCategoria.value = null;
      }
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    categorias,
    currentCategoria,
    loading,
    error,
    meta,
    fetchCategorias,
    fetchCategoriasPorConvocatoria,
    fetchCategoriaById,
    createCategoria,
    updateCategoria,
    updateCategoriaEstado,
    removeCategoriaFisica
  };
});