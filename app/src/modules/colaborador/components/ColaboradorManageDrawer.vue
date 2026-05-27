<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X, AlertTriangle, ShieldCheck, UserMinus, Trash2 } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { useColaboradoresStore } from '@/modules/colaborador/stores/colaboradores.store'

const props = defineProps<{ 
  isOpen: boolean,
  colaboradorId: number | null 
}>()

const emit = defineEmits<{ 
  (e: 'close'): void,
  (e: 'updated'): void 
}>()

const store = useColaboradoresStore()
const isEditing = ref(false)
const showDeleteConfirm = ref(false)

const formData = ref({
  nombres: '',
  paterno: '',
  materno: '',
  correo: '',
  rol: '',
  tipo: '',
  presentacion: ''
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.colaboradorId) {
    isEditing.value = false
    showDeleteConfirm.value = false
    const data = await store.fetchColaborador(props.colaboradorId)
    if (data) {
      formData.value = {
        nombres: data.nombres,
        paterno: data.paterno,
        materno: data.materno || '',
        correo: data.correo,
        rol: data.rol,
        tipo: data.tipo,
        presentacion: data.presentacion || ''
      }
    }
  }
})

const handleClose = () => {
  emit('close')
}

const toggleEstado = async () => {
  if (!store.colaboradorActual) return
  const isActivo = store.colaboradorActual.estado === 'ACTIVO'
  await store.toggleAltaBaja(store.colaboradorActual.id_colaborador, !isActivo)
  emit('updated')
}

const saveChanges = async () => {
  if (!store.colaboradorActual) return
  await store.updateColaborador(store.colaboradorActual.id_colaborador, formData.value)
  isEditing.value = false
  emit('updated')
}

const confirmDelete = async () => {
  if (!store.colaboradorActual) return
  await store.deleteColaborador(store.colaboradorActual.id_colaborador)
  emit('updated')
  handleClose()
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-50">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="translate-x-full">
              <DialogPanel class="pointer-events-auto w-screen max-w-md">
                <div class="flex h-full flex-col bg-white shadow-2xl" v-if="store.colaboradorActual">
                  
                  <div class="relative bg-primary px-6 py-8 text-center text-white">
                    <button @click="handleClose" class="absolute right-4 top-4 rounded-full p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                      <X class="h-5 w-5" />
                    </button>
                    <div class="mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md">
                      <img v-if="store.colaboradorActual.perfil" :src="store.colaboradorActual.perfil" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center bg-gray-200 text-2xl font-bold text-gray-500">
                        {{ store.colaboradorActual.nombres.charAt(0) }}{{ store.colaboradorActual.paterno.charAt(0) }}
                      </div>
                    </div>
                    <DialogTitle class="font-heading text-xl font-bold">{{ store.colaboradorActual.nombres }} {{ store.colaboradorActual.paterno }}</DialogTitle>
                    <p class="text-primary-100 text-sm mt-1">{{ store.colaboradorActual.correo }}</p>
                  </div>

                  <div class="flex-1 overflow-y-auto p-6">
                    
                    <div class="mb-6 flex gap-2">
                      <Button 
                        variant="outline" 
                        :class="['flex-1 border-gray-200 transition-colors focus:ring-2 focus:ring-primary/50', isEditing ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 hover:text-gray-900']" 
                        @click="isEditing = !isEditing"
                      >
                        {{ isEditing ? 'Cancelar Edición' : 'Editar Datos' }}
                      </Button>
                      <Button 
                        v-if="!isEditing" 
                        variant="outline" 
                        class="flex-1 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-2 focus:ring-primary/50" 
                        @click="toggleEstado"
                      >
                        <UserMinus v-if="store.colaboradorActual.estado === 'ACTIVO'" class="mr-2 h-4 w-4" />
                        <ShieldCheck v-else class="mr-2 h-4 w-4" />
                        {{ store.colaboradorActual.estado === 'ACTIVO' ? 'Dar de Baja' : 'Dar de Alta' }}
                      </Button>
                    </div>

                    <div v-if="!isEditing" class="space-y-6">
                      <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Información del Rol</h4>
                        <div class="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                          <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-500">Estado</span>
                            <Badge :variant="store.colaboradorActual.estado === 'ACTIVO' ? 'success' : 'secondary'">{{ store.colaboradorActual.estado }}</Badge>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-500">Tipo</span>
                            <span class="text-sm font-medium text-text-main">{{ store.colaboradorActual.tipo }}</span>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-500">Cargo/Rol</span>
                            <span class="text-sm font-medium text-text-main">{{ store.colaboradorActual.rol }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="store.colaboradorActual.presentacion">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Presentación</h4>
                        <p class="text-sm text-text-main leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                          {{ store.colaboradorActual.presentacion }}
                        </p>
                      </div>

                      <div class="pt-6 border-t border-gray-100 mt-auto">
                        <div v-if="!showDeleteConfirm">
                          <button @click="showDeleteConfirm = true" class="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                            <Trash2 class="h-4 w-4" /> Eliminar permanentemente
                          </button>
                        </div>
                        <div v-else class="rounded-lg border border-red-300 bg-red-50 p-4 animate-fade-in shadow-sm">
                          <div class="flex items-start gap-3">
                            <AlertTriangle class="h-5 w-5 text-red-600 shrink-0" />
                            <div>
                              <h4 class="text-sm font-bold text-red-800">¿Estás absolutamente seguro?</h4>
                              <p class="mt-1 text-xs text-red-700 mb-3">Esta acción no se puede deshacer. Los datos del colaborador se borrarán del sistema.</p>
                              <div class="flex gap-2">
                                <Button variant="outline" size="sm" @click="showDeleteConfirm = false" class="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 focus:ring-2 focus:ring-red-200">
                                  Cancelar
                                </Button>
                                <Button variant="primary" size="sm" class="bg-red-600 text-white border-transparent hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-1" @click="confirmDelete">
                                  Sí, eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form v-else @submit.prevent="saveChanges" class="space-y-4 animate-fade-in">
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-medium text-text-main mb-1">Nombres</label>
                          <input v-model="formData.nombres" required class="input-base" />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-text-main mb-1">Paterno</label>
                          <input v-model="formData.paterno" required class="input-base" />
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-medium text-text-main mb-1">Materno</label>
                          <input v-model="formData.materno" class="input-base" />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-text-main mb-1">Correo</label>
                          <input v-model="formData.correo" type="email" required class="input-base" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-text-main mb-1">Rol</label>
                        <input v-model="formData.rol" required class="input-base" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-text-main mb-1">Tipo</label>
                        <select v-model="formData.tipo" class="input-base">
                          <option value="PERSONAL ACADEMICO">Personal Académico</option>
                          <option value="ADMINISTRATIVO">Administrativo</option>
                          <option value="COLABORADOR">Colaborador</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-text-main mb-1">Presentación</label>
                        <textarea v-model="formData.presentacion" rows="3" class="input-base resize-none"></textarea>
                      </div>
                      <Button variant="primary" class="w-full mt-4 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-1 hover:brightness-95" type="submit" :disabled="store.isLoading">
                        Guardar Cambios
                      </Button>
                    </form>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>