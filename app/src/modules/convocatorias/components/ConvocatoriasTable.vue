<script setup lang="ts">
import { Settings, Loader2 } from 'lucide-vue-next'
import type { ConvocatoriaDTO } from '../../convocatorias/types/convocatorias.api'

defineProps<{
  items: ConvocatoriaDTO[]
  isLoading: boolean
  isLoadingMore: boolean
}>()

const emit = defineEmits<{
  (e: 'manage', id: number): void
  (e: 'load-more'): void
}>()

const getEstadoTemporalClasses = (estado: string) => {
  const map: Record<string, string> = {
    'BORRADOR': 'bg-[var(--color-estado-borrador-soft)] text-[var(--color-estado-borrador)]',
    'OCULTA': 'bg-[var(--color-estado-rechazado-soft)] text-[var(--color-estado-rechazado)]',
    'CANCELADA': 'bg-[var(--color-estado-inactivo-soft)] text-[var(--color-estado-inactivo)]',
    'PROXIMA': 'bg-[var(--color-estado-proxima-soft)] text-[var(--color-estado-proxima)]',
    'INSCRIPCIONES PROXIMAS': 'bg-[var(--color-estado-inscripcion-soft)] text-[var(--color-estado-inscripcion)]',
    'INSCRIPCION EN CURSO': 'bg-[var(--color-estado-pendiente-soft)] text-[var(--color-estado-pendiente)]',
    'EN CURSO': 'bg-[var(--color-estado-activa-soft)] text-[var(--color-estado-activa)]',
    'FINALIZADA': 'bg-[var(--color-estado-finalizada-soft)] text-[var(--color-estado-finalizada)]'
  }
  return map[estado] || 'bg-gray-100 text-gray-600'
}

const onScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
    emit('load-more')
  }
}
</script>

<template>
  <div class="relative w-full">
    <div v-if="isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm min-h-[300px]">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div class="overflow-x-auto max-h-600px w-full" @scroll="onScroll">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 sticky top-0 z-0 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Convocatoria</th>
            <th class="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Estado</th>
            <th class="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Temporalidad</th>
            <th class="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr 
            v-for="item in items" 
            :key="item.id_convocatoria"
            class="group hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 cursor-pointer"
            @click="emit('manage', item.id_convocatoria)"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-text-main shrink-0 shadow-sm group-hover:bg-white group-hover:shadow-md transition-all">
                  {{ item.gestion }}
                </div>
                <div>
                  <h3 class="font-semibold text-text-main group-hover:text-primary transition-colors">{{ item.nombre_convocatoria }}</h3>
                  <p v-if="item.descripcion" class="text-sm text-text-muted line-clamp-1 mt-0.5">{{ item.descripcion }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                :class="item.estado === 'PUBLICADA' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'">
                {{ item.estado }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                :class="getEstadoTemporalClasses(item.estado_temporal)"
              >
                {{ item.estado_temporal }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <button 
                @click.stop="emit('manage', item.id_convocatoria)"
                class="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors outline-none focus:ring-2 focus:ring-primary"
              >
                <Settings class="w-6 h-6" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="isLoadingMore" class="p-4 flex justify-center bg-white border-t border-gray-50">
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
      </div>
    </div>
  </div>
</template>