<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  Lightbulb, Compass, Star, 
  GraduationCap, Briefcase, Handshake 
} from 'lucide-vue-next'
import AcercaHeader from '@/modules/acerca/components/AcercaHeader.vue'
import MemberCard from '@/modules/acerca/components/MemberCard.vue'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import { publicService } from '@/modules/public/services/public.service'
import type { PublicColaboradorResponseDTO, TipoColaborador } from '@/modules/public/types/public.api'

type TabType = 'personal' | 'admin' | 'colab'
type MemberItem = {
  name: string
  role: string
  bio: string
  email: string
  perfil: string
}

const activeTab = ref<TabType>('personal')
const isLoading = ref(false)
const loadedTabs = ref<Record<TabType, boolean>>({
  personal: false,
  admin: false,
  colab: false,
})

const personalApi = ref<Record<TabType, MemberItem[]>>({
  personal: [],
  admin: [],
  colab: [],
})

const tabsOrder: TabType[] = ['personal', 'admin', 'colab']
let autoSwitchTimer: ReturnType<typeof setInterval> | null = null

const tabTipo: Record<TabType, TipoColaborador> = {
  personal: 'PERSONAL ACADEMICO',
  admin: 'ADMINISTRATIVO',
  colab: 'COLABORADOR',
}

const tabLabel: Record<TabType, string> = {
  personal: 'personal académico',
  admin: 'personal administrativo',
  colab: 'colaboradores',
}

const mapColaborador = (item: PublicColaboradorResponseDTO): MemberItem => ({
  name: [item.nombres, item.paterno, item.materno].filter(Boolean).join(' '),
  role: item.rol,
  bio: item.presentacion ?? 'Miembro del comité organizador de las Olimpiadas de Estadística.',
  email: item.correo,
  perfil: item.perfil?? ''
})

const loadPersonal = async (tab: TabType) => {
  isLoading.value = true
  try {
    const res = await publicService.obtenerColaboradores({ tipo: tabTipo[tab] })
    if (res && res.data && res.data.items) {
      personalApi.value[tab] = res.data.items.map(mapColaborador)
    } else {
      personalApi.value[tab] = []
    }
  } catch {
    personalApi.value[tab] = []
  } finally {
    loadedTabs.value[tab] = true
    isLoading.value = false
  }
}

const startAutoSwitch = () => {
  stopAutoSwitch()
  autoSwitchTimer = setInterval(() => {
    const currentIndex = tabsOrder.indexOf(activeTab.value)
    const nextIndex = (currentIndex + 1) % tabsOrder.length
    activeTab.value = tabsOrder[nextIndex]
  }, 30000)
}

const stopAutoSwitch = () => {
  if (autoSwitchTimer) clearInterval(autoSwitchTimer)
}

const handleTabClick = (tab: TabType) => {
  activeTab.value = tab
  startAutoSwitch() 
}

const activeData = computed(() => {
  return personalApi.value[activeTab.value]
})

watch(activeTab, (tab) => {
  void loadPersonal(tab)
})

onMounted(() => {
  void loadPersonal(activeTab.value)
  startAutoSwitch()
})

onUnmounted(() => {
  stopAutoSwitch()
})
</script>

<template>
  <div class="w-full bg-gray-50 min-h-screen">
    
    <AcercaHeader />

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
        <Card class="bg-linear-to-br from-blue-50 to-white rounded-2xl border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
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

        <Card class="bg-linear-to-br from-amber-50 to-white rounded-2xl border-warning/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
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
          <!-- Tabs Responsivas con Iconos Únicos -->
          <div class="flex border-b border-gray-200 bg-gray-50/50">
            <button
              @click="handleTabClick('personal')"
              :class="`py-4 px-4 sm:px-6 font-heading font-bold text-center transition-all border-b-2 flex items-center justify-center gap-2 flex-1 sm:flex-initial min-w-16 ${activeTab === 'personal' ? 'border-primary text-primary bg-white flex-auto' : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-100'}`"
            >
              <GraduationCap class="w-5 h-5 shrink-0" />
              <span :class="['text-sm transition-opacity duration-300', activeTab === 'personal' ? 'block' : 'hidden md:block']">
                Personal Académico
              </span>
            </button>
            
            <button
              @click="handleTabClick('admin')"
              :class="`py-4 px-4 sm:px-6 font-heading font-bold text-center transition-all border-b-2 flex items-center justify-center gap-2 flex-1 sm:flex-initial min-w-16 ${activeTab === 'admin' ? 'border-primary text-primary bg-white flex-auto' : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-100'}`"
            >
              <Briefcase class="w-5 h-5 shrink-0" />
              <span :class="['text-sm transition-opacity duration-300', activeTab === 'admin' ? 'block' : 'hidden md:block']">
                Administrativo
              </span>
            </button>
            
            <button
              @click="handleTabClick('colab')"
              :class="`py-4 px-4 sm:px-6 font-heading font-bold text-center transition-all border-b-2 flex items-center justify-center gap-2 flex-1 sm:flex-initial min-w-16 ${activeTab === 'colab' ? 'border-primary text-primary bg-white flex-auto' : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-100'}`"
            >
              <Handshake class="w-5 h-5 shrink-0" />
              <span :class="['text-sm transition-opacity duration-300', activeTab === 'colab' ? 'block' : 'hidden md:block']">
                Colaboradores
              </span>
            </button>
          </div>

          <!-- List -->
          <CardContent class="p-6 sm:p-10 bg-gray-50">
            <div v-if="isLoading" class="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm font-semibold text-text-muted">
              Cargando {{ tabLabel[activeTab] }}...
            </div>
            <div v-else-if="loadedTabs[activeTab] && activeData.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 text-center">
              <component :is="activeTab === 'personal' ? GraduationCap : activeTab === 'admin' ? Briefcase : Handshake" class="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p class="font-bold text-text-main">Sin {{ tabLabel[activeTab] }} agregado</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MemberCard 
                v-for="(member, idx) in activeData" 
                :key="idx"
                :name="member.name"
                :role="member.role"
                :bio="member.bio"
                :email="member.email"
                :perfil="member.perfil"
              />
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  </div>
</template>