<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Loader2, CheckCircle, XCircle, Minus, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-vue-next'
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

const sortKey = ref<keyof ResultadoDTO | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const initObserver = () => {
  if (!observerTarget.value) return
  observer.value?.disconnect()

  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.isLoading) {
        emit('load-more')
      }
    },
    { threshold: 0.1 }
  )
  observer.value.observe(observerTarget.value)
}

onMounted(() => {
  initObserver()
})

onUnmounted(() => {
  observer.value?.disconnect()
})

watch(() => props.resultados.length, async () => {
  await nextTick()
  if (props.hasMore && !props.isLoading && observerTarget.value && observer.value) {
    observer.value.unobserve(observerTarget.value)
    observer.value.observe(observerTarget.value)
  }
})
const sortBy = (key: keyof ResultadoDTO) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const resultadosOrdenados = computed(() => {
  if (!sortKey.value) return props.resultados
  
  return [...props.resultados].sort((a, b) => {
    let valA = a[sortKey.value!] ?? ''
    let valB = b[sortKey.value!] ?? ''

    if (sortKey.value === 'nota') {
      valA = Number(valA) || 0
      valB = Number(valB) || 0
    } else if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase()
      valB = valB.toLowerCase()
    }

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

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
  <div class="rounded-xl border border-gray-200 bg-white shadow-soft flex flex-col w-full overflow-hidden">
    <div v-if="resultados.length === 0 && !isLoading" class="py-16 text-center text-sm text-text-muted">
      <Minus class="mx-auto mb-3 h-8 w-8 text-gray-300" />
      No hay resultados para mostrar.
    </div>

    <div v-else class="overflow-auto w-full max-h-[70vh]">
      <table class="w-full text-sm border-collapse">
        <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">#</th>
            
            <th 
              class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-100 select-none transition-colors"
              @click="sortBy('carnet_identidad')"
            >
              <div class="flex items-center gap-1">
                CI
                <ArrowUp v-if="sortKey === 'carnet_identidad' && sortOrder === 'asc'" class="h-3 w-3" />
                <ArrowDown v-else-if="sortKey === 'carnet_identidad' && sortOrder === 'desc'" class="h-3 w-3" />
                <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
              </div>
            </th>
            <th 
              class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-100 select-none transition-colors"
              @click="sortBy('paterno')"
            >
              <div class="flex items-center gap-1">
                Paterno
                <ArrowUp v-if="sortKey === 'paterno' && sortOrder === 'asc'" class="h-3 w-3" />
                <ArrowDown v-else-if="sortKey === 'paterno' && sortOrder === 'desc'" class="h-3 w-3" />
                <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
              </div>
            </th>
            <th 
              class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-100 select-none transition-colors"
              @click="sortBy('materno')"
            >
              <div class="flex items-center gap-1">
                Materno
                <ArrowUp v-if="sortKey === 'materno' && sortOrder === 'asc'" class="h-3 w-3" />
                <ArrowDown v-else-if="sortKey === 'materno' && sortOrder === 'desc'" class="h-3 w-3" />
                <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
              </div>
            </th>
            <th 
              class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-100 select-none transition-colors"
              @click="sortBy('nombres')"
            >
              <div class="flex items-center gap-1">
                Nombres
                <ArrowUp v-if="sortKey === 'nombres' && sortOrder === 'asc'" class="h-3 w-3" />
                <ArrowDown v-else-if="sortKey === 'nombres' && sortOrder === 'desc'" class="h-3 w-3" />
                <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
              </div>
            </th>
            <th 
              class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-100 select-none transition-colors"
              @click="sortBy('nota')"
            >
              <div class="flex items-center gap-1">
                Nota
                <ArrowUp v-if="sortKey === 'nota' && sortOrder === 'asc'" class="h-3 w-3" />
                <ArrowDown v-else-if="sortKey === 'nota' && sortOrder === 'desc'" class="h-3 w-3" />
                <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
              </div>
            </th>
            
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Resultado</th>
            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Observación</th>
            <th 
              class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-100 select-none transition-colors"
              @click="sortBy('estado')"
            >
              <div class="flex items-center gap-1">
                Estado
                <ArrowUp v-if="sortKey === 'estado' && sortOrder === 'asc'" class="h-3 w-3" />
                <ArrowDown v-else-if="sortKey === 'estado' && sortOrder === 'desc'" class="h-3 w-3" />
                <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="(resultado, idx) in resultadosOrdenados"
            :key="resultado.id_resultado"
            class="hover:bg-gray-50 transition-colors"
            :class="selectedIds.includes(resultado.id_resultado) ? 'bg-primary/5' : ''"
          >
            <td class="px-4 py-3 text-text-muted text-xs font-mono">{{ idx + 1 }}</td>
            <td class="px-4 py-3 font-mono text-xs text-text-muted">
              {{ resultado.carnet_identidad }}
            </td>
            <td class="px-4 py-3 font-medium text-text-main">
              {{ resultado.paterno }}
            </td>
            <td class="px-4 py-3 font-medium text-text-main">
              {{ resultado.materno }}
            </td>
            <td class="px-4 py-3 font-medium text-text-main">
              {{ resultado.nombres }}
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

      <div ref="observerTarget" class="py-4 text-center w-full border-t border-gray-100">
        <Loader2 v-if="isLoading" class="mx-auto h-5 w-5 animate-spin text-primary" />
        <p v-else-if="!hasMore && resultados.length > 0" class="text-xs text-text-muted py-1">
          Mostrando {{ resultados.length }} de {{ totalItems }} resultados
        </p>
      </div>
    </div>
  </div>
</template>