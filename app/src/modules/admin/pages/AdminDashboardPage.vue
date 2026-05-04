<script setup lang="ts">
import { 
  Users, 
  FileText, 
  Bell, 
  BookOpen, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileEdit,
  TrendingUp,
  ArrowUpRight
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const metrics = [
  { label: 'Total Inscritos', value: '1,248', sub: '+12% esta semana', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Convocatorias Activas', value: '2', sub: '1 en curso, 1 próxima', icon: FileText, color: 'text-accent', bg: 'bg-accent/10' },
  { label: 'Avisos Publicados', value: '8', sub: '2 de urgencia alta', icon: Bell, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'Material Académico', value: '34', sub: '+5 añadidos recientemente', icon: BookOpen, color: 'text-secondary', bg: 'bg-secondary/10' },
]

const timeline = [
  { date: '15 Oct', title: 'Cierre de Inscripciones', desc: 'Convocatoria 2026 - Nivel Secundaria', status: 'upcoming' },
  { date: '20 Oct', title: 'Fase 1: Prueba de Selección', desc: 'Modalidad virtual mediante la plataforma', status: 'upcoming' },
  { date: '25 Oct', title: 'Publicación de Resultados F1', desc: 'Notificación masiva a estudiantes aprobados', status: 'upcoming' },
  { date: '10 Nov', title: 'Fase 2: Prueba Final', desc: 'Modalidad presencial - Campus Cota Cota', status: 'upcoming' },
]

const activities = [
  { type: 'inscripcion', user: 'Ana López', action: 'Se inscribió en', target: 'Olimpiadas 2026', time: 'Hace 10 min' },
  { type: 'edicion', user: 'Admin System', action: 'Actualizó el material', target: 'Temario Oficial 2026', time: 'Hace 1 hora' },
  { type: 'aviso', user: 'Admin System', action: 'Publicó un aviso urgente', target: 'Revisión de correos', time: 'Hace 2 horas' },
  { type: 'resultado', user: 'Admin System', action: 'Confirmó resultados de', target: 'Prueba de Preparación', time: 'Ayer a las 18:30' },
  { type: 'inscripcion', user: 'Carlos Mamani', action: 'Se inscribió en', target: 'Olimpiadas 2026', time: 'Ayer a las 15:40' },
  { type: 'edicion', user: 'Admin System', action: 'Editó fecha de fase en', target: 'Convocatoria 2026', time: 'Ayer a las 10:15' },
  { type: 'inscripcion', user: 'Lucía Fernández', action: 'Se inscribió en', target: 'Olimpiadas 2026', time: 'Ayer a las 09:10' },
  { type: 'aviso', user: 'Admin System', action: 'Publicó un aviso', target: 'Ampliación de inscripciones', time: '10 Oct, 14:00' },
]

const getActivityIcon = (type: string) => {
  switch(type) {
    case 'inscripcion': return CheckCircle2
    case 'edicion': return FileEdit
    case 'aviso': return AlertCircle
    case 'resultado': return TrendingUp
    default: return Clock
  }
}

const getActivityColor = (type: string) => {
  switch(type) {
    case 'inscripcion': return 'text-success'
    case 'edicion': return 'text-secondary'
    case 'aviso': return 'text-warning'
    case 'resultado': return 'text-primary'
    default: return 'text-text-muted'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-heading font-bold text-text-main">Dashboard General</h1>
        <p class="text-text-muted text-sm mt-1">Bienvenido al panel de administración de las Olimpiadas.</p>
      </div>
      <!--button 
        class="bg-accent hover:bg-accent-dark text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
      >
        <FileText class="w-4 h-4" />
        Nueva Convocatoria
      </button-->
    </div>

    <!-- Metrics Cards -->
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Actividad Reciente -->
      <Card class="lg:col-span-2 rounded-xl border-gray-200 shadow-soft flex flex-col bg-white">
        <CardHeader class="p-6 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-lg font-heading font-bold text-text-main flex items-center gap-2">
            <Clock class="w-5 h-5 text-text-muted" />
            Actividad Reciente
          </CardTitle>
          <button class="text-sm font-semibold text-primary hover:text-primary-dark">
            Ver todo
          </button>
        </CardHeader>
        <CardContent class="p-0 flex-1">
          <div class="divide-y divide-gray-100">
            <div v-for="(act, i) in activities" :key="i" class="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
              <div :class="`mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center`">
                <component 
                  :is="getActivityIcon(act.type)"
                  :class="`w-4 h-4 ${getActivityColor(act.type)}`"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-text-main">
                  <span class="font-bold">{{ act.user }}</span> {{ act.action }} <span class="font-bold">{{ act.target }}</span>
                </p>
                <p class="text-xs text-text-muted mt-1">{{ act.time }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Eventos Próximos (Timeline) -->
      <Card class="rounded-xl border-gray-200 shadow-soft flex flex-col bg-white">
        <CardHeader class="p-6 border-b border-gray-100 space-y-0">
          <CardTitle class="text-lg font-heading font-bold text-text-main flex items-center gap-2">
            <CalendarDays class="w-5 h-5 text-accent" />
            Eventos Próximos
          </CardTitle>
        </CardHeader>
        <CardContent class="p-6 flex-1">
          <div class="relative pl-6 border-l-2 border-gray-100 space-y-8">
            <div v-for="(event, i) in timeline" :key="i" class="relative">
              <div class="absolute -left-[31px] w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
              <div class="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                <Badge variant="secondary" class="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold bg-white border border-gray-200 text-text-muted">
                  {{ event.date }}
                </Badge>
                <h4 class="font-bold text-sm text-text-main mt-2">{{ event.title }}</h4>
                <p class="text-xs text-text-muted mt-1 leading-relaxed">{{ event.desc }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
