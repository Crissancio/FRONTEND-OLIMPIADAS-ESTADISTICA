import { computed } from 'vue'
import { defineStore } from 'pinia'
import { usePersonasStore } from '@/modules/personas/stores/personas.store'
import type { DirectorCreateDTO, DirectorUpdateDTO } from '@/modules/personas/types/personas.api'

export const useDirectoresStore = defineStore('directores', () => {
  const personasStore = usePersonasStore()

  const directoresMinificados = computed(() =>
    personasStore.directoresCorta.map((director) => ({
      ...director,
      nombres_completos: director.nombres_completos ?? `${director.nombres} ${director.paterno ?? ''} ${director.materno ?? ''}`.trim(),
    }))
  )

  const fetchDirectoresMinificados = () => personasStore.fetchDirectoresCorta()
  const createDirector = (payload: DirectorCreateDTO) => personasStore.createDirector(payload)
  const updateDirector = (id: number, payload: DirectorUpdateDTO) => personasStore.updateDirector(id, payload)

  return {
    directoresMinificados,
    fetchDirectoresMinificados,
    createDirector,
    updateDirector,
  }
})
