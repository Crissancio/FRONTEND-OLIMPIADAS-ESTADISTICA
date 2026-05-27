import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ColaboradoresService } from '../services/colaboradores.service'
import type { PaginationMeta } from '@/shared/types/api.types'
import type { 
  ColaboradorResponseDTO, 
  GetColaboradoresParams, 
  ColaboradorPayload 
} from '../types/colaboradores.api'

export const useColaboradoresStore = defineStore('colaboradores', () => {
  const colaboradores = ref<ColaboradorResponseDTO[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  
  const colaboradorActual = ref<ColaboradorResponseDTO | null>(null)

  const fetchColaboradores = async (params?: GetColaboradoresParams) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ColaboradoresService.listar(params)
      colaboradores.value = response.data.items
      meta.value = response.data.meta
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Error al obtener los colaboradores'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchColaborador = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ColaboradoresService.obtener(id)
      colaboradorActual.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Error al obtener el colaborador'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createColaborador = async (payload: ColaboradorPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ColaboradoresService.crear(payload)
      return response.data
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Error al crear colaborador'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateColaborador = async (id: number, payload: Partial<ColaboradorPayload>) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ColaboradoresService.actualizar(id, payload)
      return response.data
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Error al actualizar colaborador'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleAltaBaja = async (id: number, isAlta: boolean) => {
    isLoading.value = true
    error.value = null
    try {
      if (isAlta) {
        await ColaboradoresService.darAlta(id)
      } else {
        await ColaboradoresService.darBaja(id)
      }
      if (colaboradorActual.value && colaboradorActual.value.id_colaborador === id) {
        colaboradorActual.value.estado = isAlta ? 'ACTIVO' : 'INACTIVO' // Asume esos textos para los estados
      }

      const index = colaboradores.value.findIndex(c => c.id_colaborador === id)
      if (index !== -1) {
        colaboradores.value[index].estado = isAlta ? 'ACTIVO' : 'INACTIVO'
      }
    } catch (err: any) {
      error.value = err?.response?.data?.message || `Error al dar de ${isAlta ? 'alta' : 'baja'}`
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteColaborador = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await ColaboradoresService.eliminar(id)
      colaboradores.value = colaboradores.value.filter(c => c.id_colaborador !== id)
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Error al eliminar colaborador'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    colaboradores,
    meta,
    isLoading,
    error,
    colaboradorActual,
    fetchColaboradores,
    fetchColaborador,
    createColaborador,
    updateColaborador,
    toggleAltaBaja,
    deleteColaborador
  }
})