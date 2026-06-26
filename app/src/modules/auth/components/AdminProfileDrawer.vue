<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { KeyRound, Mail, Save, ShieldCheck, X, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { useAuthStore } from '@/app/stores/auth.store'
import type { CambiarContrasenaDTO, UsuarioAutenticado } from '@/modules/auth/types/auth.api'

const props = defineProps<{
  open: boolean
  user: UsuarioAutenticado | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const authStore = useAuthStore()
const passwordOpen = ref(false)
const isSavingPassword = ref(false)

// Estado para alternar la visibilidad de cada input
const showActual = ref(false)
const showNueva = ref(false)
const showRepetir = ref(false)

const passwordForm = ref<CambiarContrasenaDTO>({
  contrasena_actual: '',
  nueva_contrasena: '',
  repetir_nueva_contrasena: '',
})

const initials = computed(() => {
  const name = props.user?.nombre?.trim()
  if (!name) return 'AD'
  return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
})

// --- VALIDACIONES EN TIEMPO REAL ---
const pwd = computed(() => passwordForm.value.nueva_contrasena)

const hasLength = computed(() => pwd.value.length >= 8)
const hasUpper = computed(() => /[A-Z]/.test(pwd.value))
const hasLower = computed(() => /[a-z]/.test(pwd.value))
const hasNumber = computed(() => /[0-9]/.test(pwd.value))
const hasSpecial = computed(() => /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]/.test(pwd.value))

const passwordsMatch = computed(() => {
  return pwd.value.length > 0 && pwd.value === passwordForm.value.repetir_nueva_contrasena
})

const isFormValid = computed(() => {
  return (
    passwordForm.value.contrasena_actual.length > 0 &&
    hasLength.value &&
    hasUpper.value &&
    hasLower.value &&
    hasNumber.value &&
    hasSpecial.value &&
    passwordsMatch.value
  )
})

watch(
  () => props.open,
  (open) => {
    if (open) return
    passwordOpen.value = false
    showActual.value = false
    showNueva.value = false
    showRepetir.value = false
    passwordForm.value = { contrasena_actual: '', nueva_contrasena: '', repetir_nueva_contrasena: '' }
  },
)

const close = () => emit('update:open', false)

const changePassword = async () => {
  if (!isFormValid.value) return
  isSavingPassword.value = true
  try {
    await authStore.changePassword(passwordForm.value)
    passwordOpen.value = false
    passwordForm.value = { contrasena_actual: '', nueva_contrasena: '', repetir_nueva_contrasena: '' }
  } finally {
    isSavingPassword.value = false
  }
}
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-80" @close="close">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/35" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 flex justify-end">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="translate-x-full"
            enter-to="translate-x-0"
            leave="duration-200 ease-in"
            leave-from="translate-x-0"
            leave-to="translate-x-full"
          >
            <DialogPanel class="h-full w-full max-w-md overflow-y-auto bg-white shadow-soft">
              <div class="border-b border-gray-200 bg-primary px-5 py-5 text-white">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle class="font-heading text-xl font-bold">Mi perfil administrador</DialogTitle>
                    <p class="mt-1 text-sm text-blue-100">Información de la sesión actual.</p>
                  </div>
                  <button class="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white" @click="close">
                    <X class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div v-if="user" class="space-y-5 p-5">
                <div class="rounded-xl border border-gray-200 border-l-4 border-l-accent bg-white p-4">
                  <div class="flex items-center gap-4">
                    <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                      {{ initials }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-heading text-lg font-bold text-text-main">{{ user.nombre }}</p>
                      <p class="mt-1 flex items-center gap-1.5 truncate text-sm text-text-muted">
                        <Mail class="h-4 w-4" />
                        {{ user.correo }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p class="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Estado</p>
                  <p class="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-sm font-bold text-success">
                    <ShieldCheck class="h-4 w-4" />
                    {{ user.estado }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Button variant="accent" class="flex items-center gap-2" @click="passwordOpen = !passwordOpen">
                    <KeyRound class="h-4 w-4" />
                    Cambiar contraseña
                  </Button>
                </div>

                <form v-if="passwordOpen" class="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4" @submit.prevent="changePassword">
                  <div>
                    <label class="mb-1 block text-sm font-bold text-text-main">Contraseña actual</label>
                    <div class="relative">
                      <input 
                        v-model="passwordForm.contrasena_actual" 
                        :type="showActual ? 'text' : 'password'" 
                        class="h-11 w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
                      />
                      <button 
                        type="button" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none"
                        @click="showActual = !showActual"
                      >
                        <Eye v-if="!showActual" class="h-4 w-4" />
                        <EyeOff v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-bold text-text-main">Nueva contraseña</label>
                    <div class="relative">
                      <input 
                        v-model="passwordForm.nueva_contrasena" 
                        :type="showNueva ? 'text' : 'password'" 
                        class="h-11 w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
                      />
                      <button 
                        type="button" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none"
                        @click="showNueva = !showNueva"
                      >
                        <Eye v-if="!showNueva" class="h-4 w-4" />
                        <EyeOff v-else class="h-4 w-4" />
                      </button>
                    </div>

                    <div class="mt-2.5 rounded-lg bg-white/60 p-3 border border-primary/10 space-y-1.5">
                      <p class="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Requisitos:</p>
                      
                      <div class="flex items-center gap-2 text-xs transition-colors" :class="hasLength ? 'text-success font-medium' : 'text-text-muted'">
                        <CheckCircle2 v-if="hasLength" class="h-3.5 w-3.5 text-success shrink-0" />
                        <Circle v-else class="h-3.5 w-3.5 opacity-40 shrink-0" />
                        <span>Mínimo 8 caracteres</span>
                      </div>

                      <div class="flex items-center gap-2 text-xs transition-colors" :class="hasUpper ? 'text-success font-medium' : 'text-text-muted'">
                        <CheckCircle2 v-if="hasUpper" class="h-3.5 w-3.5 text-success shrink-0" />
                        <Circle v-else class="h-3.5 w-3.5 opacity-40 shrink-0" />
                        <span>Al menos una letra mayúscula</span>
                      </div>

                      <div class="flex items-center gap-2 text-xs transition-colors" :class="hasLower ? 'text-success font-medium' : 'text-text-muted'">
                        <CheckCircle2 v-if="hasLower" class="h-3.5 w-3.5 text-success shrink-0" />
                        <Circle v-else class="h-3.5 w-3.5 opacity-40 shrink-0" />
                        <span>Al menos una letra minúscula</span>
                      </div>

                      <div class="flex items-center gap-2 text-xs transition-colors" :class="hasNumber ? 'text-success font-medium' : 'text-text-muted'">
                        <CheckCircle2 v-if="hasNumber" class="h-3.5 w-3.5 text-success shrink-0" />
                        <Circle v-else class="h-3.5 w-3.5 opacity-40 shrink-0" />
                        <span>Al menos un número</span>
                      </div>

                      <div class="flex items-center gap-2 text-xs transition-colors" :class="hasSpecial ? 'text-success font-medium' : 'text-text-muted'">
                        <CheckCircle2 v-if="hasSpecial" class="h-3.5 w-3.5 text-success shrink-0" />
                        <Circle v-else class="h-3.5 w-3.5 opacity-40 shrink-0" />
                        <span>Un carácter especial (!@#$...)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-bold text-text-main">Repetir nueva contraseña</label>
                    <div class="relative">
                      <input 
                        v-model="passwordForm.repetir_nueva_contrasena" 
                        :type="showRepetir ? 'text' : 'password'" 
                        class="h-11 w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
                      />
                      <button 
                        type="button" 
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none"
                        @click="showRepetir = !showRepetir"
                      >
                        <Eye v-if="!showRepetir" class="h-4 w-4" />
                        <EyeOff v-else class="h-4 w-4" />
                      </button>
                    </div>

                    <div v-if="passwordForm.repetir_nueva_contrasena.length > 0" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
                      <span v-if="passwordsMatch" class="text-success flex items-center gap-1">
                        <CheckCircle2 class="h-3.5 w-3.5" /> Las contraseñas coinciden
                      </span>
                      <span v-else class="text-error">
                        Las contraseñas no coinciden
                      </span>
                    </div>
                  </div>

                  <div class="flex justify-end pt-2">
                    <Button 
                      type="submit" 
                      variant="accent" 
                      class="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                      :disabled="isSavingPassword || !isFormValid"
                    >
                      <Save class="h-4 w-4" />
                      {{ isSavingPassword ? 'Guardando...' : 'Guardar contraseña' }}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>