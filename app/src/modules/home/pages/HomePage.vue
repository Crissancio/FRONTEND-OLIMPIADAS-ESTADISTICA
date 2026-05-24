<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { convocatoriasMock, avisosMock } from '@/modules/convocatorias/data/convocatorias.data'
import { usePublicStore } from '@/modules/public/stores/public.store'
import type { AvisoInicioDTO, CategoriaResumenDTO, ConvocatoriaResponseDTO } from '@/modules/public/types/public.api'
import { toApiError } from '@/app/api/api-error'
import type { HomeConvocatoria, HomeAviso } from '../types/home.types'

import HomeHeroCarousel from '../components/HomeHeroCarousel.vue'
import HomeAvisosList from '../components/HomeAvisosList.vue'
import HomeConvocatoriaDetail from '../components/HomeConvocatoriaDetail.vue'
import HomeInstitutional from '../components/HomeInstitutional.vue'

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

const activeConv = computed(() => {
  const list = convocatoriasData.value
  return list.find(c => c.estado === 'INSCRIPCION EN CURSO') || list.find(c => c.estado === 'ACTIVA') || list[0]
})

const showPreinscripcion = computed(() => {
  const estado = (activeConv.value?.estado as string) ?? ''
  return hasBackendConvocatoria.value && estado === 'INSCRIPCION EN CURSO'
})

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

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 50)

  } catch (err) {
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
      />
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 gap-10">
      <HomeConvocatoriaDetail 
        v-if="hasBackendConvocatoria && activeConv"
        :activeConv="activeConv"
      />
    </div>

    <HomeInstitutional />

  </div>
</template>