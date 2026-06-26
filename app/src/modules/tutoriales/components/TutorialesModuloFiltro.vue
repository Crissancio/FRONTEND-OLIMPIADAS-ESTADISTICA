<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import type { TutorialModule } from '../data/tutoriales.data'
import { MODULO_LABELS } from '../data/tutoriales.data'

defineProps<{
  modulos: TutorialModule[]
  moduloActivo: TutorialModule | 'Todos'
  busqueda: string
}>()

const emit = defineEmits<{
  'cambiar-modulo': [modulo: TutorialModule | 'Todos']
  'cambiar-busqueda': [valor: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
    <!-- Buscador -->
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        :value="busqueda"
        placeholder="Buscar por nombre o descripción..."
        class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
        @input="emit('cambiar-busqueda', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Select de módulo -->
    <div class="relative shrink-0">
      <select
        :value="moduloActivo"
        class="w-full sm:w-56 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors cursor-pointer"
        @change="emit('cambiar-modulo', ($event.target as HTMLSelectElement).value as TutorialModule | 'Todos')"
      >
        <option value="Todos">Todos los módulos</option>
        <option
          v-for="modulo in modulos"
          :key="modulo"
          :value="modulo"
        >
          {{ MODULO_LABELS[modulo] }}
        </option>
      </select>
      <!-- Chevron decorativo -->
      <svg
        class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>