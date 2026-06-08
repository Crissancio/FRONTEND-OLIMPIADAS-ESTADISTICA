<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Edit, CheckSquare, Square, Loader2 } from 'lucide-vue-next'
import type { EstudianteDTO } from '@/modules/estudiantes/types/estudiantes.api'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{
  estudiantes: EstudianteDTO[]
  isExportMode: boolean
  selectedIds: number[]
  isLoading: boolean
  isLoadingMore: boolean
  totalItems: number
  hasMorePages: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selectedIds', ids: number[]): void
  (e: 'load-more'): void
  (e: 'manage', id: number): void
  (e: 'toggle-status', estudiante: EstudianteDTO): void
}>()

const sentinelElement = ref<HTMLElement | null>(null)
let intersectionObserver: IntersectionObserver | null = null

const isAllSelected = computed(() => {
  return props.estudiantes.length > 0 && props.selectedIds.length === props.estudiantes.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    emit('update:selectedIds', [])
  } else {
    emit('update:selectedIds', props.estudiantes.map(est => est.id_estudiante))
  }
}

const toggleSelectRow = (id: number) => {
  const newSelection = [...props.selectedIds]
  const index = newSelection.indexOf(id)
  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(id)
  }
  emit('update:selectedIds', newSelection)
}

const estadoClass = (estado: string) => {
  if (estado === 'ACTIVO') return 'bg-success/10 text-success border-success/20'
  return 'bg-error/10 text-error border-error/20'
}

const getRowClass = (id: number) => {
  if (!props.isExportMode) return 'hover:bg-gray-50/50 transition-colors'
  if (props.selectedIds.includes(id)) return 'bg-green-100/60 transition-colors'
  return 'bg-gray-50 transition-colors opacity-60'
}

onMounted(() => {
  intersectionObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && props.hasMorePages && !props.isLoading && !props.isLoadingMore) {
      emit('load-more')
    }
  }, { rootMargin: '100px' })

  if (sentinelElement.value) {
    intersectionObserver.observe(sentinelElement.value)
  }
})

onUnmounted(() => {
  if (intersectionObserver) intersectionObserver.disconnect()
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left">
      <thead class="border-b border-gray-200 bg-white">
        <tr>
          <th v-if="isExportMode" class="w-12 px-6 py-4">
            <button @click="toggleSelectAll" class="text-text-muted hover:text-primary transition-colors">
              <CheckSquare v-if="isAllSelected" class="h-4 w-4 text-primary" />
              <Square v-else class="h-4 w-4" />
            </button>
          </th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Estudiante</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">C.I. / Datos</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Colegio / Nivel</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
          <th v-if="!isExportMode" class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-text-muted">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="est in estudiantes" :key="est.id_estudiante" class="group" :class="getRowClass(est.id_estudiante)">
          <td v-if="isExportMode" class="px-6 py-4">
            <button @click="toggleSelectRow(est.id_estudiante)" class="text-text-muted hover:text-primary transition-colors">
              <CheckSquare v-if="selectedIds.includes(est.id_estudiante)" class="h-5 w-5 text-green-600" />
              <Square v-else class="h-5 w-5" />
            </button>
          </td>
          <td class="px-6 py-4">
            <p class="font-bold text-text-main">{{ est.paterno }} {{ est.materno }}</p>
            <p class="text-sm text-text-muted">{{ est.nombres }}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-sm font-bold text-text-main">{{ est.carnet_identidad }}</p>
            <p class="text-xs text-text-muted">{{ est.telefono || 'Sin teléfono' }}</p>
          </td>
          <td class="px-6 py-4">
            <p class="text-sm text-text-main truncate max-w-50" :title="est.colegio?.nombre || 'No asignado'">{{ est.colegio?.nombre || 'No asignado' }}</p>
            <p class="text-xs text-text-muted">{{ est.curso }}to Sec. · {{ est.nivel }}</p>
          </td>
          <td class="px-6 py-4">
            <Badge variant="not_allowed" :class="`border px-2 py-1 ${estadoClass(est.estado)}`">
              {{ est.estado }}
            </Badge>
          </td>
          <td v-if="!isExportMode" class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <Button variant="ghost" size="lg" @click="emit('manage', est.id_estudiante)" class="text-text-muted hover:text-info"><Edit class="h-4 w-4" /></Button>
            </div>
          </td>
        </tr>

        <tr v-if="estudiantes.length === 0 && !isLoading">
          <td :colspan="isExportMode ? 5 : 6" class="px-6 py-12 text-center text-sm text-text-muted">
            No se encontraron estudiantes con los filtros especificados.
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div ref="sentinelElement" class="w-full border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-center text-sm text-text-muted">
    <div v-if="isLoading || isLoadingMore" class="flex items-center gap-2">
      <Loader2 class="h-4 w-4 animate-spin text-primary" />
      <span>Cargando más registros...</span>
    </div>
    <div v-else>
      <span>Mostrando {{ estudiantes.length }} de {{ totalItems }} estudiantes</span>
    </div>
  </div>
</template>