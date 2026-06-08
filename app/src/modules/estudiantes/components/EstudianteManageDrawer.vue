<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Lock, Edit2, Save, Power, Loader2, Building, User } from 'lucide-vue-next'
import { estudiantesService } from '../services/estudiantes.service'
import { useInscripcionStore } from '@/modules/inscripcion/stores/inscripcion.store'
import type { EstudianteDTO, EstudianteUpdateDTO } from '../types/estudiantes.api'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{
  open: boolean
  studentId: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
  (e: 'deleted'): void
}>()

const labelClass = 'block text-[11px] font-bold text-gray-700 mb-1'
const inputClass = 'h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-100 disabled:text-gray-500'

const inscripcionStore = useInscripcionStore()

const studentData = ref<EstudianteDTO | null>(null)
const isFetching = ref(false)
const isLoadingAction = ref(false)
const isEditing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const showDeleteConfirm = ref(false)

const editForm = ref<EstudianteUpdateDTO>({
  nombres: '',
  paterno: '',
  materno: '',
  id_colegio: null,
  curso: 1,
  nivel: 'SECUNDARIA',
  rude: '',
  telefono: '',
  correo: ''
})

const colegioSearchText = ref('')
const showColegioDropdown = ref(false)

const filteredColegios = computed(() => {
  if (!colegioSearchText.value) return inscripcionStore.colegios.slice(0, 30)
  const search = colegioSearchText.value.toLowerCase()
  return inscripcionStore.colegios.filter(c => c.nombre.toLowerCase().includes(search)).slice(0, 30)
})

const selectColegio = (col: any) => {
  editForm.value.id_colegio = col.id_colegio
  colegioSearchText.value = col.nombre
  showColegioDropdown.value = false
}

const getStudentDetails = async (id: number) => {
  isFetching.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const response = await estudiantesService.obtenerEstudiantePorId(id)
    studentData.value = response.data
    
    editForm.value = {
      nombres: response.data.nombres,
      paterno: response.data.paterno,
      materno: response.data.materno || '',
      id_colegio: response.data.id_colegio,
      curso: response.data.curso,
      nivel: response.data.nivel,
      rude: response.data.rude || '',
      telefono: response.data.telefono || '',
      correo: response.data.correo || ''
    }
    colegioSearchText.value = response.data.colegio?.nombre || ''
  } catch (err: any) {
    errorMessage.value = 'Ocurrió un problema extrayendo la bitácora del estudiante.'
  } finally {
    isFetching.value = false
  }
}

const isEditFormValid = computed(() => {
  return (
    editForm.value.nombres?.trim() !== '' &&
    editForm.value.paterno?.trim() !== '' &&
    editForm.value.id_colegio !== null &&
    editForm.value.curso !== null &&
    editForm.value.nivel !== null
  )
})

watch(() => props.studentId, (newId) => {
  if (newId && props.open) {
    isEditing.value = false
    showDeleteConfirm.value = false
    getStudentDetails(newId)
  }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    studentData.value = null
    isEditing.value = false
    showDeleteConfirm.value = false
  }
})

const handleUpdate = async () => {
  if (!props.studentId || !isEditFormValid.value || isLoadingAction.value) return
  isLoadingAction.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload: EstudianteUpdateDTO = {
      ...editForm.value,
      materno: editForm.value.materno?.trim() || null,
      rude: editForm.value.rude?.trim() || null,
      telefono: editForm.value.telefono?.trim() || null,
      correo: editForm.value.correo?.trim() || null
    }

    await estudiantesService.actualizarEstudiante(props.studentId, payload)
    successMessage.value = 'Cambios almacenados exitosamente.'
    isEditing.value = false
    emit('updated')
    await getStudentDetails(props.studentId)
  } catch (err) {
    errorMessage.value = 'Error al actualizar la ficha del estudiante.'
  } finally {
    isLoadingAction.value = false
  }
}

const handleStatusToggle = async () => {
  if (!studentData.value || isLoadingAction.value) return
  isLoadingAction.value = true
  errorMessage.value = ''

  try {
    const nextState = studentData.value.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    await estudiantesService.cambiarEstadoEstudiante(studentData.value.id_estudiante, { estado: nextState })
    studentData.value.estado = nextState
    successMessage.value = `Estado cambiado a ${nextState} correctamente.`
    emit('updated')
  } catch (err) {
    errorMessage.value = 'No se pudo cambiar el estado actual.'
  } finally {
    isLoadingAction.value = false
  }
}
const hideColegioDropdown = () => {
  window.setTimeout(() => {
    showColegioDropdown.value = false
  }, 250)
}
</script>

<template>
  <transition name="drawer-slide">
    <div v-if="open" class="fixed inset-y-0 right-0 z-100 w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col h-full">
      
      <div class="p-6 bg-primary text-white flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/10 rounded-lg text-white">
            <User class="h-6 w-6" />
          </div>
          <div>
            <h2 class="text-2xl font-bold font-heading">Ficha de Administración</h2>
            <p class="text-sm text-white/80 mt-0.5">ID Estudiante: <span class="font-mono font-bold">#{{ studentId }}</span></p>
          </div>
        </div>
        <button @click="emit('close')" class="text-white/70 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10">
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50">
        
        <div v-if="isFetching" class="flex flex-col items-center justify-center py-20 gap-3 text-gray-500 text-sm">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
          <span>Extrayendo historial completo...</span>
        </div>

        <template v-else-if="studentData">
          <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
            {{ successMessage }}
          </div>

          <div class="p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-gray-500 uppercase">Estado de cuenta:</span>
              <Badge :class="studentData.estado === 'ACTIVO' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'" variant="not_allowed" class="px-2.5 py-0.5 font-bold">
                {{ studentData.estado }}
              </Badge>
            </div>
            
            <button 
              @click="isEditing = !isEditing; showDeleteConfirm = false" 
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border transition-all"
              :class="isEditing ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
            >
              <Edit2 class="h-3.5 w-3.5" />
              {{ isEditing ? 'Salir de Edición' : 'Modificar Datos' }}
            </button>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-1">Información de Identidad</h4>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label :class="labelClass">Ap. Paterno</label>
                <input v-model="editForm.paterno" :disabled="!isEditing" type="text" :class="inputClass" />
              </div>
              <div>
                <label :class="labelClass">Ap. Materno</label>
                <input v-model="editForm.materno" :disabled="!isEditing" type="text" :class="inputClass" />
              </div>
              <div>
                <label :class="labelClass">Nombres</label>
                <input v-model="editForm.nombres" :disabled="!isEditing" type="text" :class="inputClass" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label :class="[labelClass, 'flex items-center gap-1']">
                  Carnet de Identidad <Lock class="h-3 w-3 text-red-500" />
                </label>
                <input :value="studentData.carnet_identidad" disabled type="text" :class="[inputClass, 'font-semibold cursor-not-allowed']" />
              </div>

              <div>
                <label :class="[labelClass, 'flex items-center gap-1']">
                  Fecha de Nacimiento <Lock class="h-3 w-3 text-red-500" />
                </label>
                <input :value="studentData.fecha_nacimiento" disabled type="text" :class="[inputClass, 'font-semibold cursor-not-allowed']" />
              </div>
            </div>

            <h4 class="text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-200 pt-2 pb-1">Asignación Escolar</h4>

            <div class="relative">
              <label :class="labelClass">Colegio Asignado</label>
              <div class="relative">
                <Building class="absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400 pointer-events-none" />
                <input 
                  v-model="colegioSearchText" 
                  :disabled="!isEditing"
                  @focus="showColegioDropdown = true" 
                  @blur="hideColegioDropdown" 
                  type="text" 
                  :class="[inputClass, 'pl-9']" 
                />
              </div>
              
              <div v-if="isEditing && showColegioDropdown && filteredColegios.length > 0" class="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-xl max-h-36 overflow-y-auto">
                <div v-for="col in filteredColegios" :key="col.id_colegio" @mousedown.prevent="selectColegio(col)" class="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none">
                  <p class="font-semibold text-gray-800 truncate">{{ col.nombre }}</p>
                  <p class="text-[10px] text-gray-500">{{ col.turno }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label :class="labelClass">Nivel Educativo</label>
                <select v-model="editForm.nivel" :disabled="!isEditing" :class="inputClass">
                  <option value="PRIMARIA">Primaria</option>
                  <option value="SECUNDARIA">Secundaria</option>
                </select>
              </div>
              <div>
                <label :class="labelClass">Curso</label>
                <select v-model="editForm.curso" :disabled="!isEditing" :class="inputClass">
                  <option v-for="n in 6" :key="n" :value="n">{{ n }}to Año</option>
                </select>
              </div>
            </div>

            <h4 class="text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-200 pt-2 pb-1">Otros Metadatos</h4>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-1">
                <label :class="labelClass">RUDE</label>
                <input v-model="editForm.rude" :disabled="!isEditing" type="text" :class="inputClass" />
              </div>
              <div>
                <label :class="labelClass">Teléfono</label>
                <input v-model="editForm.telefono" :disabled="!isEditing" type="text" :class="inputClass" />
              </div>
              <div>
                <label :class="labelClass">Correo</label>
                <input v-model="editForm.correo" :disabled="!isEditing" type="email" :class="inputClass" placeholder="ejemplo@mail.com" />
              </div>
            </div>
          </div>

          <div v-if="!isEditing" class="pt-6 border-t border-gray-200 space-y-4">
            <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Operaciones de Consola</h5>
            
            <div class="grid grid-cols-2 gap-4">
              <button 
                @click="handleStatusToggle" 
                :disabled="isLoadingAction"
                class="h-11 px-4 text-xs font-bold rounded-lg border flex items-center justify-center gap-2 transition-colors"
                :class="studentData.estado === 'ACTIVO' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'"
              >
                <Power class="h-4 w-4" />
                {{ studentData.estado === 'ACTIVO' ? 'Desactivar Cuenta' : 'Reactivar Cuenta' }}
              </button>

            </div>
          </div>
        </template>
      </div>

      <div v-if="isEditing" class="p-4 bg-white border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
        <Button variant="outline" @click="isEditing = false" :disabled="isLoadingAction" class="px-5 border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
          Cancelar Cambios
        </Button>
        <Button @click="handleUpdate" :disabled="!isEditFormValid || isLoadingAction" class="px-6 bg-accent hover:bg-accent/90 text-white shadow-sm flex items-center gap-2 disabled:opacity-50">
          <Loader2 v-if="isLoadingAction" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

    </div>
  </transition>
</template>

<style scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>