import { ref } from 'vue'
import type { AdminConvocatoria } from '@/modules/admin/data/admin.data'
import {
  getConvocatorias,
  getConvocatoriaById,
  createConvocatoria as createConv,
  updateConvocatoria as updateConv,
} from '@/modules/admin/services/convocatoria.service'

export const useConvocatorias = () => {
  const convocatorias = ref<AdminConvocatoria[]>([])
  const isLoading = ref(true)

  const refresh = () => {
    convocatorias.value = getConvocatorias()
    isLoading.value = false
  }

  const createConvocatoria = (
    payload: Omit<AdminConvocatoria, 'id' | 'inscritos' | 'categorias' | 'fases'>,
  ) => {
    const created = createConv(payload)
    refresh()
    return created
  }

  const updateConvocatoria = (id: string, updates: Partial<AdminConvocatoria>) => {
    const updated = updateConv(id, updates)
    refresh()
    return updated
  }

  refresh()

  return {
    convocatorias,
    isLoading,
    refresh,
    createConvocatoria,
    updateConvocatoria,
  }
}

export const useConvocatoria = (id?: string) => {
  const convocatoria = ref<AdminConvocatoria | undefined>(undefined)
  const isLoading = ref(true)

  const refresh = () => {
    if (!id) {
      convocatoria.value = undefined
      isLoading.value = false
      return
    }
    convocatoria.value = getConvocatoriaById(id)
    isLoading.value = false
  }

  const update = (updates: Partial<AdminConvocatoria>) => {
    if (!id) return null
    const updated = updateConv(id, updates)
    convocatoria.value = updated ?? undefined
    return updated
  }

  refresh()

  return {
    convocatoria,
    isLoading,
    refresh,
    update,
  }
}
