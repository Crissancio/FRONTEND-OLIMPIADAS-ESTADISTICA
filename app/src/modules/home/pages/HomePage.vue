<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  ArrowRight, BookOpen, AlertCircle,
  Download, Calendar, Users, Target, GraduationCap,
} from 'lucide-vue-next'
import { convocatoriasMock, avisosMock } from '@/modules/convocatorias/data/convocatorias.data'
import { usePublicStore } from '@/modules/public/stores/public.store'
import type { AvisoInicioDTO, CategoriaResumenDTO, ConvocatoriaResponseDTO } from '@/modules/public/types/public.api'
import { toApiError } from '@/app/api/api-error'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'

type HomeConvocatoria = {
  id: string
  nombre: string
  gestion: number
  estado: string
  descripcionBreve: string
  fechas: string
  categorias: { id: string; nombre: string }[]
}

type HomeAviso = {
  id: string
  titulo: string
  descripcion: string
  tipo: 'Importante' | 'Urgente' | 'Info'
  fecha: string
}

const inicioLoading = ref(false)
const inicioError = ref<string | null>(null)
const aficheUrl = ref<string | null>(null)
const convocatoriasData = ref<HomeConvocatoria[]>(convocatoriasMock)
const avisosData = ref<HomeAviso[]>(avisosMock)
const hasBackendConvocatoria = ref(false)
const inicioLoadedOk = ref(false)
const publicStore = usePublicStore()

const mapAvisoTipo = (tipo: string): HomeAviso['tipo'] => {
  const t = (tipo || '').toLowerCase()
  if (t.includes('urg')) return 'Urgente'
  if (t.includes('imp')) return 'Importante'
  return 'Info'
}

const formatFechas = (dto: ConvocatoriaResponseDTO): string => {
  const start = dto.inicio_olimpiadas
  const end = dto.fin_olimpiadas
  if (start || end) {
    return [start, end].filter(Boolean).join(' - ')
  }
  const i = dto.fecha_inicio_inscripcion
  const f = dto.fecha_fin_inscripcion
  if (i || f) {
    const iTxt = i ? new Date(i).toLocaleDateString() : ''
    const fTxt = f ? new Date(f).toLocaleDateString() : ''
    return [iTxt, fTxt].filter(Boolean).join(' - ')
  }
  return ''
}

const mapCategorias = (categorias: CategoriaResumenDTO[]): HomeConvocatoria['categorias'] => {
  return (categorias ?? []).map((c, index) => ({
    id: String(c.id_categoria ?? `${c.curso}-${index}`),
    nombre: c.nombre_categoria ?? c.nombre_convocatoria ?? `${c.curso} ${c.nivel}`,
  }))
}

const mapConvocatoria = (dto: ConvocatoriaResponseDTO, categorias: CategoriaResumenDTO[] = []): HomeConvocatoria => {
  return {
    id: String(dto.id_convocatoria),
    nombre: dto.nombre_convocatoria,
    gestion: dto.gestion,
    estado: dto.estado,
    descripcionBreve: dto.descripcion ?? '',
    fechas: formatFechas(dto),
    categorias: mapCategorias(categorias)
  }
}

const mapAviso = (dto: AvisoInicioDTO, index: number): HomeAviso => {
  const rawDate = dto.fecha_publicacion
  const dateText = rawDate ? new Date(rawDate).toLocaleDateString() : ''
  return {
    id: String(index),
    titulo: dto.titulo,
    descripcion: dto.descripcion,
    tipo: mapAvisoTipo(dto.tipo),
    fecha: dateText
  }
}

// --- Hero Carousel Logic ---
const activeConv = computed(() => {
  const list = convocatoriasData.value
  return list.find(c => c.estado === 'INSCRIPCION EN CURSO') || list.find(c => c.estado === 'ACTIVA') || list[0]
})

const showPreinscripcion = computed(() => {
  const estado = (activeConv.value?.estado as string) ?? ''
  return hasBackendConvocatoria.value && estado === 'INSCRIPCION EN CURSO'
})

const slides = computed(() => {
  const hasConv = hasBackendConvocatoria.value && !!activeConv.value
  return [
    {
      id: 1,
      image: '/inicio-1.jpg',
      isInfo: true,
      title: hasConv ? activeConv.value.nombre : 'Olimpiada Paceña de Estadística OPE',
      subtitle: hasConv ? `Gestión ${activeConv.value.gestion} - ${activeConv.value.estado}` : 'OPE',
      desc: hasConv ? activeConv.value.descripcionBreve : 'Fomentando el pensamiento lógico, matemático y analítico. Un espacio de excelencia académica para la juventud boliviana, organizado por la UMSA.',
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
    if (hasBackendConvocatoria.value && activeConv.value) return activeConv.value.descripcionBreve
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

const loadInicio = async () => {
  inicioLoading.value = true
  inicioError.value = null
  try {
    const dto = await publicStore.loadInicio()

    const conv = dto.convocatoria ? [mapConvocatoria(dto.convocatoria, dto.categorias)] : []
    hasBackendConvocatoria.value = conv.length > 0
    inicioLoadedOk.value = true
    convocatoriasData.value = conv
    avisosData.value = dto.avisos?.length ? dto.avisos.map(mapAviso) : []
    aficheUrl.value = dto.material_principal?.enlace_acceso ?? null
  } catch (err) {
    // Preserve existing UI by falling back to mocks.
    inicioError.value = toApiError(err).message
    inicioLoadedOk.value = false
    hasBackendConvocatoria.value = false
    convocatoriasData.value = convocatoriasMock
    avisosData.value = avisosMock
  } finally {
    inicioLoading.value = false
  }
}

onMounted(() => {
  void loadInicio()
  startTypewriter()
  timer = setInterval(nextSlide, 15000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (typeInterval) clearInterval(typeInterval)
  if (delayTimeout) clearTimeout(delayTimeout)
})

// --- Avisos Carousel Logic ---
const avisosContainerRef = ref<HTMLElement | null>(null)
const focusedAviso = ref(0)

let isScrolling = false
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (isScrolling) return

  if (e.deltaY > 0 && focusedAviso.value < avisosData.value.length - 1) {
    focusedAviso.value++
    scrollToFocused()
  } else if (e.deltaY < 0 && focusedAviso.value > 0) {
    focusedAviso.value--
    scrollToFocused()
  }
}

const scrollToFocused = () => {
  isScrolling = true
  const container = avisosContainerRef.value
  if (!container) return
  const item = container.children[focusedAviso.value] as HTMLElement
  if (item) {
    const isVertical = window.innerWidth >= 1024
    if (isVertical) {
      container.scrollTo({ top: item.offsetTop - container.offsetTop, behavior: 'smooth' })
    } else {
      container.scrollTo({ left: item.offsetLeft - container.offsetLeft, behavior: 'smooth' })
    }
  }
  setTimeout(() => { isScrolling = false }, 500)
}

</script>

<template>
  <div class="w-full bg-background min-h-screen">
    
    <!-- Hero Section Completo con Carrusel y Avisos -->
    <section class="relative w-full h-screen min-h-[700px] flex flex-col lg:flex-row overflow-hidden bg-primary text-white border-b-[6px] border-accent">
      
      <!-- Fondo y Filtros -->
      <div class="absolute inset-0 z-0">
        <!-- Imágenes del Carrusel -->
        <transition-group name="fade" tag="div" class="w-full h-full relative bg-primary">
          <div v-for="(slide, idx) in slides" :key="slide.id" v-show="currentSlide === idx" class="absolute inset-0 w-full h-full">
            <img :src="slide.image" class="w-full h-full object-cover object-center" alt="Olimpiada Paceña de Estadística" />
          </div>
        </transition-group>
        
        <!-- Gradiente Azul 
             Mobile: Filtro azul completo y suave
             PC: Transición de izquierda a derecha (Izquierda: 0% opacidad hasta más a la derecha, Centro: degrade, Derecha: sólido primary)
        -->
        <div class="absolute inset-0 bg-primary/70 lg:bg-transparent lg:bg-gradient-to-r lg:from-transparent lg:from-30% lg:via-primary/90 lg:via-65% lg:to-primary lg:to-85%"></div>
      </div>

      <!-- Lado Izquierdo: Información Dinámica -->
      <div class="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-16 pt-24 pb-8 lg:py-0 w-full lg:w-4/5">
        
        <div class="min-h-[280px] lg:min-h-[340px] flex flex-col justify-end pb-6">
          <transition name="fade" mode="out-in">
            <div :key="currentSlide">
              
              <!-- Slide de Información Principal -->
              <template v-if="slides[currentSlide].isInfo">
                <div v-if="hasBackendConvocatoria && activeConv">
                  <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-semibold mb-6 border border-white/20 shadow-sm">
                    <span class="w-2.5 h-2.5 rounded-full bg-success animate-pulse" v-if="activeConv.estado === 'ACTIVA'" />
                    Gestión: {{ activeConv.gestion }} - {{ activeConv.estado }}
                  </div>
                  <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight drop-shadow-xl">
                    {{ activeConv.nombre }}
                  </h1>
                  <p class="text-lg md:text-xl text-white font-sans drop-shadow-md leading-relaxed min-h-[80px]">
                    {{ typedText }}<span class="animate-pulse opacity-70">|</span>
                  </p>
                </div>
                <div v-else>
                  <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight drop-shadow-xl">
                    Olimpiada Paceña de <br class="hidden md:block"/>Estadística OPE
                  </h1>
                  <p class="text-lg md:text-xl text-white font-sans drop-shadow-md leading-relaxed min-h-[80px]">
                    {{ typedText }}<span class="animate-pulse opacity-70">|</span>
                  </p>
                </div>
              </template>
              
              <!-- Resto de Slides (Análisis, Conocimiento, etc.) -->
              <template v-else>
                <h1 class="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight drop-shadow-xl">
                  {{ slides[currentSlide].title }}
                </h1>
                <p class="text-lg md:text-xl text-white font-sans drop-shadow-md leading-relaxed min-h-[80px]">
                  {{ typedText }}<span class="animate-pulse opacity-70">|</span>
                </p>
              </template>
              
            </div>
          </transition>
        </div>

        <!-- Botones de Acción (Siempre visibles y estáticos) -->
        <div class="flex flex-col sm:flex-row gap-4 relative z-20">
          <Button 
            v-if="showPreinscripcion"
            as="router-link" 
            to="/inscripcion" 
            variant="accent"
            size="lg"
            class="px-8 py-4 text-lg font-bold shadow-xl transition-all hover:scale-105 rounded-xl h-auto"
          >
            Ir a pre-inscripción
            <ArrowRight class="w-5 h-5 ml-2" />
          </Button>
          <Button 
            v-if="hasBackendConvocatoria && activeConv"
            as="router-link" 
            :to="`/convocatoria/${activeConv.id}`" 
            variant="ghost"
            size="lg"
            class="bg-transparent border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all rounded-xl h-auto"
          >
            Ver detalles
          </Button>
          <Button 
            v-if="!hasBackendConvocatoria"
            as="router-link" 
            to="/acerca" 
            variant="ghost"
            size="lg"
            class="bg-transparent border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all rounded-xl h-auto"
          >
            Acerca De
            <ArrowRight class="w-5 h-5 ml-2" />
          </Button>
        </div>
        
        <!-- Indicadores del Carrusel -->
        <div class="absolute bottom-8 left-6 lg:left-16 flex gap-3 z-10 hidden sm:flex">
          <button 
            v-for="(slide, idx) in slides" 
            :key="slide.id" 
            @click="currentSlide = idx" 
            class="w-3 h-3 rounded-full transition-all duration-300 shadow-sm"
            :class="currentSlide === idx ? 'bg-yellow-400 w-8' : 'bg-white/50 hover:bg-white/80'"
            aria-label="Ir a diapositiva"
          ></button>
        </div>
      </div>

      <!-- Lado Derecho (PC) / Abajo (Mobile): Avisos -->
      <div class="relative z-10 w-full lg:w-1/5 lg:min-w-[320px] bg-primary/20 lg:bg-transparent flex flex-col pt-8 pb-12 lg:py-24 pl-4 pr-4 lg:pl-8 lg:pr-6 border-t lg:border-t-0 lg:border-l border-white/10 lg:backdrop-blur-none backdrop-blur-sm">
        
        <div class="flex items-center gap-3 mb-6 shrink-0 px-2 lg:px-0">
          <AlertCircle class="w-7 h-7 text-yellow-400 drop-shadow-sm" />
          <h2 class="text-2xl font-heading font-bold text-white drop-shadow">Avisos</h2>
        </div>

        <!-- Contenedor con Scroll para Avisos -->
        <div 
          class="flex lg:flex-col gap-0 lg:-gap-2 overflow-hidden lg:h-[calc(100vh-250px)] pb-6 lg:pb-[70vh] px-4 lg:px-0 pt-4"
          @wheel.prevent="handleWheel"
          ref="avisosContainerRef"
        >
          <div v-if="inicioLoadedOk && avisosData.length === 0" class="rounded-2xl border border-white/20 bg-white/10 p-6 text-sm font-semibold text-white/80">
            Sin avisos por el momento.
          </div>
          <div 
            v-for="(aviso, i) in avisosData" 
            :key="aviso.id" 
            class="shrink-0 w-[300px] lg:w-full transition-all duration-500 origin-center cursor-pointer"
            :class="focusedAviso === i ? 'scale-100 opacity-100 z-10 drop-shadow-xl' : 'scale-75 opacity-40 hover:opacity-80'"
            @click="focusedAviso = i; scrollToFocused()"
          >
            <div class="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:bg-white/15 transition-colors h-full flex flex-col">
              <div :class="[
                'absolute left-0 top-0 bottom-0 w-1.5',
                aviso.tipo === 'Urgente' ? 'bg-danger' : 
                aviso.tipo === 'Importante' ? 'bg-warning' : 'bg-secondary'
              ]"></div>
              <div class="pl-3 flex-1">
                <div class="flex items-center justify-between mb-3">
                  <span :class="[
                    'text-xs font-bold uppercase tracking-widest',
                    aviso.tipo === 'Urgente' ? 'text-red-400' : 
                    aviso.tipo === 'Importante' ? 'text-yellow-400' : 'text-blue-300'
                  ]">
                    {{ aviso.tipo }}
                  </span>
                  <span class="text-xs text-white/60 font-medium">{{ aviso.fecha }}</span>
                </div>
                <h4 class="font-heading font-bold text-white mb-2 text-lg leading-tight">{{ aviso.titulo }}</h4>
                <p class="text-sm text-white/80 line-clamp-3 leading-relaxed">{{ aviso.descripcion }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenido Restante de la Página -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 gap-10">
      
      <!-- Detalle de Convocatoria Vigente (Reajustado a ocupar todo el ancho) -->
      <div v-if="hasBackendConvocatoria && activeConv" class="space-y-8 max-w-4xl mx-auto w-full">
        <div class="flex items-center gap-3 border-b border-gray-200 pb-4 justify-center md:justify-start">
          <BookOpen class="w-6 h-6 text-primary" />
          <h2 class="text-2xl font-heading font-bold text-text-main">Detalles de la Convocatoria</h2>
        </div>
        
        <Card class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <CardContent class="p-0">
            <div class="md:flex">
              <!-- Área de Descarga del Afiche -->
              <div class="md:w-1/3 bg-slate-50 relative flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200">
                <div class="w-full max-w-[200px] aspect-[3/4] bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center text-text-muted p-4 text-center rounded hover:border-primary transition-colors cursor-pointer group">
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
                        <span v-for="cat in activeConv.categorias" :key="cat.id" class="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 text-text-main px-2 py-1 rounded">
                          <CategorySymbol :name="cat.nombre" class="h-5 w-5 rounded text-[10px]" />
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
          <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-primary/20 transition-colors">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm">
              <Target class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-heading font-bold text-text-main mb-3">Pensamiento Lógico</h3>
            <p class="text-sm text-text-muted">Desarrollar habilidades críticas para la resolución de problemas mediante la aplicación de herramientas estadísticas y matemáticas.</p>
          </div>

          <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-primary/20 transition-colors">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm">
              <Users class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-heading font-bold text-text-main mb-3">Sana Competencia</h3>
            <p class="text-sm text-text-muted">Incentivar la participación de estudiantes de secundaria (1ro a 6to) de todos los sistemas educativos en un entorno académico riguroso.</p>
          </div>

          <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-primary/20 transition-colors">
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
