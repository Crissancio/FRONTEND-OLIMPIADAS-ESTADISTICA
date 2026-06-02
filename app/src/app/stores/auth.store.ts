import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/modules/auth/services/auth.service';
import { STORAGE_KEYS } from '@/app/api/constants';
import type { 
  LoginDTO, 
  CambiarContrasenaDTO, 
  UsuarioAutenticado 
} from '@/modules/auth/types/auth.api';
import type { ApiError } from '@/app/api/api-error';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<UsuarioAutenticado | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<ApiError | null>(null);

  // Getters (Propiedades Computadas)
  const isAuthenticated = computed(() => !!user.value);

  // Acciones
  async function login(credentials: LoginDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.login(credentials);
      
      const { access_token, usuario } = response.data;
      
      // Guardamos el token en sessionStorage usando la constante
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      
      // Opcional: Si quieres guardar datos básicos del usuario en storage
      sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(usuario));

      // Actualizamos el estado de Pinia
      user.value = usuario;
      
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCurrentUser() {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.obtenerUsuarioLogueado();
      user.value = response.data;
    } catch (err) {
      error.value = err as ApiError;
      // Si falla obtener el usuario (ej. token expirado), limpiamos la sesión
      clearSession();
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(data: CambiarContrasenaDTO) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.cambiarContrasena(data);
      return response.data;
    } catch (err) {
      error.value = err as ApiError;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error durante el logout en el servidor', err);
    } finally {
      // Independientemente de si el servidor falla o no, cerramos la sesión local
      clearSession();
      loading.value = false;
    }
  }

  // Función auxiliar privada
  function clearSession() {
    user.value = null;
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }

  // Cargar usuario desde sessionStorage al inicializar el store (opcional)
  function init() {
    const storedUser = sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        clearSession();
      }
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchCurrentUser,
    changePassword,
    init
  };
});