<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import type { CampaniaFilters, EstadoCampania } from '@/modules/campanias/types/campanias.api'

const props = defineProps<{ modelValue: CampaniaFilters }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: Partial<CampaniaFilters>): void }>()

const nombre = ref(props.modelValue.nombre ?? '')
const estado = ref<EstadoCampania | ''>(props.modelValue.estado ?? '')
const prog_start = ref(props.modelValue.prog_start ?? '')
const prog_end = ref(props.modelValue.prog_end ?? '')

let debounce: ReturnType<typeof setTimeout>

const emitChanges = () => {
  emit('update:modelValue', {
    nombre: nombre.value || null,
    estado: (estado.value as EstadoCampania) || null,
    prog_start: prog_start.value || null,
    prog_end: prog_end.value || null,
  })
}

watch(nombre, () => {
  clearTimeout(debounce)
  debounce = setTimeout(emitChanges, 400)
})

watch([estado, prog_start, prog_end], emitChanges)

const hasFilters = () => Boolean(nombre.value || estado.value || prog_start.value || prog_end.value)

const clear = () => {
  nombre.value = ''
  estado.value = ''
  prog_start.value = ''
  prog_end.value = ''
  emitChanges()
}

const inputClass = 'h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-soft">
    <div class="flex flex-wrap items-end gap-3">
      <div class="relative min-w-50 flex-1">
        <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
        <input
          v-model="nombre"
          :class="inputClass"
          class="w-full pl-9"
          placeholder="Buscar por nombre o asunto..."
        />
      </div>

      <select v-model="estado" :class="inputClass">
        <option value="">Todos los estados</option>
        <option value="BORRADOR">Borrador</option>
        <option value="PROGRAMADA">Programada</option>
        <option value="EN_PROCESO">En proceso</option>
        <option value="FINALIZADA">Finalizada</option>
        <option value="CANCELADA">Cancelada</option>
        <option value="FALLIDA">Fallida</option>
      </select>

      <div class="flex items-center gap-2">
        <div>
          <p class="mb-1 text-xs font-bold text-text-muted">Prog. desde</p>
          <input v-model="prog_start" type="date" :class="inputClass" />
        </div>
        <div>
          <p class="mb-1 text-xs font-bold text-text-muted">Prog. hasta</p>
          <input v-model="prog_end" type="date" :class="inputClass" />
        </div>
      </div>

      <button
        v-if="hasFilters()"
        class="flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm text-text-muted hover:border-error/40 hover:text-error transition-colors"
        @click="clear"
      >
        <X class="h-4 w-4" />Limpiar
      </button>
    </div>
  </div>
</template>