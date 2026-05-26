import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { AuthService } from '@/modules/auth/services/auth.service'
import type { AdminCreateDTO, CambiarContrasenaDTO, LoginDTO, UsuarioAutenticadoDTO } from '@/modules/auth/types/auth.types'
import { toApiError } from '@/app/api/api-error'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'auth_user'

const readStoredUser = (): UsuarioAutenticadoDTO | null => {
  const raw = sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UsuarioAutenticadoDTO
  } catch {
    sessionStorage.removeItem(USER_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UsuarioAutenticadoDTO | null>(readStoredUser())
  const token = ref<string | null>(sessionStorage.getItem(TOKEN_KEY) || null)
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => !!user.value)

  function setSession(next: { token: string; user?: UsuarioAutenticadoDTO | null }) {
    token.value = next.token
    user.value = next.user ?? null
    sessionStorage.setItem(TOKEN_KEY, next.token)
    if (next.user) sessionStorage.setItem(USER_KEY, JSON.stringify(next.user))
    else sessionStorage.removeItem(USER_KEY)
  }

  async function login(credentials: LoginDTO) {
    status.value = 'loading'
    error.value = null

    try {
      const response = await AuthService.login(credentials)
      setSession({
        token: response.data.access_token,
        user: response.data.usuario,
      })
      status.value = 'idle'
    } catch (e) {
      status.value = 'error'
      error.value = toApiError(e).message
      clearSession()
      throw e
    }
  }

  async function fetchMe() {
    status.value = 'loading'
    error.value = null
    try {
      const response = await AuthService.me()
      user.value = response.data
      sessionStorage.setItem(USER_KEY, JSON.stringify(response.data))
      status.value = 'idle'
      return response.data
    } catch (e) {
      status.value = 'error'
      error.value = toApiError(e).message
      clearSession()
      throw e
    }
  }

  async function registrarAdmin(payload: AdminCreateDTO) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await AuthService.registrarAdmin(payload)
      status.value = 'idle'
      return response.data
    } catch (e) {
      status.value = 'error'
      error.value = toApiError(e).message
      throw e
    }
  }

  async function cambiarContrasena(payload: CambiarContrasenaDTO) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await AuthService.cambiarContrasena(payload)
      status.value = 'idle'
      return response.data
    } catch (e) {
      status.value = 'error'
      error.value = toApiError(e).message
      throw e
    }
  }

  function clearSession() {
    user.value = null
    token.value = null
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  }

  async function logout() {
    try {
      await AuthService.logout()
    } finally {
      clearSession()
    }
  }

  return {
    user,
    token,
    status,
    error,
    isAuthenticated,
    isAdmin,
    login,
    fetchMe,
    registrarAdmin,
    cambiarContrasena,
    logout,
    setSession,
    clearSession
  }
})
