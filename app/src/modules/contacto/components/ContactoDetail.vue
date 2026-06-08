<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowLeft, User, MessageSquareText, CheckCircle2, Reply, Mail, Send, LoaderCircle, History, Trash2, AlertTriangle, Plus, X } from 'lucide-vue-next'
import { contactoService } from '../services/contacto.service'
import type { ContactoCompletoDTO, ContactoRespuestaCreateDTO, EnlaceDTO } from '../types/contacto.api'

const props = defineProps<{
  contactoId: number | null
}>()

const emit = defineEmits(['close', 'mutated', 'error'])

const contacto = ref<ContactoCompletoDTO | null>(null)
const loading = ref(false)
const mutating = ref(false)
const isReplyOpen = ref(false)
const showDeleteDisclaimer = ref(false)

const replyForm = ref({
  asunto_correo: '',
  contenido_mensaje: '',
  contenido_secundario: '',
  enlaces: [] as EnlaceDTO[]
})

const fetchDetalle = async (id: number) => {
  loading.value = true
  contacto.value = null
  isReplyOpen.value = false
  showDeleteDisclaimer.value = false
  try {
    const response = await contactoService.obtenerContactoPorId(id)
    if (response.success && response.data) {
      contacto.value = response.data
    }
  } catch (error) {
    emit('error', error)
  } finally {
    loading.value = false
  }
}

const marcarLeido = async () => {
  if (!contacto.value) return
  mutating.value = true
  try {
    const response = await contactoService.marcarContactoLeido(contacto.value.id_contacto)
    if (response.success) {
      contacto.value.estado = 'LEIDO'
      emit('mutated')
    }
  } catch (error) {
    emit('error', error)
  } finally {
    mutating.value = false
  }
}

const openReply = () => {
  if (!contacto.value) return
  showDeleteDisclaimer.value = false
  replyForm.value = {
    asunto_correo: `Re: ${contacto.value.asunto}`,
    contenido_mensaje: '',
    contenido_secundario: '',
    enlaces: []
  }
  isReplyOpen.value = true
}

const addEnlace = () => {
  replyForm.value.enlaces.push({ texto: '', url: '' })
}

const removeEnlace = (index: number) => {
  replyForm.value.enlaces.splice(index, 1)
}

const enviarRespuesta = async () => {
  if (!contacto.value || !replyForm.value.asunto_correo.trim() || !replyForm.value.contenido_mensaje.trim()) return
  mutating.value = true
  try {
    const validEnlaces = replyForm.value.enlaces.filter(e => e.texto.trim() && e.url.trim())

    const payload: ContactoRespuestaCreateDTO = {
      asunto_correo: replyForm.value.asunto_correo,
      contenido_mensaje: replyForm.value.contenido_mensaje,
      contenido_secundario: replyForm.value.contenido_secundario.trim() || null,
      enlaces: validEnlaces.length > 0 ? validEnlaces : null
    }

    const response = await contactoService.responderContacto(contacto.value.id_contacto, payload)
    if (response.success) {
      isReplyOpen.value = false
      contacto.value = response.data
      emit('mutated')
    }
  } catch (error) {
    emit('error', error)
  } finally {
    mutating.value = false
  }
}

const confirmarEliminacion = async () => {
  if (!contacto.value) return
  mutating.value = true
  try {
    const response = await contactoService.eliminarContacto(contacto.value.id_contacto)
    if (response.success) {
      emit('mutated')
      emit('close')
    }
  } catch (error) {
    emit('error', error)
  } finally {
    mutating.value = false
    showDeleteDisclaimer.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr))
}

watch(() => props.contactoId, (newId) => {
  if (newId) fetchDetalle(newId)
  else contacto.value = null
}, { immediate: true })
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50/60">
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-8">
      <LoaderCircle class="w-8 h-8 text-primary animate-spin mb-2" />
      <span class="text-sm font-medium text-gray-500">Cargando detalles...</span>
    </div>

    <template v-else-if="contacto">
      <div class="border-b border-gray-200 bg-white p-4 shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="$emit('close')" class="lg:hidden p-1.5 hover:bg-gray-100 rounded-md text-gray-500">
              <ArrowLeft class="h-5 w-5" />
            </button>
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold">
              <User class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <h2 class="truncate text-base font-bold text-gray-900">{{ contacto.nombre_completo }}</h2>
              <p class="truncate text-xs text-gray-500">{{ contacto.correo_electronico }}</p>
            </div>
          </div>
          <button 
            @click="showDeleteDisclaimer = true; isReplyOpen = false"
            class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar contacto"
          >
            <Trash2 class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        <div v-if="showDeleteDisclaimer" class="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3 shadow-sm">
          <div class="flex items-start gap-2.5 text-red-800">
            <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p class="text-xs font-bold">¿Eliminar permanentemente este contacto?</p>
              <p class="text-[11px] text-red-700/90 mt-0.5">Esta acción borrará el mensaje y su historial de envíos de la base de datos irreversiblemente.</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-1">
            <button @click="showDeleteDisclaimer = false" class="px-3 py-1.5 text-[11px] font-bold bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button @click="confirmarEliminacion" :disabled="mutating" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm disabled:opacity-50 transition-colors">
              <LoaderCircle v-if="mutating" class="w-3 h-3 animate-spin" />
              Confirmar Eliminación
            </button>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div class="border-b border-gray-100 p-4 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-sm font-bold text-gray-900">
              <MessageSquareText class="h-4 w-4 text-primary" />
              <span>ASUNTO: {{ contacto.asunto }}</span>
            </div>
            <span class="text-xs font-semibold text-gray-400">{{ formatDate(contacto.fecha_creacion) }}</span>
          </div>
          
          <div class="p-4 space-y-5">
            <div class="rounded-xl border border-gray-100 bg-gray-50/30 p-4">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Mensaje Recibido</p>
              <p class="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{{ contacto.mensaje }}</p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button 
                v-if="contacto.estado === 'PENDIENTE'" 
                :disabled="mutating"
                @click="marcarLeido"
                class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 class="h-4 w-4 text-emerald-600" />
                Marcar como leído
              </button>
              <button 
                v-if="contacto.estado !== 'RESPONDIDO'"
                :disabled="mutating"
                @click="openReply"
                class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50 shadow-sm transition-colors"
              >
                <Reply class="h-4 w-4" />
                Responder mensaje
              </button>
            </div>

            <div v-if="isReplyOpen" class="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
              <div class="flex items-center gap-2 text-sm font-bold text-primary">
                <Mail class="h-4 w-4" />
                <span>Respuesta a {{ contacto.correo_electronico }}</span>
              </div>
              <div class="space-y-4">
                
                <div>
                  <label class="mb-1 block text-[11px] font-bold text-gray-700 uppercase">Asunto del Correo <span class="text-red-500">*</span></label>
                  <input v-model="replyForm.asunto_correo" class="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                
                <div>
                  <label class="mb-1 block text-[11px] font-bold text-gray-700 uppercase">Contenido Principal <span class="text-red-500">*</span></label>
                  <textarea v-model="replyForm.contenido_mensaje" rows="4" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-400 resize-y" placeholder="Escribe tu respuesta oficial aquí..." />
                </div>

                <div>
                  <label class="mb-1 block text-[11px] font-bold text-gray-700 uppercase">Contenido Secundario <span class="font-normal text-gray-400 normal-case">(Opcional)</span></label>
                  <textarea v-model="replyForm.contenido_secundario" rows="2" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-400 resize-y" placeholder="Mensaje adicional o despedida..." />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="block text-[11px] font-bold text-gray-700 uppercase">Enlaces Adjuntos <span class="font-normal text-gray-400 normal-case">(Opcional)</span></label>
                    <button @click="addEnlace" type="button" class="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80">
                      <Plus class="w-3 h-3" /> Añadir Enlace
                    </button>
                  </div>
                  
                  <div v-for="(enlace, index) in replyForm.enlaces" :key="index" class="flex gap-2 items-center bg-white p-2 rounded-md border border-gray-200">
                    <input v-model="enlace.texto" class="h-8 flex-1 rounded-md border border-gray-300 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Texto a mostrar (Ej: Ver Documento)" />
                    <input v-model="enlace.url" type="url" class="h-8 flex-1 rounded-md border border-gray-300 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://..." />
                    <button @click="removeEnlace(index)" class="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 transition-colors">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                  <p v-if="replyForm.enlaces.length === 0" class="text-[10px] text-gray-400">No se adjuntarán enlaces a este correo.</p>
                </div>

                <div class="flex justify-end gap-2 pt-2 border-t border-primary/10">
                  <button @click="isReplyOpen = false" class="px-3 py-2 text-xs font-semibold rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button 
                    :disabled="mutating || !replyForm.asunto_correo.trim() || !replyForm.contenido_mensaje.trim()"
                    @click="enviarRespuesta" 
                    class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-colors"
                  >
                    <LoaderCircle v-if="mutating" class="w-4 h-4 animate-spin" />
                    <Send v-else class="h-4 w-4" />
                    Enviar respuesta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="contacto.email_logs && contacto.email_logs.length > 0" class="space-y-3">
          <div class="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <History class="w-3.5 h-3.5" />
            <span>Historial de Envíos</span>
          </div>
          <div class="space-y-3">
            <div 
              v-for="log in contacto.email_logs" 
              :key="log.id_email_log"
              class="bg-white border border-gray-200 rounded-lg p-3.5 text-xs flex flex-col gap-2 shadow-sm"
            >
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-bold text-gray-800 flex items-center gap-1.5">
                    <Mail class="w-3.5 h-3.5 text-gray-400" />
                    {{ log.asunto_correo ? `Asunto: ${log.asunto_correo}` : `Registro de salida #${log.id_email_log}` }}
                  </span>
                  <span class="text-gray-400 font-medium mt-0.5 block" v-if="log.fecha_envio">
                    Registrado el {{ formatDate(log.fecha_envio) }}
                  </span>
                </div>
                <span class="px-2 py-0.5 font-bold rounded text-[10px] uppercase border" :class="{
                  'bg-(--color-email-enviado-soft) border-(--color-email-enviado-border) text-(--color-email-enviado-text)': log.estado_email === 'ENVIADO',
                  'bg-(--color-email-fallido-soft) border-(--color-email-fallido-border) text-(--color-email-fallido-text)': log.estado_email === 'FALLIDO',
                  'bg-(--color-email-proceso-soft) border-(--color-email-proceso-border) text-(--color-email-proceso-text)': log.estado_email === 'EN_PROCESO',
                  'bg-(--color-email-pendiente-soft) border-(--color-email-pendiente-border) text-(--color-email-pendiente-text)': log.estado_email === 'PENDIENTE',
                }">
                  {{ log.estado_email }}
                </span>
              </div>
              <div v-if="log.estado_email === 'FALLIDO' && log.error_mensaje" class="mt-1 p-2 bg-red-50 text-red-700 rounded border border-red-100 text-[10px] leading-relaxed">
                <span class="font-bold">Motivo del fallo:</span> {{ log.error_mensaje }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
      <MessageSquareText class="w-12 h-12 stroke-1 mb-2 text-gray-300" />
      <p class="text-sm font-medium">Selecciona un mensaje de contacto de la lista para ver sus detalles y redactar respuestas.</p>
    </div>
  </div>
</template>