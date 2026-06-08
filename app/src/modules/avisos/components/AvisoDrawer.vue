<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { DatePicker } from 'v-calendar'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X, Save, Edit2, Trash2, AlertTriangle, Globe, EyeOff, Calendar } from 'lucide-vue-next'
import 'v-calendar/style.css'

const props = defineProps<{
  isOpen: boolean
  aviso: any | null
  loading: boolean
}>()

const emit = defineEmits(['close', 'save', 'changeState', 'delete'])

const isEditing = ref(false)
const showDisclaimer = ref(false)
const today = new Date()

const tipos = ['CONVOCATORIA', 'INSCRIPCION', 'EXAMEN', 'RESULTADO', 'LOGISTICA', 'MANTENIMIENTO', 'SOPORTE', 'RECLAMO', 'CRONOGRAMA', 'MATERIAL', 'CEREMONIA', 'CAPACITACION', 'GENERAL']

// Ahora devuelve un objeto Date nativo en lugar de un string formateado
const getFutureDate = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 10)
  return d
}

const form = reactive({
  titulo: '',
  descripcion: '',
  tipo: '',
  prioridad: 'MEDIA',
  fecha_publicacion: getFutureDate() as Date // Tipado explícito como Date
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    showDisclaimer.value = false
    if (props.aviso) {
      isEditing.value = false
      Object.assign(form, {
        titulo: props.aviso.titulo,
        descripcion: props.aviso.descripcion,
        tipo: props.aviso.tipo,
        prioridad: props.aviso.prioridad,
        // Convertimos el string ISO que viene del backend a un objeto Date nativo
        fecha_publicacion: props.aviso.fecha_publicacion ? new Date(props.aviso.fecha_publicacion) : getFutureDate()
      })
    } else {
      isEditing.value = true
      Object.assign(form, { 
        titulo: '', 
        descripcion: '', 
        tipo: '', 
        prioridad: 'MEDIA', 
        fecha_publicacion: getFutureDate() 
      })
    }
  }
})

const isViewMode = computed(() => !!props.aviso && !isEditing.value)

const handleSubmit = () => {
  if (!form.titulo || !form.descripcion || !form.tipo || !form.fecha_publicacion) return
  
  // Aseguramos que la fecha sea un objeto Date y lo convertimos a ISOString (añade el sufijo 'Z' automáticamente)
  const dateObj = form.fecha_publicacion instanceof Date ? form.fecha_publicacion : new Date(form.fecha_publicacion)
  const fechaIso = dateObj.toISOString() // Ejemplo resultado: "2026-06-08T12:34:56.000Z"

  emit('save', { 
    isNew: !props.aviso, 
    data: { 
      ...form, 
      fecha_publicacion: fechaIso, // Se envía limpio en formato Z IsoString
      estado: props.aviso ? props.aviso.estado : 'BORRADOR' 
    } 
  })
}

// Soporta tanto objetos Date (modo edición) como strings ISO (modo vista inicial) para la visualización del usuario
const formatFecha = (fecha: any) => {
  if (!fecha) return ''
  const date = fecha instanceof Date ? fecha : new Date(fecha)
  if (isNaN(date.getTime())) return String(fecha)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}

const getPrioridadColor = (prioridad: string) => {
  switch (prioridad) {
    case 'ALTA': return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'MEDIA': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'BAJA': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/50 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <TransitionChild as="template" enter="transform transition ease-in-out duration-300" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-300" leave-from="translate-x-0" leave-to="translate-x-full">
              <DialogPanel class="pointer-events-auto w-screen max-w-md flex flex-col bg-white shadow-2xl">
                
                <div class="flex items-center justify-between px-6 py-4" style="background-color: var(--color-primary)">
                  <DialogTitle class="text-base font-bold text-white flex items-center gap-2">
                    {{ aviso ? (isEditing ? 'Modificando Aviso' : 'Detalles del Aviso') : 'Nuevo Registro de Aviso' }}
                  </DialogTitle>
                  <button @click="emit('close')" class="text-white/80 hover:text-white rounded-md p-1 transition-colors hover:bg-white/10">
                    <X class="w-5 h-5" />
                  </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  <div v-if="aviso && isViewMode" class="flex items-center gap-3 p-3 rounded-md border" :style="{ backgroundColor: 'var(--color-background)' }">
                    <div class="flex-1">
                      <p class="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Estado Operativo</p>
                      <p class="text-sm font-bold text-gray-900">{{ aviso.estado }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button v-if="aviso.estado === 'BORRADOR' || aviso.estado === 'OCULTO'" @click="emit('changeState', 'PUBLICADO')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition">
                        <Globe class="w-3.5 h-3.5" /> Publicar
                      </button>
                      <button v-if="aviso.estado === 'PUBLICADO'" @click="emit('changeState', 'OCULTO')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold transition">
                        <EyeOff class="w-3.5 h-3.5" /> Ocultar
                      </button>
                    </div>
                  </div>

                  <div v-if="isViewMode" class="space-y-5">
                    <div>
                      <h2 class="text-2xl font-black text-gray-900 leading-tight mb-3">
                        {{ form.titulo }}
                      </h2>
                      <div class="flex flex-wrap gap-2">
                        <span class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                          {{ form.tipo }}
                        </span>
                        <span :class="['px-2.5 py-1 text-[11px] font-bold rounded-md border', getPrioridadColor(form.prioridad)]">
                          Prioridad {{ form.prioridad }}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción General</h3>
                      <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-100">
                        {{ form.descripcion }}
                      </p>
                    </div>

                    <div>
                      <h3 class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha de Publicación</h3>
                      <div class="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Calendar class="w-4 h-4 text-gray-500" />
                        {{ formatFecha(form.fecha_publicacion) }}
                      </div>
                    </div>
                  </div>

                  <div v-else class="space-y-5 relative" :class="{ 'opacity-80 pointer-events-none': loading }">
                    <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Título del Aviso *</label>
                      <input v-model="form.titulo" type="text" class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-(--color-primary) transition-all" placeholder="Escriba el título del aviso..." />
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción General *</label>
                      <textarea v-model="form.descripcion" rows="5" class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-(--color-primary) transition-all resize-none" placeholder="Detalle la información..."></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo *</label>
                        <select v-model="form.tipo" class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-(--color-primary) transition-all">
                          <option value="" disabled>Seleccione</option>
                          <option v-for="t in tipos" :key="t" :value="t">{{ t }}</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prioridad *</label>
                        <select v-model="form.prioridad" class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-(--color-primary) transition-all">
                          <option value="BAJA">BAJA</option>
                          <option value="MEDIA">MEDIA</option>
                          <option value="ALTA">ALTA</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fecha de Publicación *</label>
                      <DatePicker v-model="form.fecha_publicacion" mode="dateTime" is24hr :min-date="today">
                        <template #default="{ inputValue, inputEvents }">
                          <div class="relative">
                            <input :value="inputValue" v-on="inputEvents" readonly class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 cursor-pointer focus:ring-2 focus:ring-(--color-primary) transition-all" />
                          </div>
                        </template>
                      </DatePicker>
                    </div>
                  </div>
                </div>

                <div class="border-t border-gray-200 bg-gray-50 p-6 flex flex-col gap-3 shrink-0">
                  <div v-if="showDisclaimer" class="flex flex-col items-center text-center">
                    <AlertTriangle class="w-8 h-8 text-rose-600 mb-2" />
                    <p class="text-sm font-bold text-rose-900 mb-1">¿Eliminar permanentemente?</p>
                    <p class="text-xs text-rose-700 mb-4">Esta acción no se puede deshacer y borrará el registro del sistema.</p>
                    <div class="flex gap-3 w-full">
                      <button @click="emit('delete', aviso.id_aviso)" class="flex-1 bg-rose-600 text-white px-4 py-2.5 rounded-md text-sm font-bold hover:bg-rose-700 transition">Confirmar</button>
                      <button @click="showDisclaimer = false" class="flex-1 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-md text-sm font-bold hover:bg-gray-50 transition">Cancelar</button>
                    </div>
                  </div>

                  <template v-else>
                    <template v-if="isViewMode">
                      <button @click="isEditing = true" class="w-full flex justify-center items-center gap-2 text-white px-4 py-3 rounded-md text-sm font-bold shadow-sm transition" style="background-color: var(--color-accent)">
                        <Edit2 class="w-4 h-4" /> Modificar Información
                      </button>
                      <button @click="showDisclaimer = true" class="w-full flex justify-center items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-md text-sm font-bold hover:bg-rose-100 transition mt-2">
                        <Trash2 class="w-4 h-4" /> Eliminar permanentemente
                      </button>
                    </template>
                    
                    <template v-else>
                      <button @click="handleSubmit" :disabled="loading || !form.titulo || !form.descripcion || !form.tipo || !form.fecha_publicacion" class="w-full flex justify-center items-center gap-2 text-white px-4 py-3 rounded-md text-sm font-bold shadow-sm transition disabled:opacity-50" style="background-color: var(--color-accent)">
                        <Save class="w-4 h-4" /> {{ loading ? 'Guardando...' : 'Guardar Información' }}
                      </button>
                      <button @click="aviso ? isEditing = false : emit('close')" class="w-full px-4 py-3 border border-gray-300 rounded-md text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition">
                        Cancelar
                      </button>
                    </template>
                  </template>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>