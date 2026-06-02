import type { PaginationMeta } from '@/shared/types/api.types';

// ==========================================
// 1. UNIONS / ENUMS CONSTANTES
// ==========================================
export type EstadoContacto = 'PENDIENTE' | 'RESPONDIDO' | 'LEIDO';
export type EstadoEmail = 'PENDIENTE' | 'EN_PROCESO' | 'ENVIADO' | 'FALLIDO';

// ==========================================
// 2. PARÁMETROS DE FILTRADO
// ==========================================
export interface ContactoFilters {
  page?: number;
  limit?: number;
  correo_electronico?: string | null;
  estado?: EstadoContacto | null;
  creacion_start?: string | null;
  creacion_end?: string | null;
  cambio_start?: string | null;
  cambio_end?: string | null;
}

export interface ContactoRespondidoFilters {
  page?: number;
  limit?: number;
  cambio_start?: string | null;
  cambio_end?: string | null;
  estado_email?: EstadoEmail | null;
}

// ==========================================
// 3. ENTIDADES PRINCIPALES (DTOs de Respuesta)
// ==========================================
export interface EmailLogDTO {
  // Placeholder basado en tu comentario uwu
  id_email_log?: number;
  estado_email?: EstadoEmail;
  fecha_envio?: string;
  [key: string]: unknown; // Permite propiedades adicionales si las hay
}

export interface ContactoDTO {
  id_contacto: number;
  nombre_completo: string;
  correo_electronico: string;
  asunto: string;
  mensaje: string;
  estado: EstadoContacto;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ContactoCompletoDTO extends ContactoDTO {
  email_logs?: EmailLogDTO[];
}

// ==========================================
// 4. PAYLOADS DE PETICIÓN (REQUEST)
// ==========================================
export interface ContactoRequestDTO {
  nombre_completo: string;
  correo_electronico: string;
  asunto: string;
  mensaje: string;
  username_hp?: string; // Honeypot o similar
  cf_turnstile_response?: string; // Cloudflare captcha
}

export interface EnlaceDTO {
  url: string;
  texto: string;
}

export interface ContactoRespuestaCreateDTO {
  asunto_correo: string;
  contenido_mensaje: string;
  contenido_secundario?: string | null;
  enlaces?: EnlaceDTO[] | null;
}

// ==========================================
// 5. WRAPPERS DE RESPUESTA DE API
// ==========================================
export interface PaginatedContactoResponse {
  success?: boolean;
  data: {
    items: ContactoDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface PaginatedContactoCompletoResponse {
  success?: boolean;
  data: {
    items: ContactoCompletoDTO[];
    meta: PaginationMeta;
  };
  message: string;
}

export interface ContactoResponse {
  success?: boolean;
  data: ContactoDTO;
  message: string;
}

export interface ContactoCompletoResponse {
  success?: boolean;
  data: ContactoCompletoDTO;
  message: string;
}

export interface BaseNoneResponse {
  success?: boolean;
  data: null;
  message: string;
}