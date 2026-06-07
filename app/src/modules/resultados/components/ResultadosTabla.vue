<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Loader2, CheckCircle, XCircle, Minus } from 'lucide-vue-next'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import type { ResultadoDTO } from '@/modules/resultados/types/resultados.api'

const props = defineProps<{
  resultados: ResultadoDTO[]
  criterioAprobacion: number
  isLoading: boolean
  hasMore: boolean
  totalItems: number
  selectedIds: number[]
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
  (e: 'update:selectedIds', ids: number[]): void
}>()

const observerTarget = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

onMounted(() => {
  if (!observerTarget.value) return
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.isLoading) {
        emit('load-more')
      }
    },
    { threshold: 0.1 },
  )
  observer.value.observe(observerTarget.value)
})

onUnmounted(() => {
  observer.value?.disconnect()
})

const toggleSelect = (id: number) => {
  const current = [...props.selectedIds]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:selectedIds', current)
}

const toggleAll = () => {
  if (props.selectedIds.length === props.resultados.length) {
    emit('update:selectedIds', [])
  } else {
    emit('update:selectedIds', props.resultados.map((r) => r.id_resultado))
  }
}

const allSelected = computed(() => props.resultados.length > 0 && props.selectedIds.length === props.resultados.length)

const notaClass = (nota: number) =>
  nota >= props.criterioAprobacion
    ? 'text-success font-bold'
    : 'text-error font-bold'

const estadoBadgeClass = (estado: ResultadoDTO['estado']) => {
  if (estado === 'PUBLICADO') return 'border-success/20 bg-success/10 text-success'
  if (estado === 'OCULTO') return 'border-gray-300 bg-gray-100 text-text-muted'
  return 'border-warning/20 bg-warning/10 text-warning'
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-soft overflow-hidden">
    <div v-if="resultados.length === 0 && !isLoading" class="py-16 text-center text-sm text-text-muted">
      <Minus class="mx-auto mb-3 h-8 w-8 text-gray-300" />
      No hay resultados para mostrar.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 w-10">
              <input
                type="checkbox"
                :checked="allSelected"
                class="h-4 w-4 rounded border-gray-300"
                @change="toggleAll"
              />
            </th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">#</th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Inscripción</th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Nota</th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Resultado</th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Observación</th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="(resultado, idx) in resultados"
            :key="resultado.id_resultado"
            class="hover:bg-gray-50 transition-colors"
            :class="selectedIds.includes(resultado.id_resultado) ? 'bg-primary/5' : ''"
          >
            <td class="px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedIds.includes(resultado.id_resultado)"
                class="h-4 w-4 rounded border-gray-300"
                @change="toggleSelect(resultado.id_resultado)"
              />
            </td>
            <td class="px-4 py-3 text-text-muted text-xs font-mono">{{ idx + 1 }}</td>
            <td class="px-4 py-3 font-medium text-text-main">
              ID: {{ resultado.id_inscripcion }}
            </td>
            <td class="px-4 py-3">
              <span :class="notaClass(resultado.nota)">{{ resultado.nota }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <CheckCircle v-if="resultado.nota >= criterioAprobacion" class="h-4 w-4 text-success" />
                <XCircle v-else class="h-4 w-4 text-error" />
                <span :class="resultado.nota >= criterioAprobacion ? 'text-success text-xs font-medium' : 'text-error text-xs font-medium'">
                  {{ resultado.nota >= criterioAprobacion ? 'Aprobado' : 'Reprobado' }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-text-muted text-xs">{{ resultado.observaciones ?? '-' }}</td>
            <td class="px-4 py-3">
              <Badge variant="outline" :class="estadoBadgeClass(resultado.estado)">
                {{ resultado.estado }}
              </Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div ref="observerTarget" class="py-2 text-center">
    <Loader2 v-if="isLoading" class="mx-auto h-5 w-5 animate-spin text-primary" />
    <p v-else-if="!hasMore && resultados.length > 0" class="text-xs text-text-muted">
        Mostrando {{ resultados.length }} de {{ totalItems }} resultados
    </p>
    </div>
  </div>
</template>