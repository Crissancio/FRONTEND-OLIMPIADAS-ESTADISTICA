import { apiClient } from '@/app/api/api-client'
import type {
  AdminCreateDTO,
  CambiarContrasenaDTO,
  CambiarContrasenaResponseDTO,
  LoginDTO,
  LogoutResponseDTO,
  ResponseBase,
  TokenDataDTO,
  UsuarioAutenticadoDTO
} from '../types/auth.types'

export const AuthService = {
  async login(payload: LoginDTO): Promise<ResponseBase<TokenDataDTO>> {
    const { data } = await apiClient.post<ResponseBase<TokenDataDTO>>('/auth/login', payload)
    return data
  },

  async registrarAdmin(payload: AdminCreateDTO): Promise<ResponseBase<UsuarioAutenticadoDTO>> {
    const { data } = await apiClient.post<ResponseBase<UsuarioAutenticadoDTO>>('/auth/admins', payload)
    return data
  },

  async me(): Promise<ResponseBase<UsuarioAutenticadoDTO>> {
    const { data } = await apiClient.get<ResponseBase<UsuarioAutenticadoDTO>>('/auth/me')
    return data
  },

  async cambiarContrasena(payload: CambiarContrasenaDTO): Promise<ResponseBase<CambiarContrasenaResponseDTO>> {
    const { data } = await apiClient.patch<ResponseBase<CambiarContrasenaResponseDTO>>('/auth/me/password', payload)
    return data
  },

  async logout(): Promise<ResponseBase<LogoutResponseDTO>> {
    const { data } = await apiClient.post<ResponseBase<LogoutResponseDTO>>('/auth/logout')
    return data
  }
}
