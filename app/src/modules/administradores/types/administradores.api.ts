// Si PaginationMeta ya lo tienes en '@/shared/types/api.types', puedes importarlo de ahí.
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export type EstadoAdministrador = 'ACTIVO' | 'INACTIVO';

// Entidad Principal
export interface AdministradorDTO {
  id_administrador: number;
  nombre: string;
  correo: string;
  estado: EstadoAdministrador;
}

export type AdministradorResponseDTO = AdministradorDTO;

// DTOs de mutación
export interface AdministradorCreateDTO {
  nombre: string;
  correo: string;
  contrasena: string;
}

export interface AdministradorUpdateDTO {
  nombre?: string | null;
  correo?: string | null;
}

// Filtros para listados
export interface AdministradorFilters {
  page?: number;
  limit?: number;
  nombre?: string | null;
  correo?: string | null;
}

// Wrappers de Respuesta (Lo que FastAPI devuelve con su success, data, message)
export interface AdministradorResponse {
  success?: boolean;
  data: AdministradorDTO;
  message: string;
}

export interface PaginatedAdministradorResponse {
  success?: boolean;
  data: {
    items: AdministradorDTO[];
    meta: PaginationMeta;
  };
  message: string;
}
