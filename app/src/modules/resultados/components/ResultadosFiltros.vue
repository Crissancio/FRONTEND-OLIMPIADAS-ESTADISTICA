<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, SlidersHorizontal, X } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { ResultadoFilters, SortByResultados, SortOrder } from '@/modules/resultados/types/resultados.api'

const props = defineProps<{
  modelValue: Partial<ResultadoFilters>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: Partial<ResultadoFilters>): void
}>()

const search = ref(props.modelValue.search ?? '')
const estadoAprobacion = ref(props.modelValue.estado_aprobacion ?? '')
const sortBy = ref<SortByResultados | ''>(props.modelValue.sort_by ?? '')
const sortOrder = ref<SortOrder>(props.modelValue.sort_order ?? 'asc')

let debounceTimer: ReturnType<typeof setTimeout>

const emitChanges = () => {
  emit('update:modelValue', {
    search: search.value || null,
    estado_aprobacion: (estadoAprobacion.value as 'APROBADO' | 'REPROBADO') || null,
    sort_by: (sortBy.value as SortByResultados) || null,
    sort_order: sortOrder.value,
  })
}

watch(search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(emitChanges, 400)
})

watch([estadoAprobacion, sortBy, sortOrder], emitChanges)

const clearFiltros = () => {
  search.value = ''
  estadoAprobacion.value = ''
  sortBy.value = ''
  sortOrder.value = 'asc'
  emitChanges()
}

const hasActiveFilters = () =>
  Boolean(search.value || estadoAprobacion.value || sortBy.value)
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-soft">
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-50 flex-1">
        <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
        <input
          v-model="search"
          class="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          placeholder="Buscar por nombre o carnet..."
        />
      </div>

      <select
        v-model="estadoAprobacion"
        class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <option value="">Todos</option>
        <option value="APROBADO">Aprobados</option>
        <option value="REPROBADO">Reprobados</option>
      </select>

      <select
        v-model="sortBy"
        class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <option value="">Ordenar por</option>
        <option value="nota">Nota</option>
        <option value="apellido">Apellido</option>
      </select>

      <select
        v-model="sortOrder"
        class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>

      <Button
        v-if="hasActiveFilters()"
        variant="ghost"
        size="sm"
        class="text-text-muted hover:text-error"
        @click="clearFiltros"
      >
        <X class="h-4 w-4" />
        Limpiar
      </Button>
    </div>
  </div>
</template>