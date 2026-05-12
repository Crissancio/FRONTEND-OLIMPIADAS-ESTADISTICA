import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { AuthService } from '@/modules/auth/services/auth.service'
import type { LoginDTO, UsuarioAutenticadoDTO } from '@/modules/auth/types/auth.types'
import { toApiError } from '@/app/api/api-error'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UsuarioAutenticadoDTO | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token') || null)
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => !!user.value)

  function setSession(next: { token: string; user?: UsuarioAutenticadoDTO | null }) {
    token.value = next.token
    user.value = next.user ?? null
    localStorage.setItem('access_token', next.token)
  }

  async function login(credentials: LoginDTO) {
    status.value = 'loading'
    error.value = null

    try {
      const response = await AuthService.login(credentials)
      token.value = response.data.access_token
      user.value = response.data.usuario
      localStorage.setItem('access_token', response.data.access_token)
      status.value = 'idle'
    } catch (e) {
      status.value = 'error'
      error.value = toApiError(e).message
      clearSession()
      throw e
    }
  }

  function clearSession() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
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
    logout,
    setSession,
    clearSession
  }
})
