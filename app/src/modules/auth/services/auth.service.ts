import { apiClient } from '@/app/api/api-client'
import type {
  LoginDTO,
  LogoutResponseDTO,
  ResponseBase,
  TokenDataDTO
} from '../types/auth.types'

export const AuthService = {
  async login(payload: LoginDTO): Promise<ResponseBase<TokenDataDTO>> {
    const { data } = await apiClient.post<ResponseBase<TokenDataDTO>>('/auth/login', payload)
    return data
  },

  async logout(): Promise<ResponseBase<LogoutResponseDTO>> {
    const { data } = await apiClient.post<ResponseBase<LogoutResponseDTO>>('/auth/logout')
    return data
  }
}
