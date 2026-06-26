<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { publicService } from '@/modules/public/services/public.service'
import type { AvisoPublicoDTO, CategoriaInicioDTO, ConvocatoriaDetalleDTO } from '@/modules/public/types/public.api'
import type { AvisoPrioridad, TipoAviso } from '@/modules/avisos/types/avisos.api'
import type { EstadoTemporal } from '@/modules/convocatorias/types/convocatorias.api'
import { toApiError } from '@/app/api/api-error'
import type { HomeConvocatoria, HomeAviso } from '../types/home.types'

import HomeHeroCarousel from '../components/HomeHeroCarousel.vue'
import HomeAvisosList from '../components/HomeAvisosList.vue'
import HomeConvocatoriaDetail from '../components/HomeConvocatoriaDetail.vue'
import HomeInstitutional from '../components/HomeInstitutional.vue'
import HomePageLoader from '@/shared/components/ui/atoms/HomePageLoader.vue'

const inicioLoading = ref(true)
const inicioError = ref<string | null>(null)
const convocatoriasData = ref<HomeConvocatoria[]>([])
const avisosData = ref<HomeAviso[]>([])
const hasBackendConvocatoria = ref(false)
const inicioLoadedOk = ref(false)

const avisosPage = ref(1)
const avisosLimit = 5
const avisosTotalPages = ref(1)
const loadingMoreAvisos = ref(false)

const ESTADOS_TEMPORALES: EstadoTemporal[] = [
  'BORRADOR', 'OCULTA', 'CANCELADA', 'PROXIMA',
  'INSCRIPCIONES PROXIMAS', 'INSCRIPCION EN CURSO', 'EN CURSO', 'FINALIZADA',
]
const TIPOS_AVISO: TipoAviso[] = [
  'CONVOCATORIA', 'INSCRIPCION', 'CRONOGRAMA', 'MATERIAL', 'EXAMEN',
  'LOGISTICA', 'RESULTADO', 'RECLAMO', 'CEREMONIA', 'CAPACITACION',
  'MANTENIMIENTO', 'SOPORTE', 'GENERAL',
]
const PRIORIDADES_AVISO: AvisoPrioridad[] = ['BAJA', 'MEDIA', 'ALTA']

const normalizeEstadoTemporal = (estado?: string | null): EstadoTemporal => {
  const normalized = (estado || '').toUpperCase().trim() as EstadoTemporal
  return ESTADOS_TEMPORALES.includes(normalized) ? normalized : 'BORRADOR'
}
const normalizeAvisoTipo = (tipo?: string | null): TipoAviso => {
  const normalized = (tipo || '').toUpperCase().trim() as TipoAviso
  return TIPOS_AVISO.includes(normalized) ? normalized : 'GENERAL'
}
const normalizeAvisoPrioridad = (prioridad?: string | null): AvisoPrioridad => {
  const normalized = (prioridad || '').toUpperCase().trim() as AvisoPrioridad
  return PRIORIDADES_AVISO.includes(normalized) ? normalized : 'MEDIA'
}

const formatFechas = (dto: ConvocatoriaDetalleDTO): string => {
  const start = dto.inicio_olimpiadas
  const end = dto.fin_olimpiadas
  if (start || end) return [start, end].filter(Boolean).join(' - ')
  return ''
}
const mapCategorias = (categorias: CategoriaInicioDTO[]): HomeConvocatoria['categorias'] => {
  return (categorias ?? []).map((c, index) => ({
    id_categoria: index,
    nombre_categoria: c.nombre_categoria,
    curso: Number(c.curso),
    nivel: c.nivel
  }))
}
const mapConvocatoria = (dto: ConvocatoriaDetalleDTO): HomeConvocatoria => {
  const materiales = [
    { importancia_tipo: 'AFICHE', enlace_acceso: dto.material_principal?.afiche?.enlace_acceso ?? null },
    { importancia_tipo: 'CONVOCATORIA', enlace_acceso: dto.material_principal?.convocatoria?.enlace_acceso ?? null },
  ]
  return {
    id: String(dto.id_convocatoria),
    nombre: dto.nombre_convocatoria,
    gestion: dto.gestion,
    estado_temporal: normalizeEstadoTemporal(dto.estado_temporal),
    descripcionBreve: dto.descripcion ?? '',
    fechas: formatFechas(dto),
    categorias: mapCategorias(dto.categorias ?? []),
    inicio_olimpiadas: dto.inicio_olimpiadas ?? null,
    fin_olimpiadas: dto.fin_olimpiadas ?? null,
    fecha_inicio_inscripcion: dto.fecha_inicio_inscripcion ?? null,
    fecha_fin_inscripcion: dto.fecha_fin_inscripcion ?? null,
    material_principal: materiales
  }
}
const mapAviso = (dto: AvisoPublicoDTO, index: number): HomeAviso => ({
  id: String(index),
  titulo: dto.titulo,
  descripcion: dto.descripcion,
  tipo: normalizeAvisoTipo(dto.tipo),
  prioridad: normalizeAvisoPrioridad(dto.prioridad),
  fecha: ''
})

const activeConv = computed(() => {
  const list = convocatoriasData.value
  return list.find(c => c.estado_temporal === 'INSCRIPCION EN CURSO')
    || list.find(c => c.estado_temporal === 'EN CURSO')
    || list[0]
})
const showPreinscripcion = computed(() => {
  return hasBackendConvocatoria.value && activeConv.value?.estado_temporal === 'INSCRIPCION EN CURSO'
})

// Animación de peek del navbar: baja un poco la página para revelar el navbar y vuelve
const triggerNavbarPeek = () => {
  const navbarHeight = 120
  const duration = 600
  const pause = 800

  // Fase 1: bajar suavemente para mostrar el navbar
  const start = performance.now()
  const scrollDown = (now: number) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress
    window.scrollTo(0, ease * navbarHeight)
    if (progress < 1) requestAnimationFrame(scrollDown)
    else {
      // Fase 2: pausa para que el usuario vea el navbar
      setTimeout(() => {
        // Fase 3: volver al inicio
        const start2 = performance.now()
        const scrollUp = (now2: number) => {
          const elapsed2 = now2 - start2
          const progress2 = Math.min(elapsed2 / duration, 1)
          const ease2 = progress2 < 0.5
            ? 2 * progress2 * progress2
            : -1 + (4 - 2 * progress2) * progress2
          window.scrollTo(0, navbarHeight * (1 - ease2))
          if (progress2 < 1) requestAnimationFrame(scrollUp)
        }
        requestAnimationFrame(scrollUp)
      }, pause)
    }
  }
  requestAnimationFrame(scrollDown)
}

const loadInicio = async () => {
  inicioLoading.value = true
  inicioError.value = null
  avisosPage.value = 1

  try {
    const [inicioResult, avisosResult] = await Promise.allSettled([
      publicService.obtenerInicio(),
      publicService.obtenerAvisos({ page: avisosPage.value, limit: avisosLimit }),
    ])

    if (avisosResult.status === 'fulfilled' && avisosResult.value.data) {
      avisosData.value = avisosResult.value.data.items.map(mapAviso)
      avisosTotalPages.value = avisosResult.value.data.meta.total_pages
    } else {
      avisosData.value = []
      avisosTotalPages.value = 1
    }

    inicioLoadedOk.value = true

    if (inicioResult.status !== 'fulfilled' || !inicioResult.value.data) {
      inicioError.value = inicioResult.status === 'rejected'
        ? toApiError(inicioResult.reason).message
        : 'No se encontraron datos de inicio.'
      hasBackendConvocatoria.value = false
      convocatoriasData.value = []
    } else {
      const dto = inicioResult.value.data
      const conv = dto ? [mapConvocatoria(dto)] : []
      hasBackendConvocatoria.value = conv.length > 0
      convocatoriasData.value = conv
    }

    window.scrollTo({ top: 0, behavior: 'instant' })

  } catch (err) {
    inicioError.value = toApiError(err).message
    inicioLoadedOk.value = false
    hasBackendConvocatoria.value = false
    convocatoriasData.value = []
    avisosData.value = []
  } finally {
    inicioLoading.value = false
    // Lanzar el peek del navbar 800ms después de que el contenido sea visible
    setTimeout(triggerNavbarPeek, 800)
  }
}

const loadMoreAvisos = async () => {
  if (loadingMoreAvisos.value || avisosPage.value >= avisosTotalPages.value) return
  loadingMoreAvisos.value = true
  avisosPage.value += 1
  try {
    const response = await publicService.obtenerAvisos({ page: avisosPage.value, limit: avisosLimit })
    if (response.data) {
      avisosData.value = [...avisosData.value, ...response.data.items.map(mapAviso)]
      avisosTotalPages.value = response.data.meta.total_pages
    }
  } catch (error) {
    console.error('No se pudieron cargar más avisos:', toApiError(error).message)
    avisosPage.value -= 1
  } finally {
    loadingMoreAvisos.value = false
  }
}

onMounted(() => {
  void loadInicio()
})
</script>

<template>
  <div class="w-full bg-background min-h-screen">

    <Transition name="loader-fade">
      <HomePageLoader v-if="inicioLoading" />
    </Transition>

    <section class="relative w-full h-svh flex flex-col lg:flex-row overflow-hidden bg-primary text-white border-b-[6px] border-accent">
      <HomeHeroCarousel
        :activeConv="activeConv"
        :hasBackendConvocatoria="hasBackendConvocatoria"
        :showPreinscripcion="showPreinscripcion"
      />
      <HomeAvisosList
        class="hidden lg:flex"
        :avisosData="avisosData"
        :inicioLoadedOk="inicioLoadedOk"
        @load-more="loadMoreAvisos"
      />
    </section>

    <section class="lg:hidden bg-primary border-b-[6px] border-accent">
      <HomeAvisosList
        :avisosData="avisosData"
        :inicioLoadedOk="inicioLoadedOk"
        @load-more="loadMoreAvisos"
      />
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20 grid grid-cols-1 gap-10">
      <HomeConvocatoriaDetail
        v-if="hasBackendConvocatoria && activeConv"
        :activeConv="activeConv"
      />
    </div>

    <HomeInstitutional />
  </div>
</template>

<style scoped>
.loader-fade-enter-active { transition: opacity 0.3s ease; }
.loader-fade-leave-active { transition: opacity 0.5s ease; }
.loader-fade-enter-from, .loader-fade-leave-to { opacity: 0; }
</style>