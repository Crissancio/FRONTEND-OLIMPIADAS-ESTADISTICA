<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Building, Loader2, Save } from 'lucide-vue-next'
import { estudiantesService } from '../services/estudiantes.service'
import { useInscripcionStore } from '@/modules/inscripcion/stores/inscripcion.store'
import type { EstudianteCreateDTO } from '../types/estudiantes.api'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const labelClass = 'block text-xs font-bold text-gray-700 mb-1.5'
const inputClass = 'h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors disabled:bg-gray-100 disabled:text-gray-500'

const inscripcionStore = useInscripcionStore()
const isLoading = ref(false)
const errorMessage = ref('')

const getDefaultBirthDate = () => {
  const today = new Date()
  return new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
}

const formatDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectedDate = ref<Date | null>(getDefaultBirthDate())

const form = ref<EstudianteCreateDTO>({
  nombres: '',
  paterno: '',
  materno: '',
  carnet_identidad: '',
  curso: 1,
  nivel: 'SECUNDARIA',
  fecha_nacimiento: formatDateString(getDefaultBirthDate()),
  rude: '',
  telefono: '',
  correo: '',
  id_colegio: 0
})

watch(selectedDate, (newDate) => {
  if (newDate) {
    form.value.fecha_nacimiento = formatDateString(newDate)
  } else {
    form.value.fecha_nacimiento = ''
  }
})

const colegioSearchText = ref('')
const showColegioDropdown = ref(false)

const filteredColegios = computed(() => {
  if (!colegioSearchText.value) return inscripcionStore.colegios.slice(0, 30)
  const search = colegioSearchText.value.toLowerCase()
  return inscripcionStore.colegios.filter(c => c.nombre.toLowerCase().includes(search)).slice(0, 30)
})

const selectColegio = (col: any) => {
  form.value.id_colegio = col.id_colegio
  colegioSearchText.value = col.nombre
  showColegioDropdown.value = false
}

const isFormValid = computed(() => {
  return (
    form.value.nombres.trim() !== '' &&
    form.value.paterno.trim() !== '' &&
    form.value.carnet_identidad.trim() !== '' &&
    form.value.curso >= 1 &&
    form.value.nivel !== null &&
    form.value.fecha_nacimiento !== '' &&
    form.value.id_colegio > 0
  )
})

const resetForm = () => {
  selectedDate.value = getDefaultBirthDate()
  form.value = {
    nombres: '',
    paterno: '',
    materno: '',
    carnet_identidad: '',
    curso: 1,
    nivel: 'SECUNDARIA',
    fecha_nacimiento: formatDateString(getDefaultBirthDate()),
    rude: '',
    telefono: '',
    correo: '',
    id_colegio: 0
  }
  colegioSearchText.value = ''
  errorMessage.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value || isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''

  try {
    const payload: EstudianteCreateDTO = {
      ...form.value,
      materno: form.value.materno?.trim() || null,
      rude: form.value.rude?.trim() || null,
      telefono: form.value.telefono?.trim() || null,
      correo: form.value.correo?.trim() || null
    }

    await estudiantesService.crearEstudiante(payload)
    emit('saved')
    resetForm()
    emit('close')
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Error al intentar registrar el estudiante.'
  } finally {
    isLoading.value = false
  }
}

watch(() => props.open, (isOpen) => {
  if (!isOpen) resetForm()
})

const hideColegioDropdown = () => {
  window.setTimeout(() => {
    showColegioDropdown.value = false
  }, 250)
}
</script>

<template>
  <transition name="drawer-slide">
    <div v-if="open" class="fixed inset-y-0 right-0 z-100 w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col h-full">
      
      <div class="p-6 bg-primary text-white flex items-start justify-between shrink-0">
        <div>
          <h2 class="text-2xl font-bold font-heading">Registrar Nuevo Estudiante</h2>
          <p class="text-sm text-white/80 mt-1">Completa los datos mandatorios de inscripción.</p>
        </div>
        <button @click="emit('close')" class="text-white/70 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10">
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50">
        
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
          {{ errorMessage }}
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Paterno <span class="text-red-500">*</span></label>
            <input v-model="form.paterno" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Materno</label>
            <input v-model="form.materno" type="text" :class="inputClass" />
          </div>
        </div>

        <div>
          <label :class="labelClass">Nombres <span class="text-red-500">*</span></label>
          <input v-model="form.nombres" type="text" :class="inputClass" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">C.I. <span class="text-red-500">*</span></label>
            <input v-model="form.carnet_identidad" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">RUDE</label>
            <input v-model="form.rude" type="text" :class="inputClass" />
          </div>
        </div>

        <div class="w-1/2 pr-2">
          <label :class="labelClass">Fecha de Nacimiento <span class="text-red-500">*</span></label>
          <VDatePicker v-model="selectedDate" :popover="{ visibility: 'click' }">
            <template #default="{ inputValue, inputEvents }">
              <input type="text" :value="inputValue" v-on="inputEvents" :class="inputClass" readonly />
            </template>
          </VDatePicker>
          <p class="text-[11px] text-gray-500 mt-1">Permitido desde el 1 de enero de 2011</p>
        </div>

        <hr class="border-gray-200" />

        <div class="relative">
          <label :class="labelClass">Colegio de Procedencia <span class="text-red-500">*</span></label>
          <div class="relative">
            <input 
              v-model="colegioSearchText"
              @focus="showColegioDropdown = true" 
              @blur="hideColegioDropdown"
              type="text" 
              :class="[inputClass, 'pl-9']" 
            />
            <Building class="absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div v-if="showColegioDropdown && filteredColegios.length > 0" class="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-xl max-h-40 overflow-y-auto">
            <div 
              v-for="col in filteredColegios" 
              :key="col.id_colegio" 
              @mousedown.prevent="selectColegio(col)" 
              class="px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
            >
              <p class="font-semibold text-gray-800 truncate">{{ col.nombre }}</p>
              <p class="text-[10px] text-gray-500">{{ col.turno }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Nivel Educativo <span class="text-red-500">*</span></label>
            <select v-model="form.nivel" :class="inputClass">
              <option value="SECUNDARIA">Secundaria</option>
              <option value="PRIMARIA">Primaria</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Curso <span class="text-red-500">*</span></label>
            <select v-model="form.curso" :class="inputClass">
              <option v-for="n in 6" :key="n" :value="n">{{ n }}to Año</option>
            </select>
          </div>
        </div>

        <hr class="border-gray-200" />

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Teléfono</label>
            <input v-model="form.telefono" type="text" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Correo Electrónico</label>
            <input v-model="form.correo" type="email" :class="inputClass" placeholder="ejemplo@mail.com" />
          </div>
        </div>

      </div>

      <div class="p-4 bg-white border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
        <Button variant="outline" @click="emit('close')" :disabled="isLoading" class="px-5 border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
          Cancelar
        </Button>
        <Button 
          @click="handleSubmit" 
          :disabled="!isFormValid || isLoading" 
          class="px-6 bg-accent hover:bg-accent/90 text-white shadow-sm flex items-center gap-2 disabled:opacity-50"
          variant="not_allowed"
        >
          <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          Registrar
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
</style>