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
  }
}>()

const emit = defineEmits(['click'])

const isTemporal = computed(() => {
  if (!props.aviso.fecha_publicacion) return false
  return new Date(props.aviso.fecha_publicacion) > new Date()
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
    case 'BORRADOR': return { icon: FileEdit, color: 'var(--color-estado-borrador)', bg: 'var(--color-estado-borrador-soft)' }
    case 'PUBLICADO': return { icon: Globe, color: 'var(--color-aviso-estado-publicado)', bg: 'var(--color-aviso-estado-publicado-soft)' }
    case 'OCULTO': return { icon: EyeOff, color: 'var(--color-aviso-estado-oculto)', bg: 'var(--color-aviso-estado-oculto-soft)' }
    default: return { icon: FileEdit, color: 'var(--color-text-muted)', bg: 'var(--color-background)' }
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
    class="relative bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow hover:scale-[1.02] group flex flex-col h-full"
    :class="{ 'opacity-60 grayscale-[30%]': isTemporal }"
    :style="{ borderLeft: `4px solid ${prioridadColor}` }"
  >
    <div class="p-4 flex-1 flex flex-col">
      <div class="flex justify-between items-start mb-2 gap-2">
        <h3 class="text-lg font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
          {{ aviso.titulo }}
        </h3>
        <div 
          class="flex items-center justify-center p-1.5 rounded-md shrink-0"
          :style="{ backgroundColor: estadoConfig.bg, color: estadoConfig.color }"
          :title="aviso.estado"
        >
          <component :is="estadoConfig.icon" class="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>
      
      <p class="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
        {{ aviso.descripcion }}
      </p>

      <div class="flex flex-wrap gap-1.5 mb-4">
        <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-100 text-gray-600 border border-gray-200">
          {{ aviso.tipo }}
        </span>
      </div>

      <div class="flex flex-col gap-1.5 pt-3 border-t border-gray-50">
        <div class="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          <Calendar class="w-3.5 h-3.5" />
          <span>Creado: {{ formatFecha(aviso.fecha_creacion) }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-[11px] font-medium" :class="isTemporal ? 'text-amber-600' : 'text-gray-500'">
          <Clock class="w-3.5 h-3.5" />
          <span>Pub: {{ formatFecha(aviso.fecha_publicacion) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>