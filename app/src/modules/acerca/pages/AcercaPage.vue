<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Lightbulb, Compass, Users, 
  BookOpen, Star
} from 'lucide-vue-next'
import MemberCard from '@/modules/acerca/components/MemberCard.vue'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'

type TabType = 'personal' | 'admin' | 'colab'
const activeTab = ref<TabType>('personal')

const personalAcademico = [
  { 
    name: 'Dr. Roberto Mendoza', 
    role: 'Director de la Carrera', 
    bio: 'Doctor en Estadística Aplicada con más de 20 años de experiencia docente. Promotor principal de iniciativas académicas y de investigación.', 
    email: 'rmendoza@umsa.bo' 
  },
  { 
    name: 'MSc. Elena Rojas', 
    role: 'Coordinadora Académica', 
    bio: 'Especialista en metodologías de enseñanza matemática. Encargada de la elaboración y revisión de los temarios de las olimpiadas.', 
    email: 'erojas@umsa.bo' 
  },
  { 
    name: 'Lic. Carlos Vargas', 
    role: 'Responsable del Comité Evaluador', 
    bio: 'Encargado principal de la redacción de problemas y casos de estudio, asegurando el nivel adecuado para cada categoría.', 
    email: 'cvargas@umsa.bo' 
  }
]

const personalAdmin = [
  { 
    name: 'Lic. Andrea Cortez', 
    role: 'Coordinadora Administrativa', 
    bio: 'Responsable de la logística, inscripción y gestión de recintos para las evaluaciones presenciales.', 
    email: 'acortez@umsa.bo' 
  },
  { 
    name: 'Ing. Mauricio Aliaga', 
    role: 'Encargado de Sistemas y TI', 
    bio: 'Administrador de la plataforma web, base de datos y sistemas de inscripción virtual de las olimpiadas.', 
    email: 'maliaga@umsa.bo' 
  }
]

const colaboradores = [
  { 
    name: 'Sociedad Científica de Estadística', 
    role: 'Apoyo Logístico', 
    bio: 'Grupo de estudiantes destacados que colaboran en la supervisión de pruebas, resolución de dudas y talleres de preparación.', 
    email: 'sce@umsa.bo' 
  },
  { 
    name: 'Docentes Voluntarios FCPN', 
    role: 'Comité de Revisión', 
    bio: 'Equipo multidisciplinario que apoya en la calificación y revisión cruzada de los exámenes de la fase final.', 
    email: 'fcpn.apoyo@umsa.bo' 
  }
]

const activeData = computed(() => {
  switch (activeTab.value) {
    case 'personal': return personalAcademico
    case 'admin': return personalAdmin
    case 'colab': return colaboradores
    default: return []
  }
})
</script>

<template>
  <div class="w-full bg-gray-50 min-h-screen">
    <!-- Hero Section -->
    <div class="bg-primary text-white pt-16 pb-12 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-transparent" />
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <BookOpen class="w-16 h-16 mx-auto mb-6 opacity-90" />
        <h1 class="text-4xl md:text-5xl font-heading font-black mb-4">Acerca de las Olimpiadas</h1>
        <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
          Conoce más sobre nuestro propósito, impacto y el equipo detrás de la competencia académica más importante de nuestra facultad.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20 pb-20 space-y-16">
      
      <!-- Introducción -->
      <Card class="rounded-2xl shadow-sm border-gray-100">
        <CardContent class="p-8 md:p-12">
          <h2 class="text-3xl font-heading font-bold text-text-main mb-6 border-b border-gray-100 pb-4">Introducción</h2>
          <div class="prose prose-lg text-text-muted max-w-none space-y-4">
            <p>
              Las <strong>Olimpiadas de Estadística de la UMSA</strong> son un evento académico anual organizado por la Carrera de Estadística de la Facultad de Ciencias Puras y Naturales. Nacen con el firme propósito de acercar las ciencias de datos, la probabilidad y el análisis lógico a estudiantes de distintos niveles educativos.
            </p>
            <p>
              A lo largo de nuestras ediciones, hemos impactado positivamente en miles de jóvenes, brindándoles un primer acercamiento a la vida universitaria y ayudándoles a descubrir su vocación por las ciencias exactas. No solo es una competencia, sino un espacio integral de aprendizaje, superación y reconocimiento al talento.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Misión y Visión -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card class="bg-gradient-to-br from-blue-50 to-white rounded-2xl border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <CardContent class="p-8">
            <div class="absolute top-0 right-0 p-6 opacity-5">
              <Lightbulb class="w-32 h-32" />
            </div>
            <div class="relative z-10">
              <div class="w-12 h-12 bg-info/20 rounded-xl flex items-center justify-center text-primary mb-6">
                <Lightbulb class="w-6 h-6" />
              </div>
              <h3 class="text-2xl font-heading font-bold text-text-main mb-4">Nuestra Misión</h3>
              <p class="text-text-muted leading-relaxed">
                Fomentar el pensamiento crítico, la capacidad de análisis y la resolución de problemas lógicos y estadísticos en la juventud boliviana, a través de desafíos académicos estructurados que promuevan la excelencia, el descubrimiento de talentos y el interés por las ciencias de datos desde etapas tempranas de su educación.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="bg-gradient-to-br from-amber-50 to-white rounded-2xl border-warning/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <CardContent class="p-8">
            <div class="absolute top-0 right-0 p-6 opacity-5">
              <Compass class="w-32 h-32" />
            </div>
            <div class="relative z-10">
              <div class="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center text-warning mb-6">
                <Compass class="w-6 h-6" />
              </div>
              <h3 class="text-2xl font-heading font-bold text-text-main mb-4">Nuestra Visión</h3>
              <p class="text-text-muted leading-relaxed">
                Constituirnos como el certamen académico preuniversitario más prestigioso a nivel nacional en el área de ciencias exactas, logrando que las matemáticas y la estadística sean vistas como herramientas accesibles, fascinantes y fundamentales para el desarrollo tecnológico y científico del país.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <!-- Comité Organizador -->
      <section>
        <div class="text-center mb-10">
          <h2 class="text-3xl font-heading font-bold text-text-main mb-4 flex items-center justify-center gap-3">
            <Star class="w-8 h-8 text-accent" />
            Comité Organizador
          </h2>
          <p class="text-lg text-text-muted max-w-2xl mx-auto">
            Conoce al equipo de profesionales y voluntarios que hacen posible cada edición de las Olimpiadas de Estadística.
          </p>
        </div>

        <Card class="rounded-2xl shadow-sm border-gray-200 overflow-hidden">
          <!-- Tabs -->
          <div class="flex flex-col sm:flex-row border-b border-gray-200 bg-gray-50/50">
            <button
              @click="activeTab = 'personal'"
              :class="`flex-1 py-4 px-6 font-heading font-bold text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'personal' ? 'border-primary text-primary bg-white' : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-100'}`"
            >
              <Users class="w-5 h-5" />
              Personal Académico
            </button>
            <button
              @click="activeTab = 'admin'"
              :class="`flex-1 py-4 px-6 font-heading font-bold text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'border-primary text-primary bg-white' : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-100'}`"
            >
              <Users class="w-5 h-5" />
              Administrativo
            </button>
            <button
              @click="activeTab = 'colab'"
              :class="`flex-1 py-4 px-6 font-heading font-bold text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'colab' ? 'border-primary text-primary bg-white' : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-100'}`"
            >
              <Users class="w-5 h-5" />
              Colaboradores
            </button>
          </div>

          <!-- List -->
          <CardContent class="p-6 sm:p-10 bg-gray-50">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MemberCard 
                v-for="(member, idx) in activeData" 
                :key="idx"
                :name="member.name"
                :role="member.role"
                :bio="member.bio"
                :email="member.email"
              />
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  </div>
</template>
