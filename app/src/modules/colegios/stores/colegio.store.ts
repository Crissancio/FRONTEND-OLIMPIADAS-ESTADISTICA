import { defineStore } from 'pinia'
import type { ColegioDTO, ColegioFilters } from '../types/colegios.api'

export const useColegiosStore = defineStore('colegios', {
  state: () => ({
    listaAcumulada: [] as ColegioDTO[],
    currentFilters: {} as ColegioFilters
  }),
  actions: {
    limpiarCache() {
      this.listaAcumulada = []
      this.currentFilters = {}
    }
  }
})