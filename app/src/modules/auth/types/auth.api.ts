// Tipos de las entidades (Payloads limpios)
export interface UsuarioAutenticado {
  id_administrador: number;
  nombre: string;
  correo: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface TokenData {
  access_token: string;
  token_type?: string;
  expires_in: number;
  usuario: UsuarioAutenticado;
}

// DTOs para peticiones (Lo que envías)
export interface LoginDTO {
  correo: string;
  contrasena: string;
  cf_turnstile_response: string;
  username_hp?: string;
}

export interface AdminCreateDTO {
  nombre: string;
  correo: string;
  contrasena: string;
}

export interface CambiarContrasenaDTO {
  contrasena_actual: string;
  nueva_contrasena: string;
  repetir_nueva_contrasena: string;
}

// DTOs de Respuestas (Lo que recibes del mutator)
export interface LoginResponse {
  success?: boolean;
  data: TokenData;
  message: string;
}

export interface AuthMeResponse {
  success?: boolean;
  data: UsuarioAutenticado;
  message: string;
}

export interface CambiarContrasenaResponse {
  success?: boolean;
  data: { actualizado: boolean };
  message: string;
}

export interface LogoutResponse {
  success?: boolean;
  data: { logout: boolean };
  message: string;
}