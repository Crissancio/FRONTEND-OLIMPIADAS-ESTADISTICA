<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { BookOpen, BarChart3, Trophy, Settings, Image as ImageIcon, FileText, Download } from 'lucide-vue-next'
import type { ConvocatoriaDTO } from '@/modules/convocatorias/types/convocatorias.api'
import { useMaterialesStore } from '@/modules/material/stores/material.store'
import { useCategoriasStore } from '@/modules/categorias/stores/categorias.store'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'

const props = defineProps<{
  convocatoria: ConvocatoriaDTO
}>()

const materialesStore = useMaterialesStore()
const categoriasStore = useCategoriasStore()

onMounted(() => {
  materialesStore.fetchMateriales()
  categoriasStore.fetchCategoriasPorConvocatoria(props.convocatoria.id_convocatoria)
})

// Búsqueda de materiales principales según DTO
const aficheObj = computed(() => materialesStore.materiales.find(m => m.tipo_material === 'AFICHE'))
const reglamentoObj = computed(() => materialesStore.materiales.find(m => m.tipo_material === 'REGLAMENTO'))
const convocatoriaPdfObj = computed(() => materialesStore.materiales.find(m => m.tipo_material === 'CONVOCATORIA'))

const totalCategorias = computed(() => categoriasStore.categorias.length)

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Por definir'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card class="shadow-soft border-gray-200 border-l-4 border-l-info bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-info/10 p-2.5"><BookOpen class="h-5 w-5 text-info" /></div>
            <div>
              <p class="text-xl font-bold text-text-main">{{ totalCategorias }}</p>
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

    <Card class="border-gray-200 border-l-4 border-l-primary shadow-soft bg-white">
      <CardHeader>
        <CardTitle class="flex items-center gap-2"><Settings class="h-5 w-5 text-primary" />Datos del Evento</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col md:flex-row gap-6">
        
        <div class="w-full md:w-1/3 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden min-h-[250px] border border-gray-200">
          <img v-if="aficheObj" :src="aficheObj.enlace_acceso" alt="Afiche" class="h-full w-full object-cover" />
          <div v-else class="text-gray-400 flex flex-col items-center gap-2 p-4 text-center">
            <ImageIcon class="h-8 w-8" />
            <span class="text-sm font-medium">Sin Afiche</span>
            <p class="text-xs text-text-muted">Administrable en la pestaña de Configuración</p>
          </div>
        </div>
        
        <div class="w-full md:w-2/3 flex flex-col gap-4 content-start">
          <div>
            <h2 class="text-2xl md:text-3xl font-heading font-bold text-text-main">{{ convocatoria.nombre_convocatoria }}</h2>
            <p class="text-base font-medium text-text-muted mt-1">Gestión {{ convocatoria.gestion }}</p>
          </div>
          
          <p class="text-sm text-text-main whitespace-pre-wrap leading-relaxed">
            {{ convocatoria.descripcion || 'Sin descripción detallada.' }}
          </p>
          
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

          <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
            <a 
              v-if="reglamentoObj" 
              :href="reglamentoObj.enlace_acceso" 
              target="_blank" 
              class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-text-main shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FileText class="h-4 w-4 text-primary" /> Reglamento
            </a>
            <a 
              v-if="convocatoriaPdfObj" 
              :href="convocatoriaPdfObj.enlace_acceso" 
              target="_blank" 
              class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-text-main shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Download class="h-4 w-4 text-primary" /> Convocatoria (PDF)
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>