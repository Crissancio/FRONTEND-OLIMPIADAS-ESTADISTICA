import { customInstance } from '@/app/api/mutator';
import type {
  LoginDTO,
  AdminCreateDTO,
  CambiarContrasenaDTO,
  LoginResponse,
  AuthMeResponse,
  CambiarContrasenaResponse,
  LogoutResponse
} from '../types/auth.api';

export const authService = {
  login(data: LoginDTO) {
    return customInstance<LoginResponse>({
      url: '/api/v1/auth/login',
      method: 'POST',
      data
    });
  },

  registrarAdmin(data: AdminCreateDTO) {
    return customInstance<AuthMeResponse>({
      url: '/api/v1/auth/admins',
      method: 'POST',
      data
    });
  },

  obtenerUsuarioLogueado() {
    return customInstance<AuthMeResponse>({
      url: '/api/v1/auth/me',
      method: 'GET'
    });
  },

  cambiarContrasena(data: CambiarContrasenaDTO) {
    return customInstance<CambiarContrasenaResponse>({
      url: '/api/v1/auth/me/password',
      method: 'PATCH',
      data
    });
  },

  logout() {
    return customInstance<LogoutResponse>({
      url: '/api/v1/auth/logout',
      method: 'POST'
    });
  }
};