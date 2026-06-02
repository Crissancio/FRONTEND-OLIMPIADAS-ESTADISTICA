import { defineStore } from 'pinia';
import { ref } from 'vue';
import { contactoService } from '../services/contacto.service';
import type {
  ContactoDTO,
  ContactoCompletoDTO,
  ContactoFilters,
  ContactoRespondidoFilters,
  ContactoRequestDTO,
  ContactoRespuestaCreateDTO
} from '../types/contacto.api';
import type { PaginationMeta } from '@/shared/types/api.types';
import type { ApiError } from '@/app/api/api-error';

export const useContactoStore = defineStore('contacto', () => {
  // ================= ESTADO =================
  // Lista general
  const contactos = ref<ContactoDTO[]>([]);
  const meta = ref<PaginationMeta>({ page: 1, limit: 10, total: 0, total_pages: 0 });
  
  // Lista de respondidos
  const contactosRespondidos = ref<ContactoCompletoDTO[]>([]);
  const metaRespondidos = ref<PaginationMeta>({ page: 1, limit: 10, total: 0, total_pages: 0 });

  const currentContacto = ref<ContactoCompletoDTO | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);

  // Helper local para actualizar listas tras una acción
  function updateLocalItem(updatedItem: ContactoDTO | ContactoCompletoDTO) {
    const index = contactos.value.findIndex(c => c.id_contacto === updatedItem.id_contacto);
    if (index !== -1) {
      // Forzamos el tipado porque la lista general usa ContactoDTO
      contactos.value[index] = { ...contactos.value[index], ...updatedItem };
    }
    
    if (currentContacto.value?.id_contacto === updatedItem.id_contacto) {
      currentContacto.value = { ...currentContacto.value, ...updatedItem };
    }
  }

  // ================= ACCIONES: PÚBLICAS =================
  async function submitContactoForm(data: ContactoRequestDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await contactoService.crearContacto(data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ================= ACCIONES: ADMIN - LECTURA =================
  async function fetchContactos(filters?: ContactoFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await contactoService.listarContactos(filters);
      contactos.value = response.data.items;
      meta.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchContactosRespondidos(filters?: ContactoRespondidoFilters) {
    loading.value = true;
    error.value = null;
    try {
      const response = await contactoService.listarContactosRespondidos(filters);
      contactosRespondidos.value = response.data.items;
      metaRespondidos.value = response.data.meta;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  async function fetchContactoById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await contactoService.obtenerContactoPorId(id);
      currentContacto.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
    } finally {
      loading.value = false;
    }
  }

  // ================= ACCIONES: ADMIN - MODIFICACIÓN =================
  async function marcarLeido(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await contactoService.marcarContactoLeido(id);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function responder(id: number, data: ContactoRespuestaCreateDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await contactoService.responderContacto(id, data);
      updateLocalItem(response.data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteContacto(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await contactoService.eliminarContacto(id);
      contactos.value = contactos.value.filter(c => c.id_contacto !== id);
      contactosRespondidos.value = contactosRespondidos.value.filter(c => c.id_contacto !== id);
      
      if (currentContacto.value?.id_contacto === id) currentContacto.value = null;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    contactos,
    contactosRespondidos,
    currentContacto,
    meta,
    metaRespondidos,
    loading,
    error,
    
    // Público
    submitContactoForm,
    
    // Admin Lectura
    fetchContactos,
    fetchContactosRespondidos,
    fetchContactoById,
    
    // Admin Mutaciones
    marcarLeido,
    responder,
    deleteContacto
  };
});