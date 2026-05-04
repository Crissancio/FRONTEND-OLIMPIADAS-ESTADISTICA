-<script setup lang="ts">
import { computed } from 'vue'
import { 
  ArrowRight, BookOpen, AlertCircle,
  Download, Calendar, Users, Award, BarChart2, Target, GraduationCap 
} from 'lucide-vue-next'
import { convocatoriasMock, avisosMock } from '@/modules/convocatorias/data/convocatorias.data'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const activeConv = computed(() => {
  return convocatoriasMock.find(c => c.estado === 'ACTIVA') || convocatoriasMock[0]
})
</script>

<template>
  <div class="w-full bg-background min-h-screen">
    <!-- Hero Section Institucional -->
    <section class="relative bg-primary overflow-hidden text-white py-20 lg:py-28 border-b-[6px] border-accent">
      <!-- Patrón geométrico sutil (malla de puntos) -->
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div class="flex-1 text-center lg:text-left">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold mb-8 border border-white/20">
            <span v-if="activeConv.estado === 'ACTIVA'" class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              Gestión Activa: {{ activeConv.gestion }}
            </span>
            <span v-else>Última Convocatoria Finalizada</span>
          </div>
          
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight tracking-tight">
            Olimpiada Paceña de <br class="hidden md:block"/>Estadística
          </h1>
          <p class="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto lg:mx-0 font-sans font-light">
            Fomentando el pensamiento lógico, matemático y analítico. Un espacio de excelencia académica para la juventud boliviana, organizado por la UMSA.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button
              v-if="activeConv.estado === 'ACTIVA'"
              as="router-link"
              to="/inscripcion"
              variant="accent"
              size="lg"
              class="w-full sm:w-auto px-8 py-4 text-lg font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              Inscribirse Ahora
              <ArrowRight class="w-5 h-5" />
            </Button>
            <Button
              as="router-link"
              :to="`/convocatoria/${activeConv.id}`"
              variant="ghost"
              size="lg"
              class="w-full sm:w-auto px-8 py-4 text-lg font-semibold flex items-center justify-center gap-2 bg-transparent border border-white text-white hover:bg-white hover:text-primary transition-all"
            >
              Bases de la Convocatoria
            </Button>
          </div>
        </div>
        
        <!-- Elemento Gráfico Institucional -->
        <div class="flex-1 hidden lg:flex justify-center">
          <div class="relative w-full max-w-md aspect-square bg-primary-dark/50 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl p-8">
             <div class="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl"></div>
             <div class="relative z-10 grid grid-cols-2 gap-4 w-full h-full">
                <div class="bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-col gap-3">
                   <BarChart2 class="w-12 h-12 text-secondary" />
                   <span class="text-sm font-medium text-blue-100">Análisis</span>
                </div>
                <div class="bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-col gap-3">
                   <BookOpen class="w-12 h-12 text-accent" />
                   <span class="text-sm font-medium text-blue-100">Conocimiento</span>
                </div>
                <div class="bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-col gap-3">
                   <Users class="w-12 h-12 text-blue-200" />
                   <span class="text-sm font-medium text-blue-100">Competencia</span>
                </div>
                <div class="bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-col gap-3">
                   <Award class="w-12 h-12 text-success" />
                   <span class="text-sm font-medium text-blue-100">Excelencia</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenido Principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      <!-- Columna Izquierda: Convocatoria -->
      <div class="lg:col-span-8 space-y-8">
        <div class="flex items-center gap-3 border-b border-gray-200 pb-4">
          <BookOpen class="w-6 h-6 text-primary" />
          <h2 class="text-2xl font-heading font-bold text-text-main">Convocatoria Vigente</h2>
        </div>
        
        <Card class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <CardContent class="p-0">
            <div class="md:flex">
              <!-- Área de Descarga del Afiche -->
              <div class="md:w-1/3 bg-slate-50 relative flex items-center justify-center p-8 border-r border-gray-200">
                <div class="w-full aspect-[3/4] bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center text-text-muted p-4 text-center rounded hover:border-primary transition-colors cursor-pointer group">
                  <Download class="w-10 h-10 mb-3 text-secondary group-hover:text-primary transition-colors" />
                  <span class="text-sm font-semibold text-text-main">Afiche Oficial PDF</span>
                  <span class="text-xs mt-1">Descargar (2.4 MB)</span>
                </div>
                <Badge 
                  v-if="activeConv.estado === 'ACTIVA'" 
                  class="absolute top-4 left-4 bg-success text-white font-bold px-3 py-1 shadow-sm"
                >
                  EN CURSO
                </Badge>
              </div>
              
              <!-- Detalles Estructurados -->
              <div class="p-8 md:w-2/3 flex flex-col justify-between">
                <div>
                  <h3 class="text-2xl font-heading font-bold text-primary-dark mb-3">
                    {{ activeConv.nombre }}
                  </h3>
                  <p class="text-text-muted mb-6 text-sm leading-relaxed">
                    {{ activeConv.descripcionBreve }}
                  </p>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div class="bg-background p-4 rounded-lg border border-gray-100">
                      <div class="flex items-center gap-2 mb-2">
                        <Calendar class="w-4 h-4 text-secondary" />
                        <h4 class="font-semibold text-sm text-text-main">Cronograma</h4>
                      </div>
                      <p class="text-sm text-text-muted">{{ activeConv.fechas }}</p>
                    </div>
                    
                    <div class="bg-background p-4 rounded-lg border border-gray-100">
                      <div class="flex items-center gap-2 mb-2">
                        <Users class="w-4 h-4 text-secondary" />
                        <h4 class="font-semibold text-sm text-text-main">Categorías</h4>
                      </div>
                      <div class="flex flex-wrap gap-1.5 mt-1">
                        <span v-for="cat in activeConv.categorias" :key="cat.id" class="text-xs font-medium bg-white border border-gray-200 text-text-main px-2 py-1 rounded">
                          {{ cat.nombre }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="pt-4 border-t border-gray-100 flex justify-end">
                  <Button
                    as="router-link"
                    :to="`/convocatoria/${activeConv.id}`"
                    variant="link"
                    class="text-primary font-semibold hover:text-secondary group flex items-center"
                  >
                    Ver documento completo
                    <ArrowRight class="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Columna Derecha: Boletín Institucional -->
      <div class="lg:col-span-4 space-y-6">
        <div class="flex items-center gap-3 border-b border-gray-200 pb-4">
          <AlertCircle class="w-6 h-6 text-accent" />
          <h2 class="text-xl font-heading font-bold text-text-main">Boletín Oficial</h2>
        </div>
        
        <div class="flex flex-col gap-4">
          <div 
            v-for="aviso in avisosMock" 
            :key="aviso.id" 
            class="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden"
          >
            <!-- Línea indicadora de estado -->
            <div :class="[
              'absolute left-0 top-0 bottom-0 w-1.5',
              aviso.tipo === 'Urgente' ? 'bg-danger' : 
              aviso.tipo === 'Importante' ? 'bg-warning' : 'bg-secondary'
            ]"></div>
            
            <div class="pl-2">
              <div class="flex items-center justify-between mb-2">
                <span :class="[
                  'text-xs font-bold uppercase tracking-wider',
                  aviso.tipo === 'Urgente' ? 'text-danger' : 
                  aviso.tipo === 'Importante' ? 'text-warning' : 'text-secondary'
                ]">
                  {{ aviso.tipo }}
                </span>
                <span class="text-xs text-text-muted font-medium">{{ aviso.fecha }}</span>
              </div>
              <h4 class="font-heading font-semibold text-text-main mb-1.5 text-sm">{{ aviso.titulo }}</h4>
              <p class="text-sm text-text-muted line-clamp-2 leading-relaxed">{{ aviso.descripcion }}</p>
            </div>
          </div>
          
          <Button variant="outline" class="w-full mt-2 text-sm">
            Historial de Avisos
          </Button>
        </div>
      </div>
    </div>

    <!-- Sección Institucional -->
    <section class="bg-white py-16 border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-heading font-bold text-primary-dark mb-4">Misión y Objetivos</h2>
          <div class="w-16 h-1 bg-accent mx-auto rounded-full mb-6"></div>
          <p class="text-text-muted max-w-2xl mx-auto">
            Buscamos potenciar el desarrollo analítico y la excelencia académica de los jóvenes bolivianos a través de desafíos estructurados.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm">
              <Target class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-heading font-bold text-text-main mb-3">Pensamiento Lógico</h3>
            <p class="text-sm text-text-muted">Desarrollar habilidades críticas para la resolución de problemas mediante la aplicación de herramientas estadísticas y matemáticas.</p>
          </div>

          <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm">
              <Users class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-heading font-bold text-text-main mb-3">Sana Competencia</h3>
            <p class="text-sm text-text-muted">Incentivar la participación de estudiantes de secundaria (1ro a 6to) de todos los sistemas educativos en un entorno académico riguroso.</p>
          </div>

          <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm">
              <GraduationCap class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-heading font-bold text-text-main mb-3">Impacto Universitario</h3>
            <p class="text-sm text-text-muted">Construir bases sólidas que preparen a los talentos jóvenes para los desafíos de la educación superior en ciencias exactas.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
