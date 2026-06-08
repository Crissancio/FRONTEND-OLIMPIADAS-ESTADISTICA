<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X, RefreshCw, Loader2 } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { EmailLogFilters, EstadoEmail, TipoEmail } from '@/modules/email_logs/types/email-logs.api'

const props = defineProps<{ modelValue: EmailLogFilters; isRetrying?: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: Partial<EmailLogFilters>): void
  (e: 'retry-all'): void
}>()

const busqueda = ref(props.modelValue.busqueda ?? '')
const estado = ref<EstadoEmail | ''>(props.modelValue.estado ?? '')
const tipo = ref<TipoEmail | ''>(props.modelValue.tipo ?? '')
const envio_start = ref(props.modelValue.envio_start ?? '')
const envio_end = ref(props.modelValue.envio_end ?? '')

let debounce: ReturnType<typeof setTimeout>

const emitChanges = () => {
  emit('update:modelValue', {
    busqueda: busqueda.value || null,
    estado: (estado.value as EstadoEmail) || null,
    tipo: (tipo.value as TipoEmail) || null,
    envio_start: envio_start.value || null,
    envio_end: envio_end.value || null,
  })
}

watch(busqueda, () => {
  clearTimeout(debounce)
  debounce = setTimeout(emitChanges, 400)
})
watch([estado, tipo, envio_start, envio_end], emitChanges)

const hasFilters = () => Boolean(busqueda.value || estado.value || tipo.value || envio_start.value || envio_end.value)

const clear = () => {
  busqueda.value = ''
  estado.value = ''
  tipo.value = ''
  envio_start.value = ''
  envio_end.value = ''
  emitChanges()
}

const inputClass = 'h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-soft">
    <div class="flex flex-wrap items-end gap-3">
      <div class="relative min-w-55 flex-1">
        <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
        <input
          v-model="busqueda"
          :class="inputClass"
          class="w-full pl-9"
          placeholder="Buscar por asunto o destinatario..."
        />
      </div>

      <select v-model="estado" :class="inputClass">
        <option value="">Todos los estados</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="EN_PROCESO">En proceso</option>
        <option value="ENVIADO">Enviado</option>
        <option value="FALLIDO">Fallido</option>
      </select>

      <select v-model="tipo" :class="inputClass">
        <option value="">Todos los tipos</option>
        <option value="MASIVO_INSCRIPCION">Masivo inscripción</option>
        <option value="RESPUESTA_CONTACTO">Respuesta contacto</option>
        <option value="MAIL_INDIVIDUAL">Individual</option>
        <option value="NOTIFICACION">Notificación</option>
      </select>

      <div class="flex items-center gap-2">
        <div>
          <p class="mb-1 text-xs font-bold text-text-muted">Envío desde</p>
          <input v-model="envio_start" type="date" :class="inputClass" />
        </div>
        <div>
          <p class="mb-1 text-xs font-bold text-text-muted">Envío hasta</p>
          <input v-model="envio_end" type="date" :class="inputClass" />
        </div>
      </div>

      <button
        v-if="hasFilters()"
        class="flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm text-text-muted hover:border-error/40 hover:text-error transition-colors"
        @click="clear"
      >
        <X class="h-4 w-4" />Limpiar
      </button>

      <Button
        variant="outline"
        class="flex h-10 items-center gap-1.5 text-sm"
        :disabled="isRetrying"
        @click="emit('retry-all')"
      >
        <Loader2 v-if="isRetrying" class="h-4 w-4 animate-spin" />
        <RefreshCw v-else class="h-4 w-4" />
        Reintentar fallidos
      </Button>
    </div>
  </div>
</template>