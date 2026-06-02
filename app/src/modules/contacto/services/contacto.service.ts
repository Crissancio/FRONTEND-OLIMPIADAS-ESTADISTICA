import { customInstance } from '@/app/api/mutator';
import type {
  ContactoRequestDTO,
  ContactoRespuestaCreateDTO,
  ContactoFilters,
  ContactoRespondidoFilters,
  PaginatedContactoResponse,
  PaginatedContactoCompletoResponse,
  ContactoResponse,
  ContactoCompletoResponse,
  BaseNoneResponse
} from '../types/contacto.api';

export const contactoService = {
  // ================= PÚBLICO (USUARIO) =================
  crearContacto(data: ContactoRequestDTO) {
    return customInstance<ContactoResponse>({
      url: '/api/v1/contactos',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data
    });
  },

  // ================= ADMINISTRATIVO =================
  listarContactos(params?: ContactoFilters) {
    return customInstance<PaginatedContactoResponse>({
      url: '/api/v1/contactos',
      method: 'GET',
      params
    });
  },

  listarContactosRespondidos(params?: ContactoRespondidoFilters) {
    return customInstance<PaginatedContactoCompletoResponse>({
      url: '/api/v1/contactos/respondidos',
      method: 'GET',
      params
    });
  },

  obtenerContactoPorId(contactoId: number) {
    return customInstance<ContactoCompletoResponse>({
      url: `/api/v1/contactos/${contactoId}`,
      method: 'GET'
    });
  },

  marcarContactoLeido(contactoId: number) {
    return customInstance<ContactoResponse>({
      url: `/api/v1/contactos/${contactoId}/marcar-leido`,
      method: 'PATCH'
    });
  },

  responderContacto(contactoId: number, data: ContactoRespuestaCreateDTO) {
    return customInstance<ContactoCompletoResponse>({
      url: `/api/v1/contactos/${contactoId}/responder`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data
    });
  },

  eliminarContacto(contactoId: number) {
    return customInstance<BaseNoneResponse>({
      url: `/api/v1/contactos/${contactoId}`,
      method: 'DELETE'
    });
  }
};