<script setup lang="ts">
import { BookOpen, Users, CheckCircle, Clock, CreditCard } from 'lucide-vue-next'
import type { ConvocatoriaDTO, ConvocatoriaEstadistica } from '@/modules/convocatorias/types/convocatorias.api'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'

defineProps<{
  convocatoria: ConvocatoriaDTO
  estadisticas: ConvocatoriaEstadistica | null
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
    <Card class="shadow-sm border border-gray-200 bg-white">
      <CardContent class="p-3 flex items-center gap-3">
        <div class="shrink-0 p-2 bg-warning/10 rounded-lg">
          <Clock class="h-5 w-5 text-warning" />
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text-main leading-none">{{ estadisticas?.pedientes || 0 }}</p>
          <p class="text-[10px] text-text-muted font-bold uppercase truncate mt-0.5">Pendientes</p>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-sm border border-gray-200 bg-white">
      <CardContent class="p-3 flex items-center gap-3">
        <div class="shrink-0 p-2 bg-success/10 rounded-lg">
          <CheckCircle class="h-5 w-5 text-success" />
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text-main leading-none">{{ estadisticas?.aprobados || 0 }}</p>
          <p class="text-[10px] text-text-muted font-bold uppercase truncate mt-0.5">Aprobados</p>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-sm border border-gray-200 bg-white">
      <CardContent class="p-3 flex items-center gap-3">
        <div class="shrink-0 p-2 bg-primary/10 rounded-lg">
          <Users class="h-5 w-5 text-primary" />
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text-main leading-none">{{ estadisticas?.total || 0 }}</p>
          <p class="text-[10px] text-text-muted font-bold uppercase truncate mt-0.5">Participantes</p>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-sm border border-gray-200 bg-white">
      <CardContent class="p-3 flex items-center gap-3">
        <div class="shrink-0 p-2 bg-info/10 rounded-lg">
          <BookOpen class="h-5 w-5 text-info" />
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text-main leading-none">{{ estadisticas?.total_categorias || 0 }}</p>
          <p class="text-[10px] text-text-muted font-bold uppercase truncate mt-0.5">Categorías</p>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-sm border border-gray-200 bg-white sm:col-span-2 lg:col-span-1">
      <CardContent class="p-3 flex items-center gap-3">
        <div class="shrink-0 p-2 bg-accent/10 rounded-lg">
          <CreditCard class="h-5 w-5 text-accent" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-bold text-text-main leading-tight truncate">
            {{ convocatoria.monto_inscripcion ? `${convocatoria.monto_inscripcion} Bs` : 'Gratis' }}
          </p>
          <p class="text-[10px] text-text-muted font-bold uppercase truncate mt-0.5">Inscripción</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>