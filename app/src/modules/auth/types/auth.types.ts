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
