<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, RefreshCw, Loader2, Mail, AlertCircle, Clock, CheckCircle, Send, Building2, User } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { emailLogsService } from '@/modules/email_logs/services/email-logs.service'
import type { EmailLogDTO, EmailLogCompletoDTO, EstadoEmail } from '@/modules/email_logs/types/email-logs.api'

const props = defineProps<{ open: boolean; log: EmailLogDTO | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated', l: EmailLogDTO): void
  (e: 'error', msg: string): void
}>()

const logCompleto = ref<EmailLogCompletoDTO | null>(null)
const isLoadingDetalle = ref(false)
const isRetrying = ref(false)

const extractError = (err: any, fallback: string) => {
  const d = err?.response?.data ?? err?.data ?? err?.details ?? null
  const msg = d ? (d.error || d.message || d.detail || fallback) : (err?.message && !err.message.includes('status code') ? err.message : fallback)
  emit('error', msg)
}

watch(() => props.log, async (l) => {
  if (!l) return
  logCompleto.value = null
  isLoadingDetalle.value = true
  try {
    const res = await emailLogsService.obtenerLogPorId(l.id_email_log)
    logCompleto.value = res.data
  } catch (err) {
    extractError(err, 'No se pudo cargar el detalle del log.')
  } finally {
    isLoadingDetalle.value = false
  }
})

const reintentar = async () => {
  if (!props.log) return
  isRetrying.value = true
  try {
    const res = await emailLogsService.reintentarLogIndividual(props.log.id_email_log)
    emit('updated', res.data)
    if (logCompleto.value) logCompleto.value = { ...logCompleto.value, ...res.data }
  } catch (err) {
    extractError(err, 'No se pudo reintentar el envío.')
  } finally {
    isRetrying.value = false
  }
}

const formatDate = (raw: string | null) => {
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const estadoConfig: Record<EstadoEmail, { label: string; class: string; icon: any }> = {
  PENDIENTE:  { label: 'Pendiente',  class: 'border-[var(--color-estado-pendiente)] bg-[var(--color-estado-pendiente-soft)] text-[var(--color-estado-pendiente)]',    icon: Clock },
  EN_PROCESO: { label: 'En proceso', class: 'border-[var(--color-estado-inscripcion)] bg-[var(--color-estado-inscripcion-soft)] text-[var(--color-estado-inscripcion)]', icon: Send },
  ENVIADO:    { label: 'Enviado',    class: 'border-[var(--color-lista-border)] bg-[var(--color-lista-soft)] text-[var(--color-lista)]',                                icon: CheckCircle },
  FALLIDO:    { label: 'Fallido',    class: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger-text)]',                       icon: AlertCircle },
}
</script>

<template>
  <Transition name="drawer">
    <div v-if="open" class="fixed inset-0 z-60 flex">
      <div class="flex-1 bg-black/40" @click="emit('close')" />
      <div class="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-gray-200 bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-gray-200 bg-primary px-5 py-4">
          <div>
            <p class="text-xs font-medium text-white/60 uppercase tracking-wider">Email Log</p>
            <h2 class="font-heading text-base font-bold text-white leading-tight line-clamp-1">
              {{ log?.destinatario ?? '—' }}
            </h2>
          </div>
          <Button variant="ghost" size="sm" class="text-white hover:bg-white/20" @click="emit('close')">
            <X class="h-5 w-5" />
          </Button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-5">
          <div v-if="isLoadingDetalle" class="flex justify-center py-12">
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
          </div>

          <template v-else-if="logCompleto">
            <div class="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                :class="`flex items-center gap-1 border px-2.5 py-1 text-xs font-bold ${estadoConfig[logCompleto.estado].class}`"
              >
                <component :is="estadoConfig[logCompleto.estado].icon" class="h-3 w-3" />
                {{ estadoConfig[logCompleto.estado].label }}
              </Badge>
              <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-text-muted">
                {{ logCompleto.tipo.replace('_', ' ') }}
              </span>
              <Button
                v-if="logCompleto.estado === 'FALLIDO'"
                size="sm"
                class="flex items-center gap-1.5 bg-secondary text-white hover:bg-secondary-dark text-xs ml-auto"
                :disabled="isRetrying"
                @click="reintentar"
              >
                <Loader2 v-if="isRetrying" class="h-3.5 w-3.5 animate-spin" />
                <RefreshCw v-else class="h-3.5 w-3.5" />
                Reintentar
              </Button>
            </div>

            <div class="space-y-3">
              <div class="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <p class="text-xs font-bold uppercase tracking-wider text-text-muted">Información del email</p>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p class="text-xs text-text-muted">Destinatario</p>
                    <p class="font-mono text-sm font-medium text-text-main break-all">{{ logCompleto.destinatario }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-text-muted">Intentos</p>
                    <p class="font-bold text-sm" :class="logCompleto.intentos > 1 ? 'text-error' : 'text-text-main'">
                      {{ logCompleto.intentos }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-text-muted">Creación</p>
                    <p class="text-sm text-text-main">{{ formatDate(logCompleto.fecha_creacion) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-text-muted">Envío</p>
                    <p class="text-sm text-text-main">{{ formatDate(logCompleto.fecha_envio) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-text-muted">Último intento</p>
                    <p class="text-sm text-text-main">{{ formatDate(logCompleto.ultimo_intento) }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-text-muted">Asunto</p>
                  <p class="mt-0.5 text-sm font-medium text-text-main">{{ logCompleto.asunto }}</p>
                </div>
              </div>

              <div v-if="logCompleto.error" class="rounded-xl border border-error/20 bg-error/5 p-4">
                <p class="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-error">
                  <AlertCircle class="h-3.5 w-3.5" />Error registrado
                </p>
                <p class="font-mono text-xs text-error/80 break-all">{{ logCompleto.error }}</p>
              </div>

              <div v-if="logCompleto.campania" class="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p class="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Mail class="h-3.5 w-3.5" />Campaña asociada
                </p>
                <p class="text-sm font-semibold text-text-main">{{ logCompleto.campania.nombre }}</p>
                <p class="text-xs text-text-muted">ID: {{ logCompleto.campania.id_campania_email }}</p>
              </div>

              <div v-if="logCompleto.estudiante" class="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p class="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <User class="h-3.5 w-3.5" />Estudiante
                </p>
                <p class="text-sm font-semibold text-text-main">
                  {{ logCompleto.estudiante.nombres }} {{ logCompleto.estudiante.paterno }} {{ logCompleto.estudiante.materno }}
                </p>
                <p v-if="logCompleto.estudiante.colegio" class="mt-1 flex items-center gap-1 text-xs text-text-muted">
                  <Building2 class="h-3.5 w-3.5" />{{ logCompleto.estudiante.colegio.nombre }}
                </p>
              </div>

              <div v-if="logCompleto.contacto" class="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p class="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <User class="h-3.5 w-3.5" />Contacto
                </p>
                <p class="text-sm font-semibold text-text-main">{{ logCompleto.contacto.nombre_completo }}</p>
              </div>
            </div>
          </template>
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