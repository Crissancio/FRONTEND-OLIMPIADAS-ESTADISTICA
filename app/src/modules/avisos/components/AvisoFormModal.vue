<script setup>
import { ref, reactive, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

const props = defineProps({
  isOpen: Boolean,
  initialData: Object,
  loading: Boolean
})

const emit = defineEmits(['close', 'save'])

const isEdit = ref(false)
const today = ref(new Date())
const dateMasks = { modelValue: 'YYYY-MM-DD HH:mm:ss', input: 'DD/MM/YYYY HH:mm' }

const tiposPredeterminados = [
  'CONVOCATORIA', 'INSCRIPCION', 'CRONOGRAMA', 'MATERIAL', 'EXAMEN',
  'LOGISTICA', 'RESULTADO', 'RECLAMO', 'CEREMONIA', 'CAPACITACION',
  'MANTENIMIENTO', 'SOPORTE', 'GENERAL'
]

const form = reactive({
  titulo: '',
  descripcion: '',
  tipo: '',
  prioridad: 'MEDIA',
  fecha_publicacion: null
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    today.value = new Date()
    if (props.initialData && props.initialData.id_aviso) {
      isEdit.value = true
      form.titulo = props.initialData.titulo
      form.descripcion = props.initialData.descripcion
      form.tipo = props.initialData.tipo
      form.prioridad = props.initialData.prioridad
      form.fecha_publicacion = props.initialData.fecha_publicacion || null
    } else {
      isEdit.value = false
      form.titulo = ''
      form.descripcion = ''
      form.tipo = ''
      form.prioridad = 'MEDIA'
      form.fecha_publicacion = null
    }
  }
})

const closeDrawer = () => emit('close')

const handleSubmit = () => {
  if (!form.titulo || !form.descripcion || !form.tipo) {
    alert('Por favor complete todos los parámetros obligatorios marcados con (*).')
    return
  }
  emit('save', { isEdit: isEdit.value, data: { ...form } })
}
</script>

<style scoped>
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slideIn 0.25s ease-out forwards;
}
</style>
<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/40 z-50 flex justify-end transition-opacity duration-300">
    <div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden">
      
      <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center" style="background-color: #113264;">
        <h3 class="text-base font-bold text-white">
          {{ isEdit ? 'Editar Datos del Aviso' : 'Nuevo Registro de Aviso' }}
        </h3>
        <button @click="closeDrawer" class="text-white/80 hover:text-white text-xl font-bold">✕</button>
      </div>

      <div class="flex-1 p-6 overflow-y-auto space-y-5 bg-white">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Título del Aviso *</label>
          <input 
            v-model="form.titulo" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#113264]" 
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción General *</label>
          <textarea 
            v-model="form.descripcion" 
            rows="4" 
            class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#113264]"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Aviso *</label>
            <select 
              v-model="form.tipo" 
              class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#113264]"
            >
              <option value="" disabled>Seleccione un tipo</option>
              <option v-for="tipo in tiposPredeterminados" :key="tipo" :value="tipo">{{ tipo }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nivel de Prioridad *</label>
            <select 
              v-model="form.prioridad" 
              class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#113264]"
            >
              <option value="BAJA">BAJA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="ALTA">ALTA</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha y Hora de Publicación</label>
          <DatePicker 
            v-model.string="form.fecha_publicacion" 
            mode="dateTime"
            is24hr
            :min-date="today"
            :masks="dateMasks"
          >
            <template #default="{ inputValue, inputEvents }">
              <div class="relative">
                <input 
                  :value="inputValue" 
                  v-on="inputEvents" 
                  placeholder="Selecciona fecha y hora de lanzamiento"
                  readonly
                  class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#113264]"
                />
                <button 
                  v-if="form.fecha_publicacion"
                  @click.stop="form.fecha_publicacion = null"
                  class="absolute right-3 top-2.5 text-gray-400 text-xs font-bold hover:text-gray-600"
                >
                  Limpiar
                </button>
              </div>
            </template>
          </DatePicker>
          <p class="text-[11px] text-gray-400 mt-1">Los días anteriores al actual se encuentran deshabilitados.</p>
        </div>
      </div>

      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-2">
        <button 
          @click="handleSubmit" 
          :disabled="loading"
          class="w-full text-white px-4 py-2.5 rounded-md text-sm font-bold shadow transition disabled:opacity-50"
          style="background-color: var(--color-accent, #F5A623);"
          onmouseover="this.style.backgroundColor='#D48806'"
          onmouseout="this.style.backgroundColor='#F5A623'"
        >
          {{ loading ? 'Procesando Transacción...' : 'Guardar Información' }}
        </button>
        <button 
          @click="closeDrawer" 
          class="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>