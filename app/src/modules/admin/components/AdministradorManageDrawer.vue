<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { AlertTriangle, Edit, Mail, Power, Save, Trash2, User, X } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { AdministradorResponseDTO } from '@/modules/administradores/types/administradores.api'

const props = defineProps<{
  open: boolean
  admin: AdministradorResponseDTO | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', payload: { id: number; nombre: string; correo: string }): void
  (e: 'alta', id: number): void
  (e: 'baja', id: number): void
  (e: 'delete', id: number): void
}>()

const isEditing = ref(false)
const confirmDelete = ref(false)
const form = ref({ nombre: '', correo: '' })

watch(
  () => props.admin,
  (admin) => {
    form.value = { nombre: admin?.nombre ?? '', correo: admin?.correo ?? '' }
    isEditing.value = false
    confirmDelete.value = false
  },
  { immediate: true },
)

const initials = computed(() => {
  const name = props.admin?.nombre.trim()
  if (!name) return 'AD'
  return name.split(/\s+/).slice(0, 2).map((part: string) => part.charAt(0).toUpperCase()).join('')
})

const isActivo = computed(() => props.admin?.estado?.toUpperCase() === 'ACTIVO')
const close = () => emit('update:open', false)

const save = () => {
  if (!props.admin) return
  emit('save', { id: props.admin.id_administrador, nombre: form.value.nombre, correo: form.value.correo })
}
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" class="relative z-[80]" @close="close">
      <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/35" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 flex justify-end">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="translate-x-full" enter-to="translate-x-0" leave="duration-200 ease-in" leave-from="translate-x-0" leave-to="translate-x-full">
            <DialogPanel class="h-full w-full max-w-lg overflow-y-auto bg-white shadow-soft">
              <div class="border-b border-gray-200 bg-primary px-5 py-5 text-white">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle class="font-heading text-xl font-bold">Administrar administrador</DialogTitle>
                    <p class="mt-1 text-sm text-blue-100">Edición, estado y eliminación.</p>
                  </div>
                  <button class="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white" @click="close">
                    <X class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div v-if="admin" class="space-y-5 p-5">
                <div class="rounded-xl border border-gray-200 border-l-4 border-l-accent bg-white p-4">
                  <div class="flex items-center gap-4">
                    <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                      {{ initials }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-heading text-xl font-bold text-text-main">{{ admin.nombre }}</p>
                      <p class="mt-1 flex items-center gap-1.5 truncate text-sm text-text-muted">
                        <Mail class="h-4 w-4" />
                        {{ admin.correo }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3">
                  <div>
                    <label class="mb-1 block text-sm font-bold text-text-main">Nombre completo</label>
                    <input v-model="form.nombre" :disabled="!isEditing" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-bold text-text-main">Correo</label>
                    <input v-model="form.correo" :disabled="!isEditing" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Button variant="outline" class="flex items-center gap-2" @click="isEditing = !isEditing">
                    <Edit class="h-4 w-4" />
                    {{ isEditing ? 'Desactivar edición' : 'Activar edición' }}
                  </Button>
                  <Button v-if="isEditing" variant="accent" class="flex items-center gap-2" :disabled="loading" @click="save">
                    <Save class="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>

                <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p class="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Estado actual</p>
                  <p :class="['inline-flex rounded-full border px-3 py-1 text-sm font-bold', isActivo ? 'border-success/20 bg-success/10 text-success' : 'border-warning/20 bg-warning/10 text-warning']">
                    {{ admin.estado }}
                  </p>
                  <div class="mt-4">
                    <Button v-if="isActivo" class="flex items-center gap-2 bg-warning text-primary hover:bg-warning/90" :disabled="loading" @click="emit('baja', admin.id_administrador)">
                      <Power class="h-4 w-4" />
                      Dar baja
                    </Button>
                    <Button v-else class="flex items-center gap-2 bg-success text-white hover:bg-success/90" :disabled="loading" @click="emit('alta', admin.id_administrador)">
                      <Power class="h-4 w-4" />
                      Dar alta
                    </Button>
                  </div>
                </div>

                <div class="rounded-xl border border-danger/20 bg-danger/10 p-4">
                  <div class="flex items-start gap-3">
                    <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                    <div>
                      <p class="font-bold text-danger">Eliminación total</p>
                      <p class="mt-1 text-sm text-text-main">Esta acción elimina el administrador de forma permanente. No se recomienda si existen registros asociados.</p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <Button v-if="!confirmDelete" class="bg-danger text-white hover:bg-danger/90" @click="confirmDelete = true">
                      <Trash2 class="h-4 w-4" />
                      Eliminar total
                    </Button>
                    <template v-else>
                      <Button variant="outline" @click="confirmDelete = false">Cancelar</Button>
                      <Button class="bg-danger text-white hover:bg-danger/90" :disabled="loading" @click="emit('delete', admin.id_administrador)">
                        Confirmar eliminación
                      </Button>
                    </template>
                  </div>
                </div>
              </div>

              <div v-else class="flex h-full items-center justify-center p-8 text-text-muted">
                <User class="mr-2 h-5 w-5" />
                Selecciona un administrador.
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
