<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/app/stores/auth.store'
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-vue-next'
import { toApiError } from '@/app/api/api-error'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import StatusAlert from '@/shared/components/ui/molecules/StatusAlert.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const errorStatusCode = ref<number | undefined>(undefined)
const isLoading = ref(false)
const showPassword = ref(false)
const logoOpeSrc = `${import.meta.env.BASE_URL}logo-ope.svg`

const getLoginErrorMessage = (status?: number, fallback?: string) => {
  if (status === 400) return 'Los datos enviados no tienen el formato esperado. Revisa el correo y la contraseña.'
  if (status === 401) return 'Correo o contraseña incorrectos. Verifica tus credenciales e intenta nuevamente.'
  if (status === 403) return 'Tu usuario no tiene permisos para ingresar al panel de administración.'
  if (status === 404) return 'No encontramos una cuenta administrativa con esos datos.'
  if (status === 422) return 'Hay campos incompletos o inválidos. Revisa la información ingresada.'
  if (status && status >= 500) return 'El servidor no respondió correctamente. Intenta nuevamente en unos minutos.'
  return fallback || 'No se pudo iniciar sesión. Intenta nuevamente.'
}

const handleLogin = async () => {
  error.value = ''
  errorStatusCode.value = undefined
  isLoading.value = true

  try {
    await authStore.login({ correo: email.value, contrasena: password.value })
    router.push('/admin')
  } catch (e) {
    const apiError = toApiError(e)
    errorStatusCode.value = apiError.status
    error.value = getLoginErrorMessage(apiError.status, authStore.error ?? apiError.message)
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-primary lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
    <div v-if="error" class="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-md">
      <StatusAlert
        :status-code="errorStatusCode"
        title="No se pudo iniciar sesión"
        :message="error"
      />
    </div>

    <section class="relative hidden min-h-screen overflow-hidden bg-background text-text-main lg:flex lg:items-center lg:justify-center lg:p-12">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,166,35,0.18),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(0,176,216,0.14),transparent_26%)]" />
      <div class="absolute inset-y-0 right-0 w-px bg-primary/10" />

      <div class="relative z-10 flex max-w-2xl flex-col items-center text-center">
        <img :src="logoOpeSrc" alt="Logo OPE 2026" class="mb-8 w-full max-w-md drop-shadow-2xl" />
        <h1 class="font-heading text-4xl font-black uppercase leading-tight tracking-[0.12em] text-accent xl:text-5xl">
          Olimpiada Paceña de Estadística
        </h1>
      </div>
    </section>

    <section class="flex min-h-screen flex-col justify-center bg-primary px-4 py-8 sm:px-6 lg:px-12">
      <div class="mx-auto w-full max-w-md">
        <div class="mb-5">
          <Button
            as="router-link"
            to="/"
            variant="ghost"
            class="flex items-center gap-2 rounded-xl font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft class="h-4 w-4" />
            Volver a Inicio
          </Button>
        </div>

        <div class="mb-8 text-center lg:text-left">
          <img :src="logoOpeSrc" alt="Logo OPE 2026" class="mx-auto mb-5 w-32 lg:hidden" />
          <p class="mb-2 font-heading text-xs font-black uppercase tracking-[0.28em] text-accent">
            Acceso administrativo
          </p>
          <h2 class="mb-2 font-heading text-3xl font-black text-white">Panel de Administración</h2>
        </div>

        <Card class="overflow-hidden rounded-xl border-white/10 bg-white shadow-soft">
          <CardContent class="p-8">
            <form class="space-y-6" @submit.prevent="handleLogin">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-text-main">Correo Electrónico</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail class="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    v-model="email"
                    type="email"
                    class="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 leading-5 text-text-main placeholder-text-muted transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-text-main">Contraseña</label>
                <div class="relative">
                  <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock class="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-12 leading-5 text-text-main placeholder-text-muted transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Contraseña"
                    required
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted transition-colors hover:text-primary"
                    @click="showPassword = !showPassword"
                  >
                    <EyeOff v-if="showPassword" class="h-5 w-5" />
                    <Eye v-else class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                :disabled="isLoading"
                class="h-auto w-full rounded-xl bg-accent px-8 py-6 font-bold text-primary shadow-soft transition-all hover:bg-accent/90"
              >
                <template v-if="isLoading">
                  <Loader2 class="h-5 w-5 animate-spin" />
                </template>
                <template v-else>
                  Ingresar al Panel
                  <ArrowRight class="h-5 w-5" />
                </template>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>
