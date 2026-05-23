import { apiClient } from '@/app/api/api-client' 
import type { VerificarEstudianteRequestDTO, RegistrarInscripcionDTO } from '../types/inscripcion.api'

export const InscripcionService = {

  async verificarEstudiante(data: VerificarEstudianteRequestDTO) {
    const res = await apiClient.post('/inscripciones/verificar-estudiante', data)
    return res.data
  },

  async getColegios() {
    const res = await apiClient.get('/public/colegios')
    return res.data
  },


  async registrarInscripcion(data: RegistrarInscripcionDTO) {
    const res = await apiClient.post('/inscripciones/formulario', data)
    return res.data
  }
}