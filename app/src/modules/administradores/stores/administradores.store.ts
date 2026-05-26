import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { toApiError } from '@/app/api/api-error'
import { AdministradoresService } from '../services/administradores.service'
import type {
  AdministradorCreateDTO,
  AdministradorResponseDTO,
  AdministradorUpdateDTO,
  AdministradoresListParams,
  PaginationMeta
} from '../types/administradores.api'

const emptyMeta = (): PaginationMeta => ({
  page: 1,
  limit: 10,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
})

export const useAdministradoresStore = defineStore('administradores', () => {
  const items = ref<AdministradorResponseDTO[]>([])
  const selected = ref<AdministradorResponseDTO | null>(null)
  const meta = ref<PaginationMeta>(emptyMeta())
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const total = computed(() => meta.value.total)

  async function list(params: AdministradoresListParams = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await AdministradoresService.list(params)
      items.value = response.data.items
      meta.value = response.data.meta
      return response.data
    } catch (err) {
      error.value = toApiError(err).message
      items.value = []
      meta.value = emptyMeta()
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getById(administradorId: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await AdministradoresService.getById(administradorId)
      selected.value = response.data
      return response.data
    } catch (err) {
      error.value = toApiError(err).message
      selected.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(payload: AdministradorCreateDTO) {
    isSaving.value = true
    error.value = null
    try {
      const response = await AdministradoresService.create(payload)
      items.value = [response.data, ...items.value]
      meta.value = { ...meta.value, total: meta.value.total + 1 }
      return response.data
    } catch (err) {
      error.value = toApiError(err).message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function update(administradorId: number, payload: AdministradorUpdateDTO) {
    isSaving.value = true
    error.value = null
    try {
      const response = await AdministradoresService.update(administradorId, payload)
      items.value = items.value.map((item) => item.id_administrador === administradorId ? response.data : item)
      if (selected.value?.id_administrador === administradorId) selected.value = response.data
      return response.data
    } catch (err) {
      error.value = toApiError(err).message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function remove(administradorId: number) {
    isSaving.value = true
    error.value = null
    try {
      const response = await AdministradoresService.remove(administradorId)
      items.value = items.value.filter((item) => item.id_administrador !== administradorId)
      meta.value = { ...meta.value, total: Math.max(0, meta.value.total - 1) }
      if (selected.value?.id_administrador === administradorId) selected.value = null
      return response.data
    } catch (err) {
      error.value = toApiError(err).message
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function baja(administradorId: number) {
    const updated = await AdministradoresService.baja(administradorId)
    items.value = items.value.map((item) => item.id_administrador === administradorId ? updated.data : item)
    if (selected.value?.id_administrador === administradorId) selected.value = updated.data
    return updated.data
  }

  async function alta(administradorId: number) {
    const updated = await AdministradoresService.alta(administradorId)
    items.value = items.value.map((item) => item.id_administrador === administradorId ? updated.data : item)
    if (selected.value?.id_administrador === administradorId) selected.value = updated.data
    return updated.data
  }

  return {
    items,
    selected,
    meta,
    total,
    isLoading,
    isSaving,
    error,
    list,
    getById,
    create,
    update,
    remove,
    baja,
    alta,
  }
})
