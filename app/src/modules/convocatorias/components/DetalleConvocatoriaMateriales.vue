<script setup lang="ts">
import { BookOpen, FileText, Video, Link as LinkIcon, File, ExternalLink } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'

defineProps<{
  materiales: any[]
}>()
</script>

<template>
  <Card class="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
    <div class="bg-slate-50 border-b border-gray-200 px-8 py-6">
      <h2 class="text-2xl font-heading font-bold text-text-main flex items-center gap-3">
        <BookOpen class="w-6 h-6 text-primary" />
        Material de la Convocatoria
      </h2>
    </div>
    <CardContent class="p-8 sm:p-10 bg-white">
      <p class="text-text-muted mb-6">
        A continuación se presenta el material oficial y general para esta convocatoria.
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <a
          v-for="mat in materiales"
          :key="mat.id"
          :href="mat.url"
          target="_blank"
          class="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-primary hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-4">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
              :class="mat.tipo === 'PDF' ? 'bg-danger/10 text-danger group-hover:bg-red-500 group-hover:text-white' : mat.tipo === 'Video' ? 'bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white' : mat.tipo === 'Documento' ? 'bg-info/10 text-info group-hover:bg-primary group-hover:text-white' : 'bg-gray-50 text-text-muted group-hover:bg-gray-500 group-hover:text-white'"
            >
              <component 
                :is="mat.tipo === 'PDF' ? FileText : mat.tipo === 'Video' ? Video : mat.tipo === 'Documento' ? File : LinkIcon" 
                class="w-6 h-6" 
              />
            </div>
            <div>
              <p class="font-semibold text-text-main group-hover:text-primary transition-colors line-clamp-1">{{ mat.nombre }}</p>
              <p class="text-sm text-text-muted">{{ mat.descripcion }}</p>
              <p class="text-sm text-text-muted flex gap-2 font-extrabold">
                <span>{{ mat.tipo.toUpperCase() }}</span>
              </p>
            </div>
          </div>
          <ExternalLink class="w-5 h-5 shrink-0 text-gray-300 group-hover:text-primary transition-colors" />
        </a>
      </div>
    </CardContent>
  </Card>
</template>