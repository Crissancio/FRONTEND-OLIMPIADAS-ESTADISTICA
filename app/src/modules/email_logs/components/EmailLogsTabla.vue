<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Eye, Loader2, RefreshCw, CheckCircle, XCircle, Clock, Send, Mail } from 'lucide-vue-next'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { EmailLogDTO, EstadoEmail, TipoEmail } from '@/modules/email_logs/types/email-logs.api'

const props = defineProps<{
  items: EmailLogDTO[]
  isLoading: boolean
  hasMore: boolean
  totalItems: number
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
  (e: 'ver', item: EmailLogDTO): void
  (e: 'reintentar', item: EmailLogDTO): void
}>()

const observerTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!observerTarget.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.isLoading) emit('load-more')
    },
    { threshold: 0.1 },
  )
  observer.observe(observerTarget.value)
})
onUnmounted(() => observer?.disconnect())

const formatDate = (raw: string | null) => {
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const estadoConfig: Record<EstadoEmail, { label: string; class: string; icon: any }> = {
  PENDIENTE:  { label: 'Pendiente',  class: 'border-[var(--color-estado-pendiente)] bg-[var(--color-estado-pendiente-soft)] text-[var(--color-estado-pendiente)]',  icon: Clock },
  EN_PROCESO: { label: 'En proceso', class: 'border-[var(--color-estado-inscripcion)] bg-[var(--color-estado-inscripcion-soft)] text-[var(--color-estado-inscripcion)]', icon: Send },
  ENVIADO:    { label: 'Enviado',    class: 'border-[var(--color-lista-border)] bg-[var(--color-lista-soft)] text-[var(--color-lista)]',                              icon: CheckCircle },
  FALLIDO:    { label: 'Fallido',    class: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger-text)]',                     icon: XCircle },
}

const tipoLabel: Record<TipoEmail, string> = {
  MASIVO_INSCRIPCION: 'Masivo inscr.',
  RESPUESTA_CONTACTO: 'Resp. contacto',
  MAIL_INDIVIDUAL: 'Individual',
  NOTIFICACION: 'Notificación',
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft">
    <div v-if="items.length === 0 && !isLoading" class="py-16 text-center">
      <Mail class="mx-auto mb-3 h-10 w-10 text-gray-200" />
      <p class="font-medium text-text-muted">No hay registros de email.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Destinatario / Asunto</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Tipo</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Intentos</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Último intento</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Creación</th>
            <th class="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in items"
            :key="item.id_email_log"
            class="hover:bg-gray-50/70 transition-colors"
          >
            <td class="px-5 py-3.5">
              <p class="font-medium text-text-main leading-tight">{{ item.destinatario }}</p>
              <p class="mt-0.5 truncate text-xs text-text-muted max-w-xs">{{ item.asunto }}</p>
            </td>
            <td class="px-4 py-3.5">
              <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-text-muted">
                {{ tipoLabel[item.tipo] }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <Badge
                variant="not_allowed"
                :class="`flex w-fit items-center gap-1 border px-2 py-0.5 text-xs font-semibold ${estadoConfig[item.estado].class}`"
              >
                <component :is="estadoConfig[item.estado].icon" class="h-3 w-3" />
                {{ estadoConfig[item.estado].label }}
              </Badge>
            </td>
            <td class="px-4 py-3.5 text-center">
              <span
                class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                :class="item.intentos > 1 ? 'bg-error/10 text-error' : 'bg-gray-100 text-text-muted'"
              >
                {{ item.intentos }}
              </span>
            </td>
            <td class="px-4 py-3.5 text-xs text-text-muted font-mono whitespace-nowrap">
              {{ formatDate(item.ultimo_intento) }}
            </td>
            <td class="px-4 py-3.5 text-xs text-text-muted font-mono whitespace-nowrap">
              {{ formatDate(item.fecha_creacion) }}
            </td>
            <td class="px-4 py-3.5 text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  v-if="item.estado === 'FALLIDO'"
                  variant="ghost"
                  size="sm"
                  class="text-secondary hover:bg-secondary/10"
                  @click="emit('reintentar', item)"
                >
                  <RefreshCw class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" class="text-text-muted hover:text-primary" @click="emit('ver', item)">
                  <Eye class="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div ref="observerTarget" class="py-3 text-center">
      <Loader2 v-if="isLoading" class="mx-auto h-5 w-5 animate-spin text-primary" />
      <p v-else-if="!hasMore && items.length > 0" class="text-xs text-text-muted">
        {{ items.length }} de {{ totalItems }} registros
      </p>
    </div>
  </div>
</template>