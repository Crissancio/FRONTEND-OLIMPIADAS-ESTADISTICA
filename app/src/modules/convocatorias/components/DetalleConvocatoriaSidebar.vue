<script setup lang="ts">
import { FileText, Download, BookOpen, CheckCircle, Trophy, ArrowRight } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

defineProps<{
  aficheUrl: string | null
  convocatoriaDocumentoUrl: string | null
  reglamentoUrl: string | null
  primaryVisualUrl: string | null
  primaryVisualLabel: string
  estado: string
}>()
</script>

<template>
  <div class="space-y-6">
    <Card class="rounded-2xl shadow-sm border-primary overflow-hidden">
      <div class="bg-primary px-6 py-4 text-white">
        <h3 class="font-heading font-bold text-lg flex items-center gap-2">
          <FileText class="w-5 h-5" />
          Documentos Oficiales
        </h3>
      </div>
      <CardContent class="p-6 space-y-4">
        <p class="text-sm text-text-muted mb-4">
          Descarga los documentos oficiales para conocer todos los detalles, temarios y reglamentos de la olimpiada.
        </p>
        <a v-if="primaryVisualUrl" :href="primaryVisualUrl" target="_blank" rel="noreferrer" class="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition-all hover:border-blue-200 hover:bg-info/10 hover:shadow">
          <div class="flex items-center gap-3">
            <FileText class="w-5 h-5 text-text-muted group-hover:text-primary" />
            <span class="font-semibold text-text-main group-hover:text-primary/90 text-left whitespace-normal">{{ primaryVisualLabel }}</span>
          </div>
          <Download class="w-5 h-5 shrink-0 text-text-muted group-hover:text-primary" />
        </a>
        <div v-else class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm font-semibold text-text-muted">Sin afiche/convocatoria</div>
        
        <a v-if="convocatoriaDocumentoUrl" :href="convocatoriaDocumentoUrl" target="_blank" rel="noreferrer" class="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition-all hover:border-blue-200 hover:bg-info/10 hover:shadow">
          <div class="flex items-center gap-3">
            <BookOpen class="w-5 h-5 text-text-muted group-hover:text-primary" />
            <span class="font-semibold text-text-main group-hover:text-primary/90 text-left whitespace-normal">Convocatoria oficial</span>
          </div>
          <Download class="w-5 h-5 shrink-0 text-text-muted group-hover:text-primary" />
        </a>
        
        <a v-if="reglamentoUrl" :href="reglamentoUrl" target="_blank" rel="noreferrer" class="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition-all hover:border-blue-200 hover:bg-info/10 hover:shadow">
          <div class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-text-muted group-hover:text-primary" />
            <span class="font-semibold text-text-main group-hover:text-primary/90 text-left whitespace-normal">Reglamento Específico</span>
          </div>
          <Download class="w-5 h-5 shrink-0 text-text-muted group-hover:text-primary" />
        </a>
      </CardContent>
    </Card>

    <template v-if="estado === 'FINALIZADA'">
      <Card class="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl shadow-sm border-slate-700 overflow-hidden text-white">
        <CardContent class="p-8">
          <h3 class="font-heading font-bold text-xl flex items-center gap-2 mb-4 text-amber-400">
            <Trophy class="w-6 h-6" />
            Resultados Finales
          </h3>
          <p class="text-slate-300 text-sm mb-6 leading-relaxed">
            Esta convocatoria ha finalizado. Puedes consultar el cuadro de honor y los resultados oficiales de todas las categorías.
          </p>
          <Button 
            as="router-link"
            to="/resultados"
            size="lg"
            class="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-text-main font-bold py-6 rounded-xl transition-colors shadow-lg h-auto"
          >
            Ver Cuadro de Honor
            <ArrowRight class="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    </template>
    
    <Card class="bg-info/10 rounded-2xl border-blue-100">
      <CardContent class="p-6">
        <h4 class="font-heading font-bold text-primary/90 mb-2">¿Tienes dudas?</h4>
        <p class="text-sm text-blue-800/80 mb-4">Estamos aquí para ayudarte. Contáctanos si necesitas más información sobre la convocatoria.</p>
        <router-link 
          to="/contacto" 
          class="text-sm font-bold text-primary hover:text-primary/90 underline underline-offset-4 flex items-center gap-1"
        >
          Ir a contacto
          <ArrowRight class="w-4 h-4" />
        </router-link>
      </CardContent>
    </Card>
  </div>
</template>