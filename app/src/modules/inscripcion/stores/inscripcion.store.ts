import { defineStore } from 'pinia'
import { ref } from 'vue'
import { publicService } from '@/modules/public/services/public.service'
import type { ColegioPublicoMinifiedDTO } from '@/modules/public/types/public.api'

export const useInscripcionStore = defineStore('inscripcion', () => {
  const colegios = ref<ColegioPublicoMinifiedDTO[]>([])
  const isLoadingColegios = ref(false)

  const loadColegios = async () => {
    // Si ya están cargados, evitamos volver a descargar
    if (colegios.value.length > 0) return 
    
    isLoadingColegios.value = true
    try {
      const response = await publicService.obtenerColegiosMinified()
      colegios.value = response.data || []
    } catch (error) {
      console.error('Error cargando la lista de colegios:', error)
      colegios.value = []
    } finally {
      isLoadingColegios.value = false
    }
  }

  // Método para liberar memoria al salir de la página de inscripción
  const clearColegios = () => {
    colegios.value = []
  }

  return {
    colegios,
    isLoadingColegios,
    loadColegios,
    clearColegios
  }
})