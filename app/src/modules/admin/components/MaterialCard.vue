<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Clock, ExternalLink, FileText, ListChecks, PlayCircle, ScrollText } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import type { AdminMaterial } from '@/modules/admin/data/admin.data'

const props = defineProps<{
  material: AdminMaterial
}>()

const typeConfig = computed(() => {
  switch (props.material.tipo_material) {
    case 'VIDEO':
      return { label: 'Video', icon: PlayCircle, class: 'border-error/20 bg-error/10 text-error' }
    case 'EXAMEN':
      return { label: 'Examen', icon: FileText, class: 'border-secondary/20 bg-secondary/10 text-secondary' }
    case 'SOLUCIONARIO':
      return { label: 'Solucionario', icon: ScrollText, class: 'border-success/20 bg-success/10 text-success' }
    case 'EJERCICIOS':
      return { label: 'Ejercicios', icon: ListChecks, class: 'border-warning/20 bg-warning/10 text-warning' }
    default:
      return { label: 'Otro', icon: FileText, class: 'border-gray-200 bg-gray-100 text-text-muted' }
  }
})

const publicationLabel = computed(() => props.material.fecha_publicacion ?? 'Sin publicar')
</script>

<template>
  <Card class="h-full border-gray-200 bg-white shadow-soft">
    <CardContent class="flex h-full flex-col gap-4 p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-bold uppercase tracking-wider text-text-muted">ID {{ material.id_material }}</p>
          <h3 class="mt-1 line-clamp-2 font-heading text-lg font-bold text-text-main">
            {{ material.nombre_material }}
          </h3>
        </div>
        <Badge variant="outline" :class="`shrink-0 border px-2.5 py-1 ${typeConfig.class}`">
          <component :is="typeConfig.icon" class="mr-1.5 h-3.5 w-3.5" />
          {{ typeConfig.label }}
        </Badge>
      </div>

      <p class="line-clamp-3 text-sm leading-6 text-text-muted">
        {{ material.descripcion || 'Sin descripcion registrada.' }}
      </p>

      <div class="mt-auto grid gap-3 rounded-lg border border-gray-200 bg-gray-50/70 p-3 text-sm">
        <div class="flex items-center gap-2 text-text-muted">
          <Clock class="h-4 w-4 text-primary" />
          <span>Creado: {{ material.fecha_creacion }}</span>
        </div>
        <div class="flex items-center gap-2 text-text-muted">
          <Calendar class="h-4 w-4 text-secondary" />
          <span>Publicacion: {{ publicationLabel }}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <Badge v-if="material.fase" variant="secondary" class="border border-gray-200 bg-white text-text-muted">
          {{ material.fase }}
        </Badge>
        <span v-else class="text-xs font-semibold text-text-muted">Material global</span>
        <Button v-if="material.enlace" as="a" :href="material.enlace" target="_blank" rel="noreferrer" variant="outline" size="sm">
          <ExternalLink class="h-4 w-4" />
          Abrir
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
