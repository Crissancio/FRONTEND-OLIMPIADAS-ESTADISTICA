<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { AlertTriangle, Edit, Mail, Power, Save, Trash2, User, X, Loader2 } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { administradoresService } from '@/modules/administradores/services/administradores.service'
import type { AdministradorDTO, AdministradorUpdateDTO } from '@/modules/administradores/types/administradores.api'

const props = defineProps<{
  isOpen: boolean
  adminId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated', data: AdministradorDTO): void
  (e: 'deleted', id: number): void
  (e: 'error', err: any): void
}>()

const isLoading = ref(false)
const isEditing = ref(false)
const confirmDelete = ref(false)
const adminActual = ref<AdministradorDTO | null>(null)

const form = ref({ nombre: '', correo: '' })

const isFormValid = computed(() => {
  return form.value.nombre.trim() !== '' && form.value.correo.trim() !== ''
})

const fetchAdmin = async (id: number) => {
  isLoading.value = true
  try {
    const response = await administradoresService.obtenerAdministradorPorId(id)
    if (response.success && response.data) {
      adminActual.value = response.data
      form.value = {
        nombre: response.data.nombre,
        correo: response.data.correo
      }
    }
  } catch (error) {
    emit('error', error)
    handleClose()
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.adminId) {
      isEditing.value = false
      confirmDelete.value = false
      adminActual.value = null
      fetchAdmin(props.adminId)
    } else if (!newVal) {
      adminActual.value = null
    }
  },
  { immediate: true }
)

const initials = computed(() => {
  const name = adminActual.value?.nombre.trim()
  if (!name) return 'AD'
  return name.split(/\s+/).slice(0, 2).map((part: string) => part.charAt(0).toUpperCase()).join('')
})

const isActivo = computed(() => adminActual.value?.estado?.toUpperCase() === 'ACTIVO')

const handleClose = () => {
  emit('close')
}

const toggleEstado = async () => {
  if (!adminActual.value || isLoading.value) return
  isLoading.value = true
  try {
    const id = adminActual.value.id_administrador
    let response;
    if (isActivo.value) {
      response = await administradoresService.bajaLogicaAdministrador(id)
    } else {
      response = await administradoresService.altaLogicaAdministrador(id)
    }
    
    if (response.success && response.data) {
      adminActual.value = response.data
      emit('updated', response.data)
    }
  } catch (error) {
    emit('error', error)
  } finally {
    isLoading.value = false
  }
}

const saveChanges = async () => {
  if (!adminActual.value || isLoading.value || !isFormValid.value) return
  isLoading.value = true
  try {
    const payload: AdministradorUpdateDTO = {
      nombre: form.value.nombre.trim(),
      correo: form.value.correo.trim()
    }
    const response = await administradoresService.actualizarAdministrador(adminActual.value.id_administrador, payload)
    
    if (response.success && response.data) {
      adminActual.value = response.data
      isEditing.value = false
      emit('updated', response.data)
    }
  } catch (error) {
    emit('error', error)
  } finally {
    isLoading.value = false
  }
}

const executeDelete = async () => {
  if (!adminActual.value || isLoading.value) return
  isLoading.value = true
  const id = adminActual.value.id_administrador
  try {
    await administradoresService.eliminarAdministrador(id)
    emit('deleted', id)
    handleClose()
  } catch (error) {
    emit('error', error)
  } finally {
    isLoading.value = false
    confirmDelete.value = false
  }
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-80" @close="handleClose">
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
                  <button class="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white" @click="handleClose">
                    <X class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div v-if="isLoading && !adminActual" class="flex h-full flex-col items-center justify-center p-8 text-primary">
                <Loader2 class="h-8 w-8 animate-spin" />
                <p class="mt-2 text-sm text-gray-500 font-medium">Cargando perfil...</p>
              </div>

              <div v-else-if="adminActual" class="space-y-5 p-5">
                <div class="rounded-xl border border-gray-200 border-l-4 border-l-accent bg-white p-4 relative">
                  <div v-if="isLoading" class="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                    <Loader2 class="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                      {{ initials }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-heading text-xl font-bold text-gray-900">{{ adminActual.nombre }}</p>
                      <p class="mt-1 flex items-center gap-1.5 truncate text-sm text-gray-500">
                        <Mail class="h-4 w-4" />
                        {{ adminActual.correo }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3">
                  <div>
                    <label class="mb-1 block text-sm font-bold text-gray-900">Nombre completo</label>
                    <input v-model="form.nombre" :disabled="!isEditing || isLoading" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-400 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-bold text-gray-900">Correo</label>
                    <input v-model="form.correo" :disabled="!isEditing || isLoading" class="h-11 w-full rounded-md border border-gray-300 px-3 text-sm transition-colors disabled:bg-gray-50 disabled:text-gray-400 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Button variant="outline" class="flex items-center gap-2" @click="isEditing = !isEditing" :disabled="isLoading">
                    <Edit class="h-4 w-4" />
                    {{ isEditing ? 'Desactivar edición' : 'Activar edición' }}
                  </Button>
                  <Button v-if="isEditing" variant="accent" class="flex items-center gap-2 disabled:opacity-50" :disabled="isLoading || !isFormValid" @click="saveChanges">
                    <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                    <Save v-else class="h-4 w-4" />
                    {{ isLoading ? 'Guardando...' : 'Guardar cambios' }}
                  </Button>
                </div>

                <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Estado actual</p>
                  <p :class="['inline-flex rounded-full border px-3 py-1 text-sm font-bold', isActivo ? 'border-success/20 bg-success/10 text-success' : 'border-warning/20 bg-warning/10 text-warning']">
                    {{ adminActual.estado }}
                  </p>
                  <div class="mt-4">
                    <Button v-if="isActivo" class="flex items-center gap-2 bg-warning text-primary hover:bg-warning/90 disabled:opacity-50" :disabled="isLoading" @click="toggleEstado">
                      <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                      <Power v-else class="h-4 w-4" />
                      Dar baja
                    </Button>
                    <Button v-else class="flex items-center gap-2 bg-success text-white hover:bg-success/90 disabled:opacity-50" :disabled="isLoading" @click="toggleEstado">
                      <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                      <Power v-else class="h-4 w-4" />
                      Dar alta
                    </Button>
                  </div>
                </div>

                <div class="rounded-xl border border-danger/20 bg-danger/10 p-4">
                  <div class="flex items-start gap-3">
                    <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                    <div>
                      <p class="font-bold text-danger">Eliminación total</p>
                      <p class="mt-1 text-sm text-gray-900">Esta acción elimina el administrador de forma permanente. No se recomienda si existen registros asociados.</p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <Button v-if="!confirmDelete" class="bg-danger text-white hover:bg-danger/90 disabled:opacity-50" :disabled="isLoading" @click="confirmDelete = true">
                      <Trash2 class="h-4 w-4" />
                      Eliminar total
                    </Button>
                    <template v-else>
                      <Button variant="outline" @click="confirmDelete = false" :disabled="isLoading">Cancelar</Button>
                      <Button class="bg-danger text-white hover:bg-danger/90 disabled:opacity-50" :disabled="isLoading" @click="executeDelete">
                        <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
                        Confirmar eliminación
                      </Button>
                    </template>
                  </div>
                </div>
              </div>

              <div v-else class="flex h-full items-center justify-center p-8 text-gray-400">
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