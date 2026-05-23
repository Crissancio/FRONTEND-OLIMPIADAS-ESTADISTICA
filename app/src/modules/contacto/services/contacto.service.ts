import { apiClient } from '@/app/api/api-client'
import type { ContactoRequestDTO } from '../types/contacto.api'

export const ContactoService = {
  enviarMensaje: async (data: ContactoRequestDTO) => {
    const response = await apiClient.post('/contactos', data)
    return response.data
  }
}