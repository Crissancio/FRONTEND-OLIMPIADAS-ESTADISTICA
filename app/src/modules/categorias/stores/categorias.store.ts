import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoriasService } from '../services/categorias.service'
import type { 
  CategoriaDTO, 
  CategoriaCreateDTO,
  CategoriaFilters 
} from '../types/categorias.api'

export const useCategoriasStore = defineStore('categorias', () => {
  const categorias = ref<CategoriaDTO[]>([])
  const loading = ref<boolean>(false)

  const fetchCategorias = async (convocatoriaId: number, params?: CategoriaFilters) => {
    loading.value = true
    try {
      const response = await categoriasService.listarCategoriasPorConvocatoria(convocatoriaId, params)
      if (response.data && response.data.items) {
        categorias.value = response.data.items
      }
    } catch (error) {
      console.error('Error al cargar las categorías:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const crearYAgregarCategoria = async (data: CategoriaCreateDTO) => {
    loading.value = true
    try {
      const response = await categoriasService.crearCategoria(data)
      if (response.data) {
        categorias.value.push(response.data)
      }
      return response.data
    } catch (error) {
      console.error('Error al crear la categoría:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const agregarCategoriaLocal = (nuevaCategoria: CategoriaDTO) => {
    categorias.value.push(nuevaCategoria)
  }

  const clearCategorias = () => {
    categorias.value = []
  }

  return {
    categorias,
    loading,
    fetchCategorias,
    crearYAgregarCategoria,
    agregarCategoriaLocal,
    clearCategorias
  }
})