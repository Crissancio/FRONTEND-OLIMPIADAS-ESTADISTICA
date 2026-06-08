import { defineStore } from 'pinia'
import type { NivelEducativo, EstadoPersona } from '../types/estudiantes.api'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | unknown
  }
}

interface EstudiantesState {
  filters: {
    search: string
    estado: EstadoPersona | 'ALL'
    curso: number | 'ALL'
    nivel: NivelEducativo | 'ALL'
    carnet: string | null
    telefono: string | null
    rude: string | null
    mes_nacimiento: number | null
    anio_nacimiento: number | null
    id_colegio: number | null
  }
}

export const useEstudiantesStore = defineStore('estudiantes', {
  state: (): EstudiantesState => ({
    filters: {
      search: '',
      estado: 'ALL',
      curso: 'ALL',
      nivel: 'ALL',
      carnet: null,
      telefono: null,
      rude: null,
      mes_nacimiento: null,
      anio_nacimiento: null,
      id_colegio: null
    }
  }),
  getters: {
    getCleanFilters(state) {
      const clean: Record<string, any> = {}
      
      if (state.filters.search?.trim()) clean.search = state.filters.search.trim()
      if (state.filters.estado !== 'ALL') clean.estado = state.filters.estado
      if (state.filters.curso !== 'ALL') clean.curso = Number(state.filters.curso)
      if (state.filters.nivel !== 'ALL') clean.nivel = state.filters.nivel
      if (state.filters.carnet?.trim()) clean.carnet = state.filters.carnet.trim()
      if (state.filters.telefono?.trim()) clean.telefono = state.filters.telefono.trim()
      if (state.filters.rude?.trim()) clean.rude = state.filters.rude.trim()
      if (state.filters.mes_nacimiento) clean.mes_nacimiento = state.filters.mes_nacimiento
      if (state.filters.anio_nacimiento) clean.anio_nacimiento = state.filters.anio_nacimiento
      if (state.filters.id_colegio) clean.id_colegio = state.filters.id_colegio
      
      return clean
    }
  },
  actions: {
    resetFilters() {
      this.filters = {
        search: '',
        estado: 'ALL',
        curso: 'ALL',
        nivel: 'ALL',
        carnet: null,
        telefono: null,
        rude: null,
        mes_nacimiento: null,
        anio_nacimiento: null,
        id_colegio: null
      }
    }
  },
  persist: true
})