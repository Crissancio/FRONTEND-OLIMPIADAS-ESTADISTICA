<script setup lang="ts">
import { computed } from 'vue'
import { FileEdit, Globe, EyeOff, Calendar, Clock } from 'lucide-vue-next'

const props = defineProps<{
  aviso: {
    id_aviso: number | string
    titulo: string
    descripcion: string
    tipo: string
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
    estado: 'BORRADOR' | 'PUBLICADO' | 'OCULTO'
    fecha_publicacion: string | null
    fecha_creacion: string
    estado_temporal?: string | null
  }
}>()

const emit = defineEmits(['click'])

const estadoActual = computed(() => props.aviso.estado_temporal || props.aviso.estado)

const isGrayedOut = computed(() => {
  return ['NO_VISIBLE', 'EN_ESPERA', 'BORRADOR', 'OCULTO'].includes(estadoActual.value)
})

const prioridadColor = computed(() => {
  switch (props.aviso.prioridad) {
    case 'ALTA': return 'var(--color-aviso-prioridad-alta)'
    case 'MEDIA': return 'var(--color-aviso-prioridad-media)'
    case 'BAJA': return 'var(--color-aviso-prioridad-baja)'
    default: return 'var(--color-text-muted)'
  }
})

const estadoConfig = computed(() => {
  switch (props.aviso.estado) {
    case 'BORRADOR': return { icon: FileEdit, color: 'var(--color-estado-borrador)' }
    case 'PUBLICADO': return { icon: Globe, color: 'var(--color-aviso-estado-publicado)' }
    case 'OCULTO': return { icon: EyeOff, color: 'var(--color-aviso-estado-oculto)' }
    default: return { icon: FileEdit, color: 'var(--color-text-muted)' }
  }
})

const formatFecha = (fechaStr: string | null) => {
  if (!fechaStr) return 'Inmediata'
  const date = new Date(fechaStr)
  if (isNaN(date.getTime())) return fechaStr
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date)
}
</script>

<template>
  <div 
    @click="emit('click', aviso)"
    class="relative rounded-t-md shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:z-30 group flex flex-col h-full"
    :class="isGrayedOut ? 'bg-gray-100 border-gray-300 grayscale' : 'bg-white border-gray-100'"
    :style="{ borderLeft: `4px solid ${prioridadColor}` }"
  >
    
    <div class="absolute inset-0 right-0 w-full h-full overflow-hidden rounded-t-md pointer-events-none">
        <component 
            :is="estadoConfig.icon" 
            class="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-10 pointer-events-none z-0 transition-transform duration-500 group-hover:scale-110"
            :style="{ color: estadoConfig.color }"
        />
    </div>

    <div class="p-4 flex-1 flex flex-col relative z-10">
      <h3 class="text-xl font-black text-gray-900 line-clamp-2 leading-tight transition-colors mb-2"
          :class="isGrayedOut ? 'group-hover:text-gray-700' : 'group-hover:text-(--color-primary)'">
        {{ aviso.titulo }}
      </h3>
      
      <p class="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
        {{ aviso.descripcion }}
      </p>

      <div class="flex flex-wrap gap-1.5 mt-auto">
        <span class="px-2 py-0.5 text-[10px] font-bold rounded-md border"
              :class="isGrayedOut ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-gray-50 text-gray-600 border-gray-200'">
          {{ aviso.tipo }}
        </span>
        
        <span v-if="aviso.estado_temporal" class="px-2 py-0.5 text-[10px] font-bold rounded-md border"
              :class="isGrayedOut ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-amber-50 text-amber-700 border-amber-200'">
          {{ aviso.estado_temporal }}
        </span>
      </div>
    </div>

    <div class="absolute top-[calc(100%-1px)] -left-1 w-[calc(100%+4px)] border border-t-0 rounded-b-md px-4 shadow-xl z-20 max-h-0 opacity-0 overflow-hidden group-hover:max-h-28 group-hover:opacity-100 group-hover:pb-4 transition-all duration-300 ease-out"
         :class="isGrayedOut ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-100'"
         :style="{ borderLeft: `4px solid ${prioridadColor}` }">
      <div class="flex flex-col gap-1.5 pt-3 mt-1 border-t" :class="isGrayedOut ? 'border-gray-200' : 'border-gray-100'">
        <div class="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <Calendar class="w-3.5 h-3.5" />
          <span>Creado: {{ formatFecha(aviso.fecha_creacion) }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[11px] font-medium" :class="isGrayedOut ? 'text-gray-500' : 'text-gray-500'">
          <Clock class="w-3.5 h-3.5" />
          <span>Pub: {{ formatFecha(aviso.fecha_publicacion) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>