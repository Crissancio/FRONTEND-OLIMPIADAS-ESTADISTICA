<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card class="shadow-soft border-gray-200 border-l-4 border-l-info bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-info/10 p-2.5"><BookOpen class="h-5 w-5 text-info" /></div>
            <div>
              <p class="text-xl font-bold text-text-main">{{ categoriasCount }}</p>
              <p class="text-xs text-text-muted">Categorías Registradas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="shadow-soft border-gray-200 border-l-4 border-l-secondary bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-secondary/10 p-2.5"><BarChart3 class="h-5 w-5 text-secondary" /></div>
            <div>
              <p class="text-xl font-bold text-text-main">Gestión Activa</p>
              <p class="text-xs text-text-muted">{{ convocatoria.gestion }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="shadow-soft border-gray-200 border-l-4 border-l-accent bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-accent/15 p-2.5"><Trophy class="h-5 w-5 text-accent" /></div>
            <div>
              <p class="text-xl font-bold text-text-main">Inscripción</p>
              <p class="text-xs text-text-muted">{{ convocatoria.monto_inscripcion ? `${convocatoria.monto_inscripcion} Bs.` : 'Gratuito / No Aplica' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
      <CardHeader>
        <CardTitle class="flex items-center gap-2"><Settings class="h-5 w-5 text-accent" />Datos del Evento</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col md:flex-row gap-6">
        <div class="w-full md:w-1/3 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden min-h-[250px] border border-gray-200">
          <div class="text-gray-400 flex flex-col items-center gap-2 p-4 text-center">
            <ImageIcon class="h-8 w-8" />
            <span class="text-sm font-medium">Afiche de Convocatoria</span>
            <p class="text-xs text-text-muted">Administrable en la pestaña de Configuración</p>
          </div>
        </div>
        
        <div class="w-full md:w-2/3 flex flex-col gap-4 content-start">
          <div>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-text-main">{{ convocatoria.nombre_convocatoria }}</h2>
            <p class="text-base font-medium text-text-muted mt-1">Gestión {{ convocatoria.gestion }}</p>
          </div>
          <div>
            <p class="text-sm text-text-main whitespace-pre-wrap leading-relaxed">
              {{ convocatoria.descripcion || 'Sin descripción detallada disponible actualmente.' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p class="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Inicio Olimpiadas</p>
              <p class="text-sm font-medium text-text-main">{{ formatDate(convocatoria.inicio_olimpiadas) }}</p>
            </div>
            <div>
              <p class="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Fin Olimpiadas</p>
              <p class="text-sm font-medium text-text-main">{{ formatDate(convocatoria.fin_olimpiadas) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-2 rounded-xl bg-accent/10 border border-accent/20 p-4">
            <div>
              <p class="text-xs text-accent-dark font-bold uppercase tracking-wider mb-1">Inicio Inscripciones</p>
              <p class="text-sm font-medium text-text-main">{{ formatDate(convocatoria.fecha_inicio_inscripcion) }}</p>
            </div>
            <div>
              <p class="text-xs text-accent-dark font-bold uppercase tracking-wider mb-1">Fin Inscripciones</p>
              <p class="text-sm font-medium text-text-main">{{ formatDate(convocatoria.fecha_fin_inscripcion) }}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, BarChart3, Trophy, Settings, Image as ImageIcon } from 'lucide-vue-next'
import type { ConvocatoriaDTO } from '@/modules/convocatorias/types/convocatorias.api'

defineProps<{
  convocatoria: ConvocatoriaDTO
  categoriasCount: number
}>()

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Por definir'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
</script>