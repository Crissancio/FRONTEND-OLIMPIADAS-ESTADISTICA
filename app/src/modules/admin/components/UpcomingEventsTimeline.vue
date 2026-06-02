<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'
import type { EventoProximoDTO } from '../../sistema/types/sistema.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

defineProps<{
  events: EventoProximoDTO[]
}>()

const formatDateBadge = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <Card class="rounded-xl border-gray-200 shadow-soft flex flex-col bg-white">
    <CardHeader class="p-6 border-b border-gray-100 space-y-0">
      <CardTitle class="text-lg font-heading font-bold text-text-main flex items-center gap-2">
        <CalendarDays class="w-5 h-5 text-accent" />
        Eventos Próximos
      </CardTitle>
    </CardHeader>
    <CardContent class="p-6 flex-1">
      <div v-if="events.length === 0" class="text-center text-text-muted text-sm py-8">
        No hay eventos programados a la vista.
      </div>
      <div v-else class="relative pl-6 border-l-2 border-gray-100 space-y-8">
        <div v-for="(event, i) in events" :key="i" class="relative">
          <div class="absolute -left-[31px] w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
          <div class="bg-gray-50 border border-gray-100 p-4 rounded-lg">
            <Badge variant="secondary" class="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold bg-white border border-gray-200 text-text-muted">
              {{ formatDateBadge(event.fecha) }}
            </Badge>
            <h4 class="font-bold text-sm text-text-main mt-2">{{ event.titulo }}</h4>
            <p v-if="event.descripcion" class="text-xs text-text-muted mt-1 leading-relaxed">
              {{ event.descripcion }}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>