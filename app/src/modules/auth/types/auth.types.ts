export type ResponseBase<T> = {
  success?: boolean
  data: T
  message: string
}

export type LoginDTO = {
  correo: string
  contrasena: string
}

export type UsuarioAutenticadoDTO = {
  id_administrador: number
  nombre: string
  correo: string
  estado: string
}

export type TokenDataDTO = {
  access_token: string
  token_type?: string
  expires_in: number
  usuario: UsuarioAutenticadoDTO
}

export type LogoutResponseDTO = {
  logout: boolean
}

export type AdminCreateDTO = {
  nombre: string
  correo: string
  contrasena: string
}

export type CambiarContrasenaDTO = {
  contrasena_actual: string
  nueva_contrasena: string
  repetir_nueva_contrasena: string
}

export type CambiarContrasenaResponseDTO = {
  actualizado: boolean
}
