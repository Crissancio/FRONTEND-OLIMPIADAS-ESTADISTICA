<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { X, Megaphone, Loader2, Plus, Trash2 } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { campaniasService } from '@/modules/campanias/services/campanias.service'
import type { EnlaceDTO } from '@/modules/campanias/types/campanias.api'

const props = defineProps<{
  open: boolean
  destinatariosIds: number[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const isSaving = ref(false)
const errorMessage = ref('')

const form = ref({
  nombre: '',
  asunto: '',
  contenido_mensaje: '',
  contenido_secundario: '',
  fecha_programada: '',
})
const enlaces = ref<EnlaceDTO[]>([])

const addEnlace = () => enlaces.value.push({ url: '', texto: '' })
const removeEnlace = (idx: number) => enlaces.value.splice(idx, 1)

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

const crearCampania = async () => {
  if (!form.value.nombre || !form.value.asunto || !form.value.contenido_mensaje) {
    errorMessage.value = 'Nombre, asunto y contenido son requeridos.'
    return
  }
  isSaving.value = true
  errorMessage.value = ''
  try {
    await campaniasService.crearCampania({
      nombre: form.value.nombre.trim(),
      asunto: form.value.asunto.trim(),
      contenido_mensaje: form.value.contenido_mensaje.trim(),
      contenido_secundario: form.value.contenido_secundario.trim() || null,
      fecha_programada: form.value.fecha_programada || null,
      enlaces: enlaces.value.filter((e) => e.url && e.texto).length > 0
        ? enlaces.value.filter((e) => e.url && e.texto)
        : null,
      destinatarios_ids: props.destinatariosIds.length > 0 ? props.destinatariosIds : null,
    })
    emit('close')
    router.push({ name: 'admin-campanias' })
  } catch (err) {
    extractError(err, 'No se pudo crear la campaña.')
  } finally {
    isSaving.value = false
  }
}

const inputClass = 'h-10 w-full rounded-lg border border-gray-300 px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
const textareaClass = 'min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4"
  >
    <Card class="my-auto w-full max-w-2xl border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-200">
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <Megaphone class="h-5 w-5 text-primary" />
            Crear Campaña de Email
          </CardTitle>
          <Button variant="ghost" size="sm" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </div>
        <p v-if="destinatariosIds.length > 0" class="mt-1 text-xs text-text-muted">
          {{ destinatariosIds.length }} destinatarios seleccionados
        </p>
      </CardHeader>

      <CardContent class="space-y-4 p-5">
        <div v-if="errorMessage" class="rounded-xl border border-error/20 bg-error/10 px-4 py-2.5 text-sm text-error">
          {{ errorMessage }}
          <button class="ml-2 font-bold hover:opacity-70" @click="errorMessage = ''">✕</button>
        </div>

        <div>
          <label class="mb-1 block text-xs font-bold text-text-muted">Nombre de campaña *</label>
          <input v-model="form.nombre" :class="inputClass" placeholder="Ej: Resultados Fase 1" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-text-muted">Asunto del email *</label>
          <input v-model="form.asunto" :class="inputClass" placeholder="Ej: Resultados de la Fase 1 publicados" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-text-muted">Mensaje principal *</label>
          <textarea v-model="form.contenido_mensaje" :class="textareaClass" placeholder="Contenido principal del correo..." />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-text-muted">Mensaje secundario</label>
          <textarea v-model="form.contenido_secundario" :class="textareaClass" placeholder="Información adicional (opcional)..." />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-text-muted">Fecha programada</label>
          <input v-model="form.fecha_programada" type="datetime-local" :class="inputClass" />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-text-muted">Enlaces</label>
            <Button variant="outline" size="sm" class="flex items-center gap-1 text-xs" @click="addEnlace">
              <Plus class="h-3.5 w-3.5" />Agregar enlace
            </Button>
          </div>
          <div v-for="(enlace, idx) in enlaces" :key="idx" class="flex items-center gap-2">
            <input v-model="enlace.texto" :class="inputClass" placeholder="Texto del enlace" />
            <input v-model="enlace.url" :class="inputClass" placeholder="https://..." />
            <Button variant="ghost" size="sm" class="text-error hover:bg-error/10" @click="removeEnlace(idx)">
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button variant="outline" :disabled="isSaving" @click="emit('close')">Cancelar</Button>
          <Button
            class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark"
            :disabled="isSaving"
            @click="crearCampania"
          >
            <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
            Crear campaña
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>