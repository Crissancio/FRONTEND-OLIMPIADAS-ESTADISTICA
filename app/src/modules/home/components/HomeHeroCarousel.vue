<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { HomeConvocatoria } from '../types/home.types'
import type { EstadoTemporal } from '@/modules/convocatorias/types/convocatorias.api'

const props = defineProps<{
  activeConv?: HomeConvocatoria
  hasBackendConvocatoria: boolean
  showPreinscripcion: boolean
}>()

const slides = computed(() => [
  { id: 1, image: '/inicio-1.jpg', isInfo: true },
  { id: 2, image: '/inicio-2.jpg', isInfo: false, title: 'Análisis', desc: 'Desarrolla habilidades críticas para interpretar y modelar datos del mundo real, fomentando decisiones basadas en evidencia.' },
  { id: 3, image: '/inicio-3.jpg', isInfo: false, title: 'Conocimiento', desc: 'Fortalece tus bases matemáticas y estadísticas, accediendo a herramientas fundamentales para el avance científico.' },
  { id: 4, image: '/inicio-4.jpg', isInfo: false, title: 'Competencia', desc: 'Mide tus capacidades en un entorno de sano desafío compartiendo con estudiantes de alto rendimiento.' },
  { id: 5, image: '/inicio-5.jpg', isInfo: false, title: 'Excelencia', desc: 'Alcanza tu máximo potencial académico promoviendo el rigor, la disciplina y la excelencia.' }
])

const currentSlide = ref(0)
const typedText = ref('')
const descriptionRef = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | null = null
let typeInterval: ReturnType<typeof setInterval> | null = null

const mainTitle = computed(() => {
  return (props.hasBackendConvocatoria && props.activeConv)
    ? props.activeConv.nombre
    : 'Olimpiada Paceña de Estadística'
})

const currentGestion = computed(() => {
  return (props.hasBackendConvocatoria && props.activeConv)
    ? props.activeConv.gestion
    : ''
})

const detalleConvocatoriaTo = computed(() => ({
  name: 'convocatoria-detalle',
  params: { id: props.activeConv?.id }
}))

const currentDescription = computed(() => {
  if (currentSlide.value === 0) {
    return props.activeConv?.descripcionBreve || 'Fomentando el pensamiento lógico y analítico organizado por la UMSA.'
  }
  return slides.value[currentSlide.value]?.desc || ''
})

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const scrollDescriptionToEnd = () => {
  void nextTick(() => {
    const el = descriptionRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

const getStatusBg = (estado?: string | EstadoTemporal) => {
  const e = (estado || '').toUpperCase()
  if (e.includes('INSCRIPCIONES_PROXIMAS') || e.includes('INSCRIPCIONES PROXIMAS')) return 'bg-estado-inscripciones-proximas'
  if (e.includes('INSCRIPCION')) return 'bg-estado-inscripcion'
  if (e === 'EN CURSO' || e === 'ACTIVA') return 'bg-estado-en-curso'
  if (e.includes('PROXIMA')) return 'bg-estado-proxima'
  if (e.includes('FINALIZADA')) return 'bg-estado-finalizada'
  if (e.includes('OCULTA') || e.includes('OCULTO')) return 'bg-estado-oculta'
  if (e.includes('CANCELADA') || e.includes('CANCELADO')) return 'bg-estado-cancelada'
  return 'bg-estado-borrador'
}

const startTypewriter = () => {
  if (typeInterval) clearInterval(typeInterval)
  typedText.value = ''
  const text = currentDescription.value
  let i = 0
  typeInterval = setInterval(() => {
    if (i < text.length) {
      typedText.value += text.charAt(i)
      scrollDescriptionToEnd()
      i++
    } else {
      clearInterval(typeInterval!)
    }
  }, 25)
}

watch(currentSlide, startTypewriter)
watch(typedText, scrollDescriptionToEnd)

onMounted(() => {
  startTypewriter()
  timer = setInterval(nextSlide, 12000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (typeInterval) clearInterval(typeInterval)
})
</script>

<template>
  <div class="absolute inset-0 z-0 overflow-hidden bg-primary">
    <transition-group name="fade" tag="div" class="w-full h-full relative">
      <div v-for="(slide, idx) in slides" :key="slide.id" v-show="currentSlide === idx" class="absolute inset-0 w-full h-full">
        <img :src="slide.image" class="w-full h-full object-cover object-center scale-105" alt="OPE" />
      </div>
    </transition-group>

    <div class="lg:hidden absolute inset-0 bg-linear-to-t from-primary/95 via-primary/50 to-transparent"></div>
    <div class="hidden lg:block absolute top-0 right-0 bottom-0 w-[55%] bg-linear-to-l from-primary via-primary/70 to-transparent"></div>
  </div>

  <div class="relative z-20 flex-1 flex flex-col h-full w-full">

    <div class="absolute top-6 lg:top-8 left-6 lg:left-8 flex gap-3 lg:gap-4 z-50 pointer-events-none w-[90%] md:w-auto items-center">
      <img 
        src="/logo-estadistica.png" 
        alt="Logo Estadística UMSA" 
        class="w-40 sm:w-40 lg:w-56 object-contain drop-shadow-xl transition-all duration-300 shrink-0 -ml-4 -mr-8" 
      />

      <Transition name="slide-up-fade" mode="out-in">
        <div v-if="currentSlide !== 0" class="flex gap-3 lg:gap-4 items-stretch">
          <div class="w-1.5 lg:w-2 rounded-full shadow-lg shrink-0" :class="getStatusBg(props.activeConv?.estado_temporal)"></div>
          <div class="flex flex-col items-start justify-center">
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight drop-shadow-lg text-white">
              {{ mainTitle }}
            </h1>
          </div>
        </div>
      </Transition>
    </div>

    <div class="absolute top-[20%] lg:top-[25%] left-6 lg:left-16 h-8 flex items-center overflow-hidden z-30 pointer-events-none">
      <Transition name="expand-h">
        <div
          v-if="currentSlide === 0 && props.hasBackendConvocatoria && props.activeConv"
          :class="getStatusBg(props.activeConv.estado_temporal)"
          class="text-white py-1.5 px-4 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-lg rounded-r-full whitespace-nowrap"
        >
          {{ props.activeConv.estado_temporal }}
        </div>
      </Transition>
    </div>

    <Transition name="slide-up-fade" mode="out-in">
      <div v-if="currentSlide === 0" class="absolute top-[calc(20%+2.5rem)] lg:top-[calc(25%+2.5rem)] left-6 lg:left-16 z-30 pointer-events-none max-w-[85%] lg:max-w-[72%]">
        <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight drop-shadow-2xl text-white">
          {{ mainTitle }}
          <span v-if="currentGestion" class="mx-2 lg:mx-4 text-secondary/80">|</span>
          <span v-if="currentGestion" class="text-secondary whitespace-nowrap">Gestion {{ currentGestion }}</span>
        </h1>
      </div>
    </Transition>

    <Transition name="slide-up-fade" mode="out-in">
      <h2
        v-if="currentSlide !== 0"
        :key="'slide-title-' + currentSlide"
        class="absolute top-[25%] lg:top-[30%] left-6 lg:left-16 text-white font-bold leading-tight drop-shadow-2xl z-30 pointer-events-none text-4xl sm:text-5xl lg:text-7xl"
      >
        {{ slides[currentSlide]?.title }}
      </h2>
    </Transition>

    <div class="absolute bottom-48 lg:bottom-48 left-6 lg:left-16 w-[90%] lg:w-2/3 pr-6 z-30 pointer-events-none">
      <p
        ref="descriptionRef"
        class="hero-description text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl drop-shadow-md"
      >
        {{ typedText }}<span class="animate-pulse">|</span>
      </p>
    </div>

    <div class="absolute bottom-16 lg:bottom-12 left-6 right-6 sm:right-auto lg:left-16 flex flex-col sm:flex-row gap-4 z-40">
      <Button
        v-if="props.showPreinscripcion"
        as="router-link"
        to="/inscripcion"
        variant="accent"
        size="lg"
        class="w-full sm:w-auto px-8 py-3 text-base lg:text-lg font-bold shadow-2xl transition-all hover:scale-105 rounded-xl h-auto flex justify-center"
      >
        Ir a pre-inscripción <ArrowRight class="w-5 h-5 ml-2" />
      </Button>
      <Button
        v-if="props.hasBackendConvocatoria && props.activeConv"
        as="router-link"
        :to="detalleConvocatoriaTo"
        variant="ghost"
        size="lg"
        class="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white hover:text-black px-8 py-3 text-base lg:text-lg font-semibold backdrop-blur-md transition-all rounded-xl h-auto flex justify-center shadow-xl"
      >
        Ver detalles
      </Button>
    </div>

    <div class="absolute bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 lg:left-auto lg:right-16 lg:translate-x-0 flex gap-3 z-40">
      <button
        v-for="(slide, idx) in slides"
        :key="slide.id"
        @click="currentSlide = idx"
        class="w-2.5 h-2.5 rounded-full transition-all duration-500"
        :class="currentSlide === idx ? 'bg-secondary w-10' : 'bg-white/30 hover:bg-white/60'"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.2s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-fade-enter-active,
.slide-up-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}
.slide-up-fade-leave-to {
  opacity: 0;
  transform: translateY(-40px);
}
.slide-up-fade-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.expand-h-enter-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
  transform-origin: left center;
}
.expand-h-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
  transform-origin: left center;
}
.expand-h-enter-from {
  transform: scaleX(0);
  opacity: 0;
}
.expand-h-leave-to {
  transform: scaleX(0);
  opacity: 0;
}

.hero-description {
  max-height: 3.5rem;
  min-height: 3.5rem;
  overflow: hidden;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 70%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 0%, black 70%, transparent 100%);
}

.hero-description::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .hero-description {
    max-height: 3.75rem;
    min-height: 3.75rem;
  }
}
</style>