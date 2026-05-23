import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ContactoService } from '../services/contacto.service'
import type { ContactoRequestDTO } from '../types/contacto.api'

export const useContactoStore = defineStore('contacto', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isSuccess = ref(false)

  const enviarContacto = async (data: ContactoRequestDTO) => {
    isLoading.value = true
    error.value = null
    isSuccess.value = false
    
    try {
      await ContactoService.enviarMensaje(data)
      isSuccess.value = true
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Hubo un error al enviar tu mensaje. Intenta nuevamente.'
    } finally {
      isLoading.value = false
    }
  }

  const resetState = () => {
    isSuccess.value = false
    error.value = null
  }

  return { 
    isLoading, 
    error, 
    isSuccess, 
    enviarContacto,
    resetState
  }
})