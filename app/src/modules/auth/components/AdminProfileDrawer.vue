<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { KeyRound, Mail, Save, ShieldCheck, X } from 'lucide-vue-next'
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

watch(
  () => props.open,
  (open) => {
    if (open) return
    passwordOpen.value = false
    passwordForm.value = { contrasena_actual: '', nueva_contrasena: '', repetir_nueva_contrasena: '' }
  },
)

const close = () => emit('update:open', false)

const changePassword = async () => {
  if (!passwordForm.value.contrasena_actual || !passwordForm.value.nueva_contrasena || !passwordForm.value.repetir_nueva_contrasena) return
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
    <Dialog as="div" class="relative z-[80]" @close="close">
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

                <form v-if="passwordOpen" class="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4" @submit.prevent="changePassword">
                  <div>
                    <label class="mb-1 block text-sm font-bold text-text-main">Contraseña actual</label>
                    <input v-model="passwordForm.contrasena_actual" type="password" class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-bold text-text-main">Nueva contraseña</label>
                    <input v-model="passwordForm.nueva_contrasena" type="password" class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-bold text-text-main">Repetir nueva contraseña</label>
                    <input v-model="passwordForm.repetir_nueva_contrasena" type="password" class="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </div>
                  <div class="flex justify-end">
                    <Button type="submit" variant="accent" class="flex items-center gap-2" :disabled="isSavingPassword">
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
