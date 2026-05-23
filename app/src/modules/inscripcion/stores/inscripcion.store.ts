import { defineStore } from 'pinia'
import { ref } from 'vue'
import { InscripcionService } from '../services/inscripcion.service'
import type { ColegioFiltroDTO, RegistrarInscripcionDTO,VerificarEstudianteRequestDTO } from '../types/inscripcion.api'

export const useInscripcionStore = defineStore('inscripcion', () => {
  const colegios = ref<ColegioFiltroDTO[]>([])
  const isLoadingColegios = ref(false)
  const isLoadingProceso = ref(false)
  const error = ref<string | null>(null)

  // Carga los colegios en caché local para que el buscador filtre instantáneamente en memoria
  async function loadColegios() {
    if (colegios.value.length > 0) return // Si ya están cargados, evita peticiones dobles
    isLoadingColegios.value = true
    error.value = null
    try {
      const res = await InscripcionService.getColegios()
      colegios.value = res.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar colegios'
    } finally {
      isLoadingColegios.value = false
    }
  }

  // Verifica credenciales iniciales
  async function verificarEstudiante(payload: VerificarEstudianteRequestDTO) {
    isLoadingProceso.value = true
    error.value = null
    try {
      const res = await InscripcionService.verificarEstudiante(payload)
      return res.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error de verificación'
      throw err
    } finally {
      isLoadingProceso.value = false
    }
  }

  // Envía el formulario completo
  async function enviarInscripcion(payload: RegistrarInscripcionDTO) {
    isLoadingProceso.value = true
    error.value = null
    try {
      const res = await InscripcionService.registrarInscripcion(payload)
      return res.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar inscripción'
      throw err
    } finally {
      isLoadingProceso.value = false
    }
  }

  return {
    colegios,
    isLoadingColegios,
    isLoadingProceso,
    error,
    loadColegios,
    verificarEstudiante,
    enviarInscripcion
  }
})