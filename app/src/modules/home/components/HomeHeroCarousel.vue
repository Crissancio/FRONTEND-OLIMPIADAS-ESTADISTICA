<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { HomeConvocatoria } from '../types/home.types'

const props = defineProps<{
  activeConv?: HomeConvocatoria
  hasBackendConvocatoria: boolean
  showPreinscripcion: boolean
}>()

const slides = computed(() => {
  const hasConv = props.hasBackendConvocatoria && !!props.activeConv
  return [
    {
      id: 1,
      image: '/inicio-1.jpg',
      isInfo: true,
      title: hasConv ? props.activeConv!.nombre : 'Olimpiada Paceña de Estadística OPE',
      subtitle: hasConv ? `Gestión ${props.activeConv!.gestion} - ${props.activeConv!.estado}` : 'OPE',
      desc: hasConv ? props.activeConv!.descripcionBreve : 'Fomentando el pensamiento lógico, matemático y analítico. Un espacio de excelencia académica para la juventud boliviana, organizado por la UMSA.',
    },
    {
      id: 2,
      image: '/inicio-2.jpg',
      isInfo: false,
      title: 'Análisis',
      desc: 'Desarrolla habilidades críticas para interpretar y modelar datos del mundo real, fomentando decisiones basadas en evidencia.',
    },
    {
      id: 3,
      image: '/inicio-3.jpg',
      isInfo: false,
      title: 'Conocimiento',
      desc: 'Fortalece tus bases matemáticas y estadísticas, accediendo a herramientas fundamentales para el avance científico y tecnológico.',
    },
    {
      id: 4,
      image: '/inicio-4.jpg',
      isInfo: false,
      title: 'Competencia',
      desc: 'Mide tus capacidades en un entorno de sano desafío, compartiendo y compitiendo con estudiantes de alto rendimiento de toda la región.',
    },
    {
      id: 5,
      image: '/inicio-5.jpg',
      isInfo: false,
      title: 'Excelencia',
      desc: 'Alcanza tu máximo potencial académico. La Olimpiada promueve el rigor, la disciplina y la excelencia en el estudio de la estadística.',
    }
  ]
})

const currentSlide = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const typedText = ref('')
let typeInterval: ReturnType<typeof setInterval> | null = null
let delayTimeout: ReturnType<typeof setTimeout> | null = null

const currentDescription = computed(() => {
  if (slides.value[currentSlide.value].isInfo) {
    if (props.hasBackendConvocatoria && props.activeConv) return props.activeConv.descripcionBreve
    return 'Fomentando el pensamiento lógico, matemático y analítico. Un espacio de excelencia académica para la juventud boliviana, organizado por la UMSA.'
  }
  return slides.value[currentSlide.value].desc
})

const startTypewriter = () => {
  if (typeInterval) clearInterval(typeInterval)
  if (delayTimeout) clearTimeout(delayTimeout)
  typedText.value = ''
  
  delayTimeout = setTimeout(() => {
    let i = 0
    const text = currentDescription.value
    typeInterval = setInterval(() => {
      if (i < text.length) {
        typedText.value += text.charAt(i)
        i++
      } else {
        if (typeInterval) clearInterval(typeInterval)
      }
    }, 20)
  }, 800)
}

watch(currentSlide, startTypewriter)

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

onMounted(() => {
  startTypewriter()
  timer = setInterval(nextSlide, 15000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (typeInterval) clearInterval(typeInterval)
  if (delayTimeout) clearTimeout(delayTimeout)
})
</script>

<template>
  <div class="absolute inset-0 z-0">
    <transition-group name="fade" tag="div" class="w-full h-full relative bg-primary">
      <div v-for="(slide, idx) in slides" :key="slide.id" v-show="currentSlide === idx" class="absolute inset-0 w-full h-full">
        <img :src="slide.image" class="w-full h-full object-cover object-center" alt="Olimpiada Paceña de Estadística" />
      </div>
    </transition-group>
    <div class="absolute inset-0 bg-primary/80 lg:bg-transparent lg:bg-gradient-to-r lg:from-transparent lg:from-30% lg:via-primary/90 lg:via-65% lg:to-primary lg:to-85%"></div>
  </div>

  <div class="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-16 pt-24 pb-16 lg:pb-0 lg:py-0 w-full lg:w-4/5">
    <div class="min-h-[280px] lg:min-h-[340px] flex flex-col justify-end pb-6">
      <transition name="fade" mode="out-in">
        <div :key="currentSlide">
          
          <template v-if="slides[currentSlide].isInfo">
            <div v-if="props.hasBackendConvocatoria && props.activeConv">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-semibold mb-6 border border-white/20 shadow-sm">
                <span class="w-2.5 h-2.5 rounded-full bg-success animate-pulse" v-if="props.activeConv.estado === 'ACTIVA'" />
                Gestión: {{ props.activeConv.gestion }} - {{ props.activeConv.estado }}
              </div>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 lg:mb-6 leading-tight drop-shadow-xl">
                {{ props.activeConv.nombre }}
              </h1>
              <p class="text-base sm:text-lg md:text-xl text-white font-sans drop-shadow-md leading-relaxed min-h-[80px]">
                {{ typedText }}<span class="animate-pulse opacity-70">|</span>
              </p>
            </div>
            <div v-else>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 lg:mb-6 leading-tight drop-shadow-xl">
                Olimpiada Paceña de <br class="hidden md:block"/>Estadística OPE
              </h1>
              <p class="text-base sm:text-lg md:text-xl text-white font-sans drop-shadow-md leading-relaxed min-h-[80px]">
                {{ typedText }}<span class="animate-pulse opacity-70">|</span>
              </p>
            </div>
          </template>
          
          <template v-else>
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 lg:mb-6 leading-tight drop-shadow-xl">
              {{ slides[currentSlide].title }}
            </h1>
            <p class="text-base sm:text-lg md:text-xl text-white font-sans drop-shadow-md leading-relaxed min-h-[80px]">
              {{ typedText }}<span class="animate-pulse opacity-70">|</span>
            </p>
          </template>
          
        </div>
      </transition>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 relative z-20">
      <Button 
        v-if="props.showPreinscripcion"
        as="router-link" 
        to="/inscripcion" 
        variant="accent"
        size="lg"
        class="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold shadow-xl transition-all hover:scale-105 rounded-xl h-auto flex justify-center"
      >
        Ir a pre-inscripción
        <ArrowRight class="w-5 h-5 ml-2" />
      </Button>
      <Button 
        v-if="props.hasBackendConvocatoria && props.activeConv"
        as="router-link" 
        :to="`/convocatoria/${props.activeConv.id}`" 
        variant="ghost"
        size="lg"
        class="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-black px-8 py-4 text-base sm:text-lg font-semibold backdrop-blur-sm transition-all rounded-xl h-auto flex justify-center"
      >
        Ver detalles
      </Button>
      <Button 
        v-if="!props.hasBackendConvocatoria"
        as="router-link" 
        to="/acerca" 
        variant="ghost"
        size="lg"
        class="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-black px-8 py-4 text-base sm:text-lg font-semibold backdrop-blur-sm transition-all rounded-xl h-auto flex justify-center"
      >
        Acerca De
        <ArrowRight class="w-5 h-5 ml-2" />
      </Button>
    </div>
    
    <div class="absolute bottom-4 lg:bottom-8 left-0 right-0 lg:left-16 lg:right-auto flex justify-center lg:justify-start gap-3 z-10">
      <button 
        v-for="(slide, idx) in slides" 
        :key="slide.id" 
        @click="currentSlide = idx" 
        class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 shadow-sm"
        :class="currentSlide === idx ? 'bg-yellow-400 w-6 sm:w-8' : 'bg-white/50 hover:bg-white/80'"
        aria-label="Ir a diapositiva"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>