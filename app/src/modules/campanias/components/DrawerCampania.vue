<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  X, Edit, Save, XCircle, Trash2, Send, Ban, AlertTriangle,
  Loader2, Link, Users
} from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { campaniasService } from '@/modules/campanias/services/campanias.service'
import type { CampaniaDTO, CampaniaUpdateDTO, EstadoCampania, EnlaceDTO } from '@/modules/campanias/types/campanias.api'

const props = defineProps<{ open: boolean; campania: CampaniaDTO | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated', c: CampaniaDTO): void
  (e: 'deleted', id: number): void
  (e: 'error', msg: string): void
}>()

const isEditing = ref(false)
const isSaving = ref(false)
const isActuando = ref(false)
const showConfirm = ref<'eliminar' | 'cancelar' | 'programar' | null>(null)

const form = ref({ nombre: '', asunto: '', contenido_mensaje: '', contenido_secundario: '', fecha_programada: '', enlaces: [] as EnlaceDTO[] })

const extractError = (err: any, fallback: string) => {
  const d = err?.response?.data ?? err?.data ?? err?.details ?? null
  const msg = d ? (d.error || d.message || d.detail || fallback) : (err?.message && !err.message.includes('status code') ? err.message : fallback)
  emit('error', msg)
}

watch(() => props.campania, (c) => {
  if (!c) return
  form.value = {
    nombre: c.nombre,
    asunto: c.asunto,
    contenido_mensaje: c.contenido_mensaje,
    contenido_secundario: c.contenido_secundario ?? '',
    fecha_programada: c.fecha_programada ? c.fecha_programada.slice(0, 16) : '',
    enlaces: c.enlaces ? [...c.enlaces.map((e) => ({ ...e }))] : [],
  }
  isEditing.value = false
  showConfirm.value = null
})

const cancelEdit = () => {
  if (!props.campania) return
  form.value = {
    nombre: props.campania.nombre,
    asunto: props.campania.asunto,
    contenido_mensaje: props.campania.contenido_mensaje,
    contenido_secundario: props.campania.contenido_secundario ?? '',
    fecha_programada: props.campania.fecha_programada ? props.campania.fecha_programada.slice(0, 16) : '',
    enlaces: props.campania.enlaces ? [...props.campania.enlaces.map((e) => ({ ...e }))] : [],
  }
  isEditing.value = false
}

const save = async () => {
  if (!props.campania) return
  isSaving.value = true
  try {
    const payload: CampaniaUpdateDTO = {
      nombre: form.value.nombre.trim() || null,
      asunto: form.value.asunto.trim() || null,
      contenido_mensaje: form.value.contenido_mensaje.trim() || null,
      contenido_secundario: form.value.contenido_secundario.trim() || null,
      fecha_programada: form.value.fecha_programada || null,
      enlaces: form.value.enlaces.filter((e) => e.url && e.texto).length > 0 ? form.value.enlaces.filter((e) => e.url && e.texto) : null,
    }
    const res = await campaniasService.actualizarCampania(props.campania.id_campania_email, payload)
    emit('updated', res.data)
    isEditing.value = false
  } catch (err) {
    extractError(err, 'No se pudo guardar la campaña.')
  } finally {
    isSaving.value = false
  }
}

const cambiarEstado = async (estado: EstadoCampania) => {
  if (!props.campania) return
  isActuando.value = true
  try {
    const res = await campaniasService.cambiarEstadoCampania(props.campania.id_campania_email, { estado })
    emit('updated', res.data)
    showConfirm.value = null
  } catch (err) {
    extractError(err, 'No se pudo cambiar el estado.')
  } finally {
    isActuando.value = false
  }
}

const eliminar = async () => {
  if (!props.campania) return
  isActuando.value = true
  try {
    await campaniasService.eliminarCampania(props.campania.id_campania_email)
    emit('deleted', props.campania.id_campania_email)
    showConfirm.value = null
    emit('close')
  } catch (err) {
    extractError(err, 'No se pudo eliminar la campaña.')
  } finally {
    isActuando.value = false
  }
}

const addEnlace = () => form.value.enlaces.push({ url: '', texto: '' })
const removeEnlace = (idx: number) => form.value.enlaces.splice(idx, 1)

const formatDate = (raw: string | null) => {
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const estadoBadgeClass: Record<EstadoCampania, string> = {
  BORRADOR:   'border-[var(--color-estado-borrador)] bg-[var(--color-estado-borrador-soft)] text-[var(--color-estado-borrador)]',
  PROGRAMADA: 'border-[var(--color-estado-proxima)] bg-[var(--color-estado-proxima-soft)] text-[var(--color-estado-proxima)]',
  EN_PROCESO: 'border-[var(--color-estado-inscripcion)] bg-[var(--color-estado-inscripcion-soft)] text-[var(--color-estado-inscripcion)]',
  FINALIZADA: 'border-[var(--color-estado-finalizada)] bg-[var(--color-estado-finalizada-soft)] text-[var(--color-estado-finalizada)]',
  CANCELADA:  'border-[var(--color-estado-cancelada)] bg-[var(--color-estado-cancelada-soft)] text-[var(--color-estado-cancelada)]',
  FALLIDA:    'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger-text)]',
}

const canEdit = (e: EstadoCampania) => e === 'BORRADOR' || e === 'PROGRAMADA'
const canProgram = (e: EstadoCampania) => e === 'BORRADOR'
const canCancel = (e: EstadoCampania) => e !== 'CANCELADA' && e !== 'FINALIZADA'

const inputClass = 'h-10 w-full rounded-lg border border-gray-300 px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-gray-50 disabled:text-text-muted'
const textareaClass = 'min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-gray-50 disabled:text-text-muted'
</script>

<template>
  <Transition name="drawer">
    <div v-if="open" class="fixed inset-0 z-60 flex">
      <div class="flex-1 bg-black/40" @click="emit('close')" />
      <div class="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-gray-200 bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-gray-200 bg-primary px-5 py-4">
          <div>
            <p class="text-xs font-medium text-white/60 uppercase tracking-wider">Campaña</p>
            <h2 class="font-heading text-lg font-bold text-white leading-tight line-clamp-1">
              {{ campania?.nombre ?? 'Detalle' }}
            </h2>
          </div>
          <Button variant="ghost" size="sm" class="text-white hover:bg-white/20" @click="emit('close')">
            <X class="h-5 w-5" />
          </Button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-5">
          <div v-if="campania" class="flex flex-wrap items-center gap-2">
            <Badge variant="outline" :class="`border px-2.5 py-1 text-xs font-bold ${estadoBadgeClass[campania.estado]}`">
              {{ campania.estado.replace('_', ' ') }}
            </Badge>
            <span class="text-xs text-text-muted">Creada el {{ formatDate(campania.fecha_creacion) }}</span>
          </div>

          <div v-if="showConfirm" class="rounded-xl border border-warning/30 bg-warning/10 p-4 space-y-3">
            <div class="flex items-center gap-2">
              <AlertTriangle class="h-5 w-5 text-warning" />
              <p class="text-sm font-bold text-text-main">
                {{ showConfirm === 'eliminar' ? '¿Eliminar campaña?' : showConfirm === 'cancelar' ? '¿Cancelar campaña?' : '¿Programar campaña?' }}
              </p>
            </div>
            <p class="text-sm text-text-muted">
              {{ showConfirm === 'eliminar' ? 'Esta acción es permanente e irreversible.' : showConfirm === 'cancelar' ? 'Se detendrá el proceso de envío de forma definitiva.' : 'La campaña cambiará al estado programada para su posterior distribución.' }}
            </p>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" :disabled="isActuando" @click="showConfirm = null">Cancelar</Button>
              <Button
                size="sm"
                :class="showConfirm === 'programar' ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-error text-white hover:bg-error/90'"
                :disabled="isActuando"
                @click="showConfirm === 'eliminar' ? eliminar() : showConfirm === 'cancelar' ? cambiarEstado('CANCELADA') : cambiarEstado('PROGRAMADA')"
              >
                <Loader2 v-if="isActuando" class="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {{ showConfirm === 'eliminar' ? 'Sí, eliminar' : showConfirm === 'cancelar' ? 'Sí, cancelar' : 'Sí, programar' }}
              </Button>
            </div>
          </div>

          <div v-if="campania" class="flex flex-wrap gap-2">
            <template v-if="!isEditing">
              <Button
                v-if="canEdit(campania.estado)"
                variant="outline"
                size="sm"
                class="flex items-center gap-1.5 text-xs"
                @click="isEditing = true"
              >
                <Edit class="h-3.5 w-3.5" />Editar
              </Button>
              <Button
                v-if="canProgram(campania.estado)"
                size="sm"
                class="flex items-center gap-1.5 bg-primary text-white hover:bg-primary-dark text-xs"
                @click="showConfirm = 'programar'"
              >
                <Send class="h-3.5 w-3.5" />Programar envío
              </Button>
              <Button
                v-if="canCancel(campania.estado)"
                variant="outline"
                size="sm"
                class="flex items-center gap-1.5 text-error hover:border-error/40 text-xs"
                @click="showConfirm = 'cancelar'"
              >
                <Ban class="h-3.5 w-3.5" />Cancelar envío
              </Button>
              <Button
                v-if="campania.estado === 'BORRADOR'"
                variant="ghost"
                size="sm"
                class="flex items-center gap-1.5 text-error hover:bg-error/10 text-xs"
                @click="showConfirm = 'eliminar'"
              >
                <Trash2 class="h-3.5 w-3.5" />Eliminar
              </Button>
            </template>
            <template v-else>
              <Button variant="outline" size="sm" class="text-xs" :disabled="isSaving" @click="cancelEdit">
                <XCircle class="mr-1 h-3.5 w-3.5" />Cancelar
              </Button>
              <Button size="sm" class="flex items-center gap-1.5 bg-primary text-white hover:bg-primary-dark text-xs" :disabled="isSaving" @click="save">
                <Loader2 v-if="isSaving" class="h-3.5 w-3.5 animate-spin" />
                <Save v-else class="h-3.5 w-3.5" />Guardar
              </Button>
            </template>
          </div>

          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Nombre</label>
              <input v-model="form.nombre" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Asunto</label>
              <input v-model="form.asunto" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Fecha programada</label>
              <input v-model="form.fecha_programada" type="datetime-local" :disabled="!isEditing" :class="inputClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Mensaje principal</label>
              <textarea v-model="form.contenido_mensaje" :disabled="!isEditing" :class="textareaClass" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold text-text-muted">Mensaje secundario</label>
              <textarea v-model="form.contenido_secundario" :disabled="!isEditing" :class="textareaClass" />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-text-muted flex items-center gap-1.5">
                  <Link class="h-3.5 w-3.5" />Enlaces
                </label>
                <Button v-if="isEditing" variant="outline" size="sm" class="text-xs" @click="addEnlace">
                  + Agregar
                </Button>
              </div>
              <div v-if="form.enlaces.length === 0" class="text-xs text-text-muted">Sin enlaces.</div>
              <div v-for="(enlace, idx) in form.enlaces" :key="idx" class="flex items-center gap-2">
                <input v-model="enlace.texto" :disabled="!isEditing" :class="inputClass" placeholder="Texto" />
                <input v-model="enlace.url" :disabled="!isEditing" :class="inputClass" placeholder="URL" />
                <Button v-if="isEditing" variant="ghost" size="sm" class="text-error hover:bg-error/10" @click="removeEnlace(idx)">
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div v-if="campania?.destinatarios && campania.destinatarios.length > 0" class="space-y-2">
              <p class="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                <Users class="h-3.5 w-3.5" />Destinatarios ({{ campania.destinatarios.length }})
              </p>
              <div class="max-h-48 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                <div v-for="d in campania.destinatarios" :key="d.estudiante.id_estudiante" class="flex items-center justify-between px-3 py-2">
                  <p class="text-sm font-medium text-text-main">
                    {{ d.estudiante.nombres }} {{ d.estudiante.paterno }}
                  </p>
                  <p class="text-xs text-text-muted">{{ d.estudiante.correo ?? 'Sin correo' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.25s ease;
}
.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>