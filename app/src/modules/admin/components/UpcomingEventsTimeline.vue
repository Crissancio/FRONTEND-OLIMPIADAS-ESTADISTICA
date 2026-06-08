<script setup lang="ts">
import { ref } from 'vue'
import { CalendarDays, Megaphone, BookOpen, FileCheck, Info, Calendar } from 'lucide-vue-next'
import type { EventoProximoDTO } from '../../sistema/types/sistema.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'

defineProps<{
  events: EventoProximoDTO[]
  isLoadingMore: boolean
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

const scrollContainer = ref<HTMLElement | null>(null)

const handleScroll = () => {
  const el = scrollContainer.value
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
    emit('load-more')
  }
}

const getConfig = (tipo: string) => {
  const t = tipo.toUpperCase()
  
  if (t.includes('CONVOCATORIA')) {
    return { color: 'var(--color-estado-inscripciones-proximas)', bg: 'var(--color-estado-inscripciones-proximas-soft)', icon: Megaphone }
  }
  
  if (t.includes('PREPARACION') || t.includes('PREPARACIÓN')) {
    return { color: 'var(--color-estado-proxima)', bg: 'var(--color-estado-proxima-soft)', icon: BookOpen }
  }
  
  if (t.includes('PRUEBA')) {
    return { color: 'var(--color-estado-en-curso)', bg: 'var(--color-estado-en-curso-soft)', icon: FileCheck }
  }
  
  return { color: 'var(--color-aviso-otro)', bg: 'var(--color-aviso-otro-soft)', icon: Info }
}

const formatDay = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('es-BO', { day: '2-digit' }).format(new Date(dateStr))
  } catch { return '' }
}

const formatMonth = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('es-BO', { month: 'short' }).format(new Date(dateStr)).toUpperCase()
  } catch { return '' }
}
</script>

<template>
  <Card class="rounded-xl border-gray-200 shadow-sm flex flex-col bg-white h-125">
    <CardHeader class="p-6 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 shrink-0">
      <CardTitle class="text-lg font-heading font-bold text-gray-900 flex items-center gap-2 tracking-tight">
        <CalendarDays class="w-5 h-5 text-accent" />
        Línea de Tiempo de Eventos
      </CardTitle>
    </CardHeader>
    
    <div 
      ref="scrollContainer" 
      class="flex-1 overflow-y-auto p-6"
      @scroll="handleScroll"
    >
      <div v-if="events.length === 0" class="flex flex-col items-center justify-center h-full text-center text-gray-400 text-sm font-medium">
        <Calendar class="w-10 h-10 mb-2 opacity-50" />
        No hay eventos programados a la vista.
      </div>
      
      <div v-else class="relative border-l-2 border-gray-100 ml-2 space-y-6 pb-2">
        <div v-for="(event, i) in events" :key="i" class="relative pl-6">
          
          <div 
            class="absolute -left-2.25 top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10"
            :style="{ backgroundColor: getConfig(event.tipo).color }"
          ></div>
          
          <div 
            class="p-4 rounded-xl transition-all hover:shadow-md"
            :style="{ backgroundColor: getConfig(event.tipo).bg }"
          >
            <div class="flex items-start gap-3">
              
              <div class="flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-lg bg-white shadow-sm">
                <span class="text-[10px] font-bold text-gray-500 uppercase -mb-0.5 mt-0.5">{{ formatMonth(event.fecha) }}</span>
                <span class="text-lg font-black leading-none" :style="{ color: getConfig(event.tipo).color }">{{ formatDay(event.fecha) }}</span>
              </div>
              
              <div class="flex-1 min-w-0 pt-0.5">
                <div class="flex items-center gap-1.5 mb-1">
                  <component :is="getConfig(event.tipo).icon" class="w-3.5 h-3.5 shrink-0" :style="{ color: getConfig(event.tipo).color }" />
                  <span class="text-[10px] font-bold uppercase tracking-wider truncate" :style="{ color: getConfig(event.tipo).color }">{{ event.tipo }}</span>
                </div>
                <h4 class="font-bold text-sm text-gray-900 leading-snug">{{ event.titulo }}</h4>
                <p v-if="event.descripcion" class="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-3">
                  {{ event.descripcion }}
                </p>
              </div>

            </div>
          </div>
        </div>

        <div v-if="isLoadingMore" class="relative pl-6 mt-6">
          <div class="absolute -left-2.25 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-gray-200 animate-pulse"></div>
          <div class="p-3 rounded-xl bg-gray-50/50 text-center animate-pulse">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Recuperando más eventos...</span>
          </div>
        </div>

      </div>
    </div>
  </Card>
</template>