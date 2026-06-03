<script setup lang="ts">
import { ref } from 'vue'
import { Clock, CheckCircle2, FileEdit, AlertCircle, TrendingUp } from 'lucide-vue-next'
import type { ActividadRecienteDTO } from '../../sistema/types/sistema.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'

defineProps<{
  activities: ActividadRecienteDTO[]
  isLoadingMore: boolean
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

const scrollContainer = ref<HTMLElement | null>(null)

const handleScroll = () => {
  const el = scrollContainer.value
  if (!el) return

  // Detecta si el scroll llegó al fondo (con un margen de 20px)
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
    emit('load-more')
  }
}

const getActivityIcon = (tipo?: string | null) => {
  switch (tipo?.toUpperCase()) {
    case 'INSCRIPCION': return CheckCircle2
    case 'EDICION': case 'ACTUALIZAR': return FileEdit
    case 'AVISO': return AlertCircle
    case 'RESULTADO': return TrendingUp
    default: return Clock
  }
}

const getActivityColor = (tipo?: string | null) => {
  switch (tipo?.toUpperCase()) {
    case 'INSCRIPCION': return 'text-success'
    case 'EDICION': case 'ACTUALIZAR': return 'text-secondary'
    case 'AVISO': return 'text-warning'
    case 'RESULTADO': return 'text-primary'
    default: return 'text-text-muted'
  }
}

const formatTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <Card class="rounded-xl border-gray-200 shadow-soft flex flex-col bg-white h-[500px]">
    <CardHeader class="p-6 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 flex-shrink-0">
      <CardTitle class="text-lg font-heading font-bold text-text-main flex items-center gap-2">
        <Clock class="w-5 h-5 text-text-muted" />
        Actividad Reciente
      </CardTitle>
      <button class="text-sm font-semibold text-primary hover:text-primary-dark">
        Ver todo
      </button>
    </CardHeader>
    
    <div 
      ref="scrollContainer" 
      class="flex-1 overflow-y-auto divide-y divide-gray-100 dynamic-scroll"
      @scroll="handleScroll"
    >
      <div v-if="activities.length === 0" class="p-8 text-center text-text-muted text-sm">
        No se registran actividades recientes.
      </div>
      <div v-else>
        <div v-for="act in activities" :key="act.id_registro" class="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
          <div :class="`mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center`">
            <component 
              :is="getActivityIcon(act.tipo_actividad || act.modulo)"
              :class="`w-4 h-4 ${getActivityColor(act.tipo_actividad || act.modulo)}`"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-text-main">
              <span class="font-bold">{{ act.accion || 'Acción' }}</span>: 
              {{ act.titulo || act.descripcion }} 
              <span v-if="act.modulo" class="text-xs bg-gray-100 text-text-muted px-1.5 py-0.5 rounded ml-1">
                {{ act.modulo }}
              </span>
            </p>
            <p class="text-xs text-text-muted mt-1">{{ formatTime(act.fecha) }}</p>
          </div>
        </div>
      </div>

      <div v-if="isLoadingMore" class="p-4 text-center text-xs text-text-muted bg-gray-50/50 animate-pulse">
        Cargando más actividades...
      </div>
    </div>
  </Card>
</template>
