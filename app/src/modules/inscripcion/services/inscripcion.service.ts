import { apiClient } from '@/app/api/api-client' 

export const InscripcionService = {

  async verificarEstudiante(ci: string, fechaNacimiento: string) {
    const res = await apiClient.post('/inscripciones/verificar-estudiante', {
      carnet_identidad: ci,
      fecha_nacimiento: fechaNacimiento
    })

    return res.data
  },

  async getColegios() {
    const res = await apiClient.get('/public/colegios')
    return res.data
  },


  async registrarInscripcion(data: any) {
    const res = await apiClient.post('/inscripciones/formulario', data)
    return res.data
  }
}