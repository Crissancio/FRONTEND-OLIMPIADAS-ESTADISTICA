<script setup lang="ts">
import { computed } from 'vue'
import { Users, Bell, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-vue-next'
import type { AdminDashboardDTO } from '../../sistema/types/sistema.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'

const props = defineProps<{
  data: AdminDashboardDTO | null
}>()

const metrics = computed(() => {
  if (!props.data) return []

  return [
    {
      label: 'Total Inscritos',
      value: props.data.inscripciones.total.toLocaleString(),
      sub: props.data.convocatoria_activa ? `Convocatoria: ${props.data.convocatoria_activa.nombre_convocatoria}` : 'Sin convocatoria activa',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      label: 'Inscripciones Aprobadas',
      value: props.data.inscripciones.aprobados.toLocaleString(),
      sub: 'Listos para la Fase de Selección',
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10'
    },
    {
      label: 'Inscripciones Pendientes',
      value: props.data.inscripciones.pendientes.toLocaleString(),
      sub: 'Requieren revisión de requisitos',
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    {
      label: 'Avisos Publicados',
      value: props.data.avisos_visibles.toString(),
      sub: 'Visibles actualmente en el portal',
      icon: Bell,
      color: 'text-accent',
      bg: 'bg-accent/10'
    }
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card v-for="(m, i) in metrics" :key="i" class="rounded-xl border-gray-200 bg-white shadow-soft hover:shadow-soft transition-shadow">
      <CardContent class="p-6">
        <div class="flex justify-between items-start mb-4">
          <div :class="`w-12 h-12 rounded-lg flex items-center justify-center ${m.bg}`">
            <component :is="m.icon" :class="`w-6 h-6 ${m.color}`" />
          </div>
        </div>
        <div>
          <p class="text-3xl font-heading font-bold text-text-main">{{ m.value }}</p>
          <h3 class="text-sm font-semibold text-text-muted mt-1">{{ m.label }}</h3>
          <p class="text-xs text-text-muted mt-2 flex items-center gap-1">
            <ArrowUpRight class="w-3 h-3 text-success" />
            {{ m.sub }}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>