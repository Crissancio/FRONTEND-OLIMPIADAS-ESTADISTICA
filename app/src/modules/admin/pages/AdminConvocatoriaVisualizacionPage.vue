<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  AlertCircle,
  Users,
  BookOpen,
  BarChart3,
  Trophy,
  Calendar,
  CalendarDays,
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { useConvocatoria } from '@/modules/admin/composables/useConvocatorias'

const route = useRoute()
const router = useRouter()

const rawId = route.params.id
const id = typeof rawId === 'string' ? rawId : ''
const { convocatoria: convocatoriaRef } = useConvocatoria(id)

const convocatoria = computed(() => convocatoriaRef.value ?? null)

const statusClass = (status: string) => {
  if (status === 'Activa') return 'bg-success/10 text-success border-success/20'
  if (status === 'Borrador') return 'bg-warning/10 text-warning border-warning/20'
  return 'bg-gray-100 text-text-muted border-gray-200'
}
</script>

<template>
  <div v-if="!convocatoria" class="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <AlertCircle class="mb-4 h-12 w-12 text-text-muted" />
    <h1 class="font-heading text-2xl font-bold text-text-main">Convocatoria no encontrada</h1>
    <p class="mt-2 max-w-lg text-sm text-text-muted">No existe un registro con ese identificador.</p>
    <Button class="mt-6 flex items-center gap-2" @click="router.push('/admin/convocatorias')">
      <ArrowLeft class="h-4 w-4" />
      Volver a convocatorias
    </Button>
  </div>

  <div v-else class="space-y-6">
    <Button variant="ghost" class="px-0 text-text-muted hover:text-primary flex items-center gap-2" @click="router.push('/admin/convocatorias')">
      <ArrowLeft class="h-4 w-4" />
      Volver a convocatorias
    </Button>

    <div>
      <div class="mb-2 flex items-center gap-3">
        <h1 class="font-heading text-3xl font-bold text-text-main">{{ convocatoria.nombre }}</h1>
        <Badge variant="outline" :class="`border px-2.5 py-1 ${statusClass(convocatoria.estado)}`">
          {{ convocatoria.estado }}
        </Badge>
      </div>
      <p class="text-sm text-text-muted">Gestión {{ convocatoria.gestion }}</p>
    </div>

    <div v-if="convocatoria.estado === 'Borrador'" class="rounded-xl border border-warning/20 bg-warning/10 p-4">
      <div class="flex items-start gap-3">
        <AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p class="text-sm font-bold text-warning">Estado borrador</p>
          <p class="mt-1 text-sm text-warning/80">Completa configuración para publicar.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-primary/10 p-2.5"><Users class="h-5 w-5 text-primary" /></div>
            <div><p class="text-xl font-bold text-text-main">{{ convocatoria.inscritos }}</p><p class="text-xs text-text-muted">Inscritos</p></div>
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-info/10 p-2.5"><BookOpen class="h-5 w-5 text-info" /></div>
            <div><p class="text-xl font-bold text-text-main">{{ convocatoria.categorias }}</p><p class="text-xs text-text-muted">Categorías</p></div>
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-secondary/10 p-2.5"><BarChart3 class="h-5 w-5 text-secondary" /></div>
            <div><p class="text-xl font-bold text-text-main">{{ convocatoria.fases }}</p><p class="text-xs text-text-muted">Fases</p></div>
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-accent/10 p-2.5"><Trophy class="h-5 w-5 text-accent" /></div>
            <div><p class="text-xl font-bold text-text-main">0</p><p class="text-xs text-text-muted">Ganadores</p></div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="shadow-soft border-gray-200 bg-white">
      <CardHeader><CardTitle class="text-text-main">Descripción</CardTitle></CardHeader>
      <CardContent><p class="text-sm leading-relaxed text-text-muted">{{ convocatoria.descripcion }}</p></CardContent>
    </Card>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-text-main"><Calendar class="h-4 w-4 text-primary" />Periodo de olimpiadas</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3 text-sm text-text-muted">
          <p><span class="font-bold text-text-main">Inicio:</span> {{ convocatoria.inicioOlimpiada }}</p>
          <p><span class="font-bold text-text-main">Fin:</span> {{ convocatoria.finOlimpiada }}</p>
        </CardContent>
      </Card>
      <Card class="shadow-soft border-gray-200 bg-white">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-text-main"><CalendarDays class="h-4 w-4 text-accent" />Periodo de inscripción</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3 text-sm text-text-muted">
          <p><span class="font-bold text-text-main">Inicio:</span> {{ convocatoria.inicioInscripcion }}</p>
          <p><span class="font-bold text-text-main">Fin:</span> {{ convocatoria.finInscripcion }}</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
