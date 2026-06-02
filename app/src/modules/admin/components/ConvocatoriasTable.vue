<script setup lang="ts">
import { ref } from 'vue'
import { Settings, FileText } from 'lucide-vue-next'
import type { ConvocatoriaDTO } from '../../convocatorias/types/convocatorias.api'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

defineProps<{
  items: ConvocatoriaDTO[]
  isLoading: boolean
  isLoadingMore: boolean
}>()

const emit = defineEmits<{
  (e: 'manage', id: number): void
  (e: 'load-more'): void
}>()

const tableContainer = ref<HTMLElement | null>(null)

const onScroll = () => {
  const el = tableContainer.value
  if (!el) return
  
  // Lanza la petición al estar a 20px o menos de tocar el fondo del contenedor
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
    emit('load-more')
  }
}

// Mapeo seguro utilizando tus clases y variables CSS del theme de Tailwind v4
const getEstadoTemporalClass = (estado: string) => {
  switch (estado?.toUpperCase()) {
    case 'BORRADOR': 
      return 'bg-[var(--color-estado-borrador-soft)] text-[var(--color-estado-borrador)] border-[var(--color-estado-borrador)]/20'
    case 'FINALIZADA': 
      return 'bg-[var(--color-estado-finalizada-soft)] text-[var(--color-estado-finalizada)] border-[var(--color-estado-finalizada)]/20'
    case 'PROXIMA': 
      return 'bg-[var(--color-estado-proxima-soft)] text-[var(--color-estado-proxima)] border-[var(--color-estado-proxima)]/20'
    case 'EN CURSO': 
      return 'bg-[var(--color-estado-activa-soft)] text-[var(--color-estado-activa)] border-[var(--color-estado-activa)]/20'
    case 'INSCRIPCION EN CURSO': 
    case 'INSCRIPCIONES PROXIMAS': 
      return 'bg-[var(--color-estado-inscripcion-soft)] text-[var(--color-estado-inscripcion)] border-[var(--color-estado-inscripcion)]/20'
    default: 
      return 'bg-gray-100 text-text-muted border-gray-200'
  }
}
</script>

<template>
  <div 
    ref="tableContainer"
    @scroll="onScroll"
    class="overflow-y-auto max-h-[550px] border border-gray-100 dynamic-scroll"
  >
    <table class="w-full text-left border-collapse relative">
      <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <tr>
          <th class="px-6 py-4 font-bold text-xs uppercase text-text-muted tracking-wider bg-gray-50">Nombre</th>
          <th class="px-6 py-4 font-bold text-xs uppercase text-text-muted tracking-wider bg-gray-50">Gestión</th>
          <th class="px-6 py-4 font-bold text-xs uppercase text-text-muted tracking-wider bg-gray-50">Inscritos</th>
          <th class="px-6 py-4 font-bold text-xs uppercase text-text-muted tracking-wider bg-gray-50">Estado Temporal</th>
          <th class="px-6 py-4 text-right font-bold text-xs uppercase text-text-muted tracking-wider bg-gray-50">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        
        <tr v-if="isLoading && items.length === 0">
          <td colspan="5" class="px-6 py-12 text-center text-sm text-text-muted animate-pulse">
            Sincronizando convocatorias...
          </td>
        </tr>

        <tr v-for="conv in items" :key="conv.id_convocatoria" class="hover:bg-gray-50/50 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText class="w-5 h-5 text-primary" />
              </div>
              <span class="font-bold text-text-main">{{ conv.nombre_convocatoria }}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-text-muted font-medium">{{ conv.gestion }}</td>
          <td class="px-6 py-4 text-text-muted font-medium">
            {{ (conv as any).inscritos ?? 0 }}
          </td>
          <td class="px-6 py-4">
            <Badge 
              variant="outline"
              :class="`px-2.5 py-1 rounded border text-xs font-semibold capitalize ${getEstadoTemporalClass(conv.estado_temporal)}`"
            >
              <span 
                v-if="conv.estado_temporal === 'INSCRIPCION EN CURSO' || conv.estado_temporal === 'EN CURSO'" 
                class="w-1.5 h-1.5 rounded-full bg-success animate-pulse mr-1.5 inline-block"
              ></span>
              {{ conv.estado_temporal.toLowerCase() }}
            </Badge>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                class="text-text-muted hover:text-text-main hover:bg-gray-100"
                title="Administrar Convocatoria"
                @click="emit('manage', conv.id_convocatoria)"
              >
                <Settings class="w-4 h-4" />
              </Button>
            </div>
          </td>
        </tr>
        
        <tr v-if="items.length === 0 && !isLoading">
          <td colspan="5" class="px-6 py-12 text-center text-sm text-text-muted">
            Sin resultados para los criterios seleccionados.
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="isLoadingMore" class="p-4 text-center text-xs font-semibold text-text-muted bg-gray-50/70 border-t border-gray-100 animate-pulse">
      Cargando más registros de olimpiadas...
    </div>
  </div>
</template>