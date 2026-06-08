<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  X, Edit, Save, XCircle, CheckCircle, Trash2, AlertTriangle, Loader2, UserCog,
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import type { EstudianteItem } from '@/modules/inscripcion/components/EstudianteDetalleModal.vue'
import { estudiantesService } from '@/modules/estudiantes/services/estudiantes.service'
import { inscripcionesService } from '@/modules/inscripcion/services/inscripcion.service'
import type { NivelEducativo } from '@/modules/inscripcion/types/inscripcion.api'
import type { EstudianteUpdateDTO } from '@/modules/estudiantes/types/estudiantes.api'

const props = defineProps<{
  open: boolean
  student: EstudianteItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated', student: EstudianteItem): void
  (e: 'deleted', id: string): void
}>()

const isEditing = ref(false)
const isSaving = ref(false)
const isChangingEstado = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const errorMessage = ref('')

const form = ref({
  nombres: '',
  paterno: '',
  materno: '',
  email: '',
  telefono: '',
  rude: '',
  curso: '',
  nivel: '' as NivelEducativo | '',
})

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

watch(() => props.student, (s) => {
  if (!s) return
  form.value = {
    nombres: s.nombres,
    paterno: s.apellidos.split(' ')[0] ?? '',
    materno: s.apellidos.split(' ').slice(1).join(' ') ?? '',
    email: s.email === 'Sin correo' ? '' : s.email,
    telefono: s.telefono === 'Sin teléfono' ? '' : s.telefono,
    rude: s.rude === 'Sin RUDE' ? '' : s.rude,
    curso: s.curso,
    nivel: (s.nivel as NivelEducativo) || '',
  }
  isEditing.value = false
  errorMessage.value = ''
  showDeleteModal.value = false
}, { immediate: true })

const cancelEdit = () => {
  if (!props.student) return
  form.value = {
    nombres: props.student.nombres,
    paterno: props.student.apellidos.split(' ')[0] ?? '',
    materno: props.student.apellidos.split(' ').slice(1).join(' ') ?? '',
    email: props.student.email === 'Sin correo' ? '' : props.student.email,
    telefono: props.student.telefono === 'Sin teléfono' ? '' : props.student.telefono,
    rude: props.student.rude === 'Sin RUDE' ? '' : props.student.rude,
    curso: props.student.curso,
    nivel: (props.student.nivel as NivelEducativo) || '',
  }
  isEditing.value = false
  errorMessage.value = ''
}

const saveEstudiante = async () => {
  if (!props.student?.idEstudiante) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    const payload: EstudianteUpdateDTO = {
      nombres: form.value.nombres.trim() || null,
      paterno: form.value.paterno.trim() || null,
      materno: form.value.materno.trim() || null,
      correo: form.value.email.trim() || null,
      telefono: form.value.telefono.trim() || null,
      rude: form.value.rude.trim() || null,
      curso: form.value.curso ? Number(form.value.curso) : null,
      nivel: form.value.nivel || null,
    }
    const res = await estudiantesService.actualizarEstudiante(props.student.idEstudiante, payload)
    const updated: EstudianteItem = {
      ...props.student,
      nombres: res.data.nombres,
      apellidos: [res.data.paterno, res.data.materno].filter(Boolean).join(' '),
      email: res.data.correo ?? 'Sin correo',
      telefono: res.data.telefono ? String(res.data.telefono) : 'Sin teléfono',
      rude: res.data.rude ?? 'Sin RUDE',
      curso: String(res.data.curso),
      nivel: res.data.nivel,
      colegio: res.data.colegio?.nombre ?? props.student.colegio,
    }
    emit('updated', updated)
    isEditing.value = false
  } catch (err) {
    extractError(err, 'No se pudo guardar los cambios.')
  } finally {
    isSaving.value = false
  }
}

const cambiarEstadoInscripcion = async (nuevoEstado: 'APROBADO' | 'RECHAZADO') => {
  if (!props.student) return
  isChangingEstado.value = true
  errorMessage.value = ''
  try {
    await inscripcionesService.cambiarEstadoInscripcion(Number(props.student.id), { estado: nuevoEstado })
    emit('updated', { ...props.student, estado: nuevoEstado })
  } catch (err) {
    extractError(err, 'No se pudo cambiar el estado.')
  } finally {
    isChangingEstado.value = false
  }
}

const eliminarInscripcion = async () => {
  if (!props.student) return
  isDeleting.value = true
  errorMessage.value = ''
  try {
    await inscripcionesService.eliminarInscripcionFisica(Number(props.student.id))
    emit('deleted', props.student.id)
    showDeleteModal.value = false
  } catch (err) {
    extractError(err, 'No se pudo eliminar la inscripción.')
  } finally {
    isDeleting.value = false
  }
}

const estadoClass = (estado: EstudianteItem['estado']) => {
  if (estado === 'APROBADO') return 'border-success/20 bg-success/10 text-success'
  if (estado === 'RECHAZADO') return 'border-error/20 bg-error/10 text-error'
  if (estado === 'PENDIENTE') return 'border-warning/20 bg-warning/10 text-warning'
  return 'border-gray-200 bg-gray-100 text-text-muted'
}

const inputClass = 'h-10 w-full rounded-lg border border-gray-300 px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-gray-50 disabled:text-text-muted'
</script>

<template>
  <div
    v-if="open && student"
    class="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4"
  >
    <div class="fixed inset-0 z-80" v-if="showDeleteModal">
      <div class="flex h-full items-center justify-center p-4">
        <Card class="w-full max-w-md border-gray-200 bg-white shadow-soft">
          <CardHeader class="border-b border-gray-200">
            <CardTitle class="flex items-center gap-2">
              <AlertTriangle class="h-5 w-5 text-error" />
              Eliminar inscripción
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4 p-5">
            <p class="text-sm text-text-muted">
              ¿Estás seguro de eliminar permanentemente la inscripción de
              <span class="font-bold text-text-main">{{ student.nombres }} {{ student.apellidos }}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div v-if="errorMessage" class="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {{ errorMessage }}
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="outline" :disabled="isDeleting" @click="showDeleteModal = false">Cancelar</Button>
              <Button
                class="flex items-center gap-2 bg-error text-white hover:bg-error/90"
                :disabled="isDeleting"
                @click="eliminarInscripcion"
              >
                <Loader2 v-if="isDeleting" class="h-4 w-4 animate-spin" />
                <Trash2 v-else class="h-4 w-4" />
                Eliminar definitivamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Card class="my-auto w-full max-w-xl border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-200">
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <UserCog class="h-5 w-5 text-primary" />
            Administrar Inscripción
          </CardTitle>
          <Button variant="ghost" size="sm" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent class="space-y-5 p-5">
        <div v-if="errorMessage && !showDeleteModal" class="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {{ errorMessage }}
          <button class="ml-2 font-bold hover:opacity-70" @click="errorMessage = ''">✕</button>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-dark text-sm font-bold text-white">
              {{ student.nombres.charAt(0) }}{{ student.apellidos.charAt(0) }}
            </div>
            <div>
              <p class="font-bold text-text-main">{{ student.nombres }} {{ student.apellidos }}</p>
              <p class="text-xs text-text-muted font-mono">CI: {{ student.carnet }}</p>
            </div>
          </div>
          <Badge variant="outline" :class="estadoClass(student.estado)">
            {{ student.estado === 'SIN_ESTADO' ? 'Registrado' : student.estado }}
          </Badge>
        </div>

        <div class="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p class="w-full text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Estado de inscripción</p>
          <Button
            v-if="student.estado !== 'APROBADO'"
            class="flex items-center gap-2 bg-success text-white hover:bg-success/90 text-sm"
            :disabled="isChangingEstado"
            @click="cambiarEstadoInscripcion('APROBADO')"
            variant="not_allowed"
          >
            <Loader2 v-if="isChangingEstado" class="h-4 w-4 animate-spin" />
            <CheckCircle v-else class="h-4 w-4" />
            Aprobar
          </Button>
          <Button
            v-if="student.estado !== 'RECHAZADO'"
            class="flex items-center gap-2 bg-error text-white hover:bg-error/90 text-sm"
            :disabled="isChangingEstado"
            @click="cambiarEstadoInscripcion('RECHAZADO')"
          >
            <Loader2 v-if="isChangingEstado" class="h-4 w-4 animate-spin" />
            <XCircle v-else class="h-4 w-4" />
            Rechazar
          </Button>
          <Button
            variant="outline"
            class="flex items-center gap-2 text-error hover:border-error/40 hover:bg-error/5 text-sm ml-auto"
            @click="showDeleteModal = true"
          >
            <Trash2 class="h-4 w-4" />
            Eliminar inscripción
          </Button>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold uppercase tracking-wider text-text-muted">Datos del estudiante</p>
            <div class="flex gap-2">
              <template v-if="!isEditing">
                <Button variant="outline" size="sm" class="flex items-center gap-1.5 text-xs" @click="isEditing = true">
                  <Edit class="h-3.5 w-3.5" />Editar
                </Button>
              </template>
              <template v-else>
                <Button variant="outline" size="sm" class="flex items-center gap-1.5 text-xs" :disabled="isSaving" @click="cancelEdit">
                  <XCircle class="h-3.5 w-3.5" />Cancelar
                </Button>
                <Button
                  size="sm"
                  class="flex items-center gap-1.5 bg-primary text-white hover:bg-primary-dark text-xs"
                  :disabled="isSaving"
                  @click="saveEstudiante"
                >
                  <Loader2 v-if="isSaving" class="h-3.5 w-3.5 animate-spin" />
                  <Save v-else class="h-3.5 w-3.5" />
                  Guardar
                </Button>
              </template>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Nombres</label>
              <input v-model="form.nombres" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Apellido paterno</label>
              <input v-model="form.paterno" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Apellido materno</label>
              <input v-model="form.materno" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Correo</label>
              <input v-model="form.email" type="email" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Teléfono</label>
              <input v-model="form.telefono" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">RUDE</label>
              <input v-model="form.rude" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Curso</label>
              <input v-model="form.curso" type="number" disabled :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Nivel</label>
              <select v-model="form.nivel" disabled :class="inputClass">
                <option value="PRIMARIA">Primaria</option>
                <option value="SECUNDARIA">Secundaria</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Carnet identidad</label>
              <input :value="student.carnet" disabled :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Fecha nacimiento</label>
              <input :value="student.fechaNacimiento" disabled :class="inputClass" />
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <Button variant="outline" @click="emit('close')">Cerrar</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>