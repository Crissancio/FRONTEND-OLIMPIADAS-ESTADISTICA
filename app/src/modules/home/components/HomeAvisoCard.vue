<script setup lang="ts">
import { computed } from 'vue'
import type { HomeAviso } from '../types/home.types'

const props = defineProps<{
  aviso: HomeAviso
  isFocused: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()

const borderStyle = computed(() => {
  const p = (props.aviso.prioridad || '').toUpperCase()
  if (p === 'ALTA') return { backgroundColor: 'var(--color-aviso-prioridad-alta)' }
  if (p === 'MEDIA') return { backgroundColor: 'var(--color-aviso-prioridad-media)' }
  return { backgroundColor: 'var(--color-aviso-prioridad-baja)' }
})

const badgeStyle = computed(() => {
  const t = (props.aviso.tipo || '').toUpperCase()
  if (['CONVOCATORIA', 'INSCRIPCION', 'EXAMEN', 'RESULTADO'].includes(t)) {
    return {
      backgroundColor: 'var(--color-aviso-tipo-academico-soft)',
      color: 'var(--color-aviso-tipo-academico)'
    }
  }
  if (['LOGISTICA', 'MANTENIMIENTO', 'SOPORTE', 'RECLAMO'].includes(t)) {
    return {
      backgroundColor: 'var(--color-aviso-tipo-soporte-soft)',
      color: 'var(--color-aviso-tipo-soporte)'
    }
  }
  if (['CRONOGRAMA', 'MATERIAL', 'CEREMONIA', 'CAPACITACION'].includes(t)) {
    return {
      backgroundColor: 'var(--color-aviso-tipo-recurso-soft)',
      color: 'var(--color-aviso-tipo-recurso)'
    }
  }
  return {
    backgroundColor: 'var(--color-aviso-tipo-general-soft)',
    color: 'var(--color-aviso-tipo-general)'
  }
})
</script>

<template>
  <div 
    class="shrink-0 w-70 sm:w-[320px] lg:w-full snap-center transition-all duration-500 origin-center cursor-pointer py-1 lg:py-4"
    :class="[
      isFocused ? 'lg:scale-100 lg:opacity-100 lg:z-10 lg:drop-shadow-xl' : 'lg:scale-90 lg:opacity-50 hover:lg:opacity-80'
    ]"
    @click="$emit('click')"
  >
    <div class="bg-white/10 backdrop-blur-md p-5 lg:p-6 rounded-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:bg-white/15 transition-colors h-full flex flex-col">
      <div class="absolute left-0 top-0 bottom-0 w-1.5" :style="borderStyle"></div>
      <div class="pl-3 flex-1">
        <div class="flex items-center justify-between mb-3">
          <span 
            class="text-[10px] lg:text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm"
            :style="badgeStyle"
          >
            {{ aviso.tipo }}
          </span>
          <span class="text-[10px] lg:text-xs text-white/60 font-medium">{{ aviso.fecha }}</span>
        </div>
        <h4 class="font-heading font-bold text-white mb-2 text-base lg:text-lg leading-tight">{{ aviso.titulo }}</h4>
        <p class="text-xs lg:text-sm text-white/80 line-clamp-3 leading-relaxed">{{ aviso.descripcion }}</p>
      </div>
    </div>
  </div>
</template>