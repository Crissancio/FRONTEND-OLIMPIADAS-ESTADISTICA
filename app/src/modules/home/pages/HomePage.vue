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

const inicioLoading = ref(false)
const inicioError = ref<string | null>(null)
const convocatoriasData = ref<HomeConvocatoria[]>([])
const avisosData = ref<HomeAviso[]>([])
const hasBackendConvocatoria = ref(false)
const inicioLoadedOk = ref(false)

// Estados para paginación de avisos locales
const avisosPage = ref(1)
const avisosLimit = 5
const avisosTotalPages = ref(1)
const loadingMoreAvisos = ref(false)

const ESTADOS_TEMPORALES: EstadoTemporal[] = [
  'BORRADOR',
  'OCULTA',
  'CANCELADA',
  'PROXIMA',
  'INSCRIPCIONES PROXIMAS',
  'INSCRIPCION EN CURSO',
  'EN CURSO',
  'FINALIZADA',
]

const TIPOS_AVISO: TipoAviso[] = [
  'CONVOCATORIA',
  'INSCRIPCION',
  'CRONOGRAMA',
  'MATERIAL',
  'EXAMEN',
  'LOGISTICA',
  'RESULTADO',
  'RECLAMO',
  'CEREMONIA',
  'CAPACITACION',
  'MANTENIMIENTO',
  'SOPORTE',
  'GENERAL',
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
  if (start || end) {
    return [start, end].filter(Boolean).join(' - ')
  }
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

const mapConvocatoria = (
  dto: ConvocatoriaDetalleDTO
): HomeConvocatoria => {
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

const mapAviso = (dto: AvisoPublicoDTO, index: number): HomeAviso => {
  return {
    id: String(index),
    titulo: dto.titulo,
    descripcion: dto.descripcion,
    tipo: normalizeAvisoTipo(dto.tipo),
    prioridad: normalizeAvisoPrioridad(dto.prioridad),
    fecha: ''
  }
}

const activeConv = computed(() => {
  const list = convocatoriasData.value
  return list.find(c => c.estado_temporal === 'INSCRIPCION EN CURSO') || list.find(c => c.estado_temporal === 'EN CURSO') || list[0]
})

const showPreinscripcion = computed(() => {
  return hasBackendConvocatoria.value && activeConv.value?.estado_temporal === 'INSCRIPCION EN CURSO'
})

const loadInicio = async () => {
  inicioLoading.value = true
  inicioError.value = null
  avisosPage.value = 1
  
  try {
    const [inicioResult, avisosResult] = await Promise.allSettled([
      publicService.obtenerInicio(),
      publicService.obtenerAvisos({ page: avisosPage.value, limit: avisosLimit }),
    ])

    // Manejar resultados de Avisos
    if (avisosResult.status === 'fulfilled' && avisosResult.value.data) {
      avisosData.value = avisosResult.value.data.items.map(mapAviso)
      avisosTotalPages.value = avisosResult.value.data.meta.total_pages
    } else {
      avisosData.value = []
      avisosTotalPages.value = 1
    }

    inicioLoadedOk.value = true

    // Manejar resultados de la Convocatoria de Inicio
    if (inicioResult.status !== 'fulfilled' || !inicioResult.value.data) {
      inicioError.value = inicioResult.status === 'rejected' 
        ? toApiError(inicioResult.reason).message 
        : 'No se encontraron datos de inicio.'
      hasBackendConvocatoria.value = false
      convocatoriasData.value = []
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }, 50)
      return
    }

    const dto = inicioResult.value.data
    const conv = dto ? [mapConvocatoria(dto)] : []

    hasBackendConvocatoria.value = conv.length > 0
    convocatoriasData.value = conv

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 50)

  } catch (err) {
    inicioError.value = toApiError(err).message
    inicioLoadedOk.value = false
    hasBackendConvocatoria.value = false
    convocatoriasData.value = []
    avisosData.value = []
  } finally {
    inicioLoading.value = false
  }
}

const loadMoreAvisos = async () => {
  if (loadingMoreAvisos.value || avisosPage.value >= avisosTotalPages.value) return
  
  loadingMoreAvisos.value = true
  avisosPage.value += 1
  
  try {
    const response = await publicService.obtenerAvisos({ page: avisosPage.value, limit: avisosLimit })
    
    if (response.data) {
      const newAvisos = response.data.items.map(mapAviso)
      avisosData.value = [...avisosData.value, ...newAvisos]
      avisosTotalPages.value = response.data.meta.total_pages
    }
  } catch (error) {
    console.error('No se pudieron cargar más avisos:', toApiError(error).message)
    avisosPage.value -= 1 // Revertir el incremento de página si hubo error
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
    
    <section class="relative w-full min-h-screen h-auto lg:h-screen flex flex-col lg:flex-row overflow-hidden bg-primary text-white border-b-[6px] border-accent">
      <HomeHeroCarousel 
        :activeConv="activeConv"
        :hasBackendConvocatoria="hasBackendConvocatoria"
        :showPreinscripcion="showPreinscripcion"
      />
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