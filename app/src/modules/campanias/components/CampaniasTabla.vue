<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Eye, Loader2, Send, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-vue-next'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { CampaniaDTO, EstadoCampania } from '@/modules/campanias/types/campanias.api'

const props = defineProps<{
  items: CampaniaDTO[]
  isLoading: boolean
  hasMore: boolean
  totalItems: number
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
  (e: 'ver', item: CampaniaDTO): void
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

const estadoConfig: Record<EstadoCampania, { label: string; class: string; icon: any }> = {
  BORRADOR:   { label: 'Borrador',   class: 'border-[var(--color-estado-borrador)] bg-[var(--color-estado-borrador-soft)] text-[var(--color-estado-borrador)]',     icon: FileText },
  PROGRAMADA: { label: 'Programada', class: 'border-[var(--color-estado-proxima)] bg-[var(--color-estado-proxima-soft)] text-[var(--color-estado-proxima)]',         icon: Clock },
  EN_PROCESO: { label: 'En proceso', class: 'border-[var(--color-estado-inscripcion)] bg-[var(--color-estado-inscripcion-soft)] text-[var(--color-estado-inscripcion)]', icon: Send },
  FINALIZADA: { label: 'Finalizada', class: 'border-[var(--color-estado-finalizada)] bg-[var(--color-estado-finalizada-soft)] text-[var(--color-estado-finalizada)]', icon: CheckCircle },
  CANCELADA:  { label: 'Cancelada',  class: 'border-[var(--color-estado-cancelada)] bg-[var(--color-estado-cancelada-soft)] text-[var(--color-estado-cancelada)]',   icon: XCircle },
  FALLIDA:    { label: 'Fallida',    class: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger-text)]',                     icon: AlertCircle },
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft">
    <div v-if="items.length === 0 && !isLoading" class="py-16 text-center">
      <Send class="mx-auto mb-3 h-10 w-10 text-gray-200" />
      <p class="font-medium text-text-muted">No hay campañas registradas.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Campaña</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Creación</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Programada</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Destinatarios</th>
            <th class="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in items"
            :key="item.id_campania_email"
            class="group hover:bg-gray-50/70 transition-colors"
          >
            <td class="px-5 py-3.5">
              <p class="font-semibold text-text-main leading-tight">{{ item.nombre }}</p>
              <p class="mt-0.5 truncate text-xs text-text-muted max-w-xs">{{ item.asunto }}</p>
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
            <td class="px-4 py-3.5 text-xs text-text-muted font-mono whitespace-nowrap">
              {{ formatDate(item.fecha_creacion) }}
            </td>
            <td class="px-4 py-3.5 text-xs text-text-muted font-mono whitespace-nowrap">
              {{ formatDate(item.fecha_programada) }}
            </td>
            <td class="px-4 py-3.5">
              <Badge variant="not_allowed" class="border-info/20 bg-info/10 text-info text-xs">
                {{ item.destinatarios?.length ?? 0 }}
              </Badge>
            </td>
            <td class="px-4 py-3.5 text-right">
              <Button variant="ghost" size="sm" class="text-text-muted hover:text-primary" @click="emit('ver', item)">
                <Eye class="h-4 w-4" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div ref="observerTarget" class="py-3 text-center">
      <Loader2 v-if="isLoading" class="mx-auto h-5 w-5 animate-spin text-primary" />
      <p v-else-if="!hasMore && items.length > 0" class="text-xs text-text-muted">
        {{ items.length }} de {{ totalItems }} campañas
      </p>
    </div>
  </div>
</template>