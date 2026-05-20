import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { PublicService } from '@/modules/public/services/public.service'
import type {
  ColaboradorResponseDTO,
  ConvocatoriaDetalleDTO,
  InicioResponseDTO,
  TipoColaborador
} from '@/modules/public/types/public.api'

export const usePublicStore = defineStore('public', () => {
  const inicio = ref<InicioResponseDTO | null>(null)
  const detalleById = ref<Record<number, ConvocatoriaDetalleDTO>>({})
  const personalByTipo = ref<Record<TipoColaborador, ColaboradorResponseDTO[]>>({
    'PERSONAL ACADEMICO': [],
    ADMINISTRATIVO: [],
    COLABORADOR: [],
  })
  const isLoadingInicio = ref(false)
  const isLoadingDetalle = ref(false)
  const isLoadingPersonal = ref(false)
  const error = ref<string | null>(null)

  const convocatoriaInicio = computed(() => inicio.value?.convocatoria ?? null)

  async function loadInicio() {
    isLoadingInicio.value = true
    error.value = null
    try {
      const res = await PublicService.getInicio()
      inicio.value = res.data
      return res.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando inicio'
      throw err
    } finally {
      isLoadingInicio.value = false
    }
  }

  async function loadDetalle(convocatoriaId: number) {
    isLoadingDetalle.value = true
    error.value = null
    try {
      const res = await PublicService.getConvocatoriaDetalle(convocatoriaId)
      detalleById.value = { ...detalleById.value, [convocatoriaId]: res.data }
      return res.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando convocatoria'
      throw err
    } finally {
      isLoadingDetalle.value = false
    }
  }

  async function loadPersonal(tipo: TipoColaborador) {
    isLoadingPersonal.value = true
    error.value = null
    try {
      const res = await PublicService.getPersonal(tipo)
      personalByTipo.value[tipo] = res.data
      return res.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando personal'
      throw err
    } finally {
      isLoadingPersonal.value = false
    }
  }

  return {
    inicio,
    detalleById,
    personalByTipo,
    isLoadingInicio,
    isLoadingDetalle,
    isLoadingPersonal,
    error,
    convocatoriaInicio,
    loadInicio,
    loadDetalle,
    loadPersonal,
  }
})
