<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BookOpen, GraduationCap, Trophy, Settings, FileText, Award, Calendar } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

import type { FaseUnionDTO } from '@/modules/fases/types/fases.api'

const props = defineProps<{
  fase: FaseUnionDTO
}>()

const emit = defineEmits<{
  (e: 'administrar', fase: FaseUnionDTO): void
  (e: 'materiales', fase: FaseUnionDTO): void
}>()

const router = useRouter()
const route = useRoute()

const phaseConfig = computed(() => {
  const isFinal = props.fase.tipo_fase === 'PRUEBA' && (props.fase as any).es_prueba_final === true

  if (isFinal) {
    return {
      label: 'Prueba Final',
      color: '#F5A623',
      bgSoft: 'rgba(245, 166, 35, 0.1)',
      icon: Trophy
    }
  }
  
  if (props.fase.tipo_fase === 'PRUEBA') {
    return {
      label: 'Prueba',
      color: '#113264',
      bgSoft: 'rgba(17, 50, 100, 0.1)',
      icon: GraduationCap
    }
  }
  
  return {
    label: 'Preparación',
    color: '#00B0D8',
    bgSoft: 'rgba(0, 176, 216, 0.1)',
    icon: BookOpen
  }
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const dateDisplay = computed(() => {
  if (props.fase.tipo_fase === 'PREPARACION') {
    return `${formatDate(props.fase.fecha_inicio)} - ${formatDate(props.fase.fecha_fin)}`
  }
  return formatDate(props.fase.fecha_realizacion)
})
const irAResultados = () => {
  const { convocatoriaId, categoriaId } = route.params
  
  router.push({
    name: 'admin-fase-gestion',
    params: {
      convocatoriaId,
      categoriaId,
      faseId: props.fase.id_fase
    }
  })
}
</script>

<template>
  <div class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.03] max-w-md w-full min-h-47.5">
    
    <div class="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden opacity-20">
      <component :is="phaseConfig.icon" class="h-40 w-40 stroke-1" :style="{ color: phaseConfig.color }" />
    </div>

    <div class="p-6 flex flex-col min-w-0 flex-1 z-10">
      <h4 class="font-bold text-lg text-text-main leading-tight tracking-tight mb-2 truncate" :title="fase.nombre_fase">
        {{ fase.nombre_fase }}
      </h4>
      
      <div class="flex items-center gap-1.5 text-sm font-medium text-text-muted mb-5">
        <Calendar class="h-4 w-4 opacity-70 shrink-0" />
        <span class="truncate" :title="dateDisplay">{{ dateDisplay }}</span>
      </div>

      <div class="flex flex-wrap gap-2 mt-auto">
        <Badge 
          variant="not_allowed" 
          class="px-3 py-1 text-[11px] font-bold uppercase tracking-wider border-none"
          :style="{ backgroundColor: phaseConfig.bgSoft, color: phaseConfig.color }"
        >
          {{ phaseConfig.label }}
        </Badge>
        <Badge 
          variant="not_allowed" 
          class="border-gray-200 bg-gray-50 text-text-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
        >
          {{ fase.modalidad }}
        </Badge>
      </div>
    </div>

    <div 
      class="grid gap-2 border-t border-gray-100 bg-white/80 backdrop-blur-sm p-3 z-10"
      :class="fase.tipo_fase === 'PRUEBA' ? 'grid-cols-3' : 'grid-cols-2'"
    >
      
      <Button 
        variant="outline" 
        class="h-9 w-full flex items-center justify-center gap-1 border-gray-200 bg-white text-xs font-bold text-text-main shadow-xs hover:bg-gray-50 transition-colors rounded-xl px-1"
        @click="$emit('administrar', fase)"
      >
        <Settings class="h-3.5 w-3.5 stroke-2 text-text-muted shrink-0" />
        <span class="truncate">Admin</span>
      </Button>

      <Button 
        variant="accent" 
        class="h-9 w-full flex items-center justify-center gap-1 text-xs font-bold text-white shadow-xs transition-colors rounded-xl hover:brightness-110 px-1"
        :style="{ backgroundColor: phaseConfig.color }"
        @click="$emit('materiales', fase)"
      >
        <FileText class="h-3.5 w-3.5 stroke-2 shrink-0" />
        <span class="truncate">Materiales</span>
      </Button>

      <Button 
        v-if="fase.tipo_fase === 'PRUEBA'"
        variant="outline" 
        class="h-9 w-full flex items-center justify-center gap-1 border-gray-200 bg-white text-xs font-bold text-text-main shadow-xs hover:bg-gray-50 transition-colors rounded-xl px-1 hover:text-primary group"
        @click="irAResultados"
      >
        <Award class="h-3.5 w-3.5 stroke-2 text-text-muted shrink-0 group-hover:text-primary transition-colors" />
        <span class="truncate">Resultados</span>
      </Button>
      
    </div>

  </div>
</template>

<style scoped>
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>