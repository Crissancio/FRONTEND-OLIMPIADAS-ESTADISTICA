<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowRight, AlertCircle } from 'lucide-vue-next'
import { publicService } from '@/modules/public/services/public.service'
import type { 
  CategoriaDetalleDTO, 
  ConvocatoriaDetalleDTO, 
  FasePublicaUnionDTO, 
  MaterialPublicoRelacionDTO 
} from '@/modules/public/types/public.api'
import Button from '@/shared/components/ui/atoms/Button.vue'

// Componentes extraídos
import DetalleConvocatoriaHeader from '../components/DetalleConvocatoriaHeader.vue'
import DetalleConvocatoriaCategorias from '../components/DetalleConvocatoriaCategorias.vue'
import DetalleConvocatoriaMateriales from '../components/DetalleConvocatoriaMateriales.vue'
import DetalleConvocatoriaSidebar from '../components/DetalleConvocatoriaSidebar.vue'

const route = useRoute()
const detalle = ref<ConvocatoriaDetalleDTO | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)

// Datos anidados resueltos por ID
const fasesByCategoria = ref<Record<string, FasePublicaUnionDTO[]>>({})
const materialesByFase = ref<Record<string, MaterialPublicoRelacionDTO[]>>({})
const materialGeneralList = ref<MaterialPublicoRelacionDTO[]>([])

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : ''
const formatRange = (start?: string | null, end?: string | null) => [formatDate(start), formatDate(end)].filter(Boolean).join(' - ')
const categoriaId = (cat: CategoriaDetalleDTO, index: number) => String(cat.id_categoria ?? `${cat.curso}-${index}`)
const categoriaNombre = (cat: CategoriaDetalleDTO) => cat.nombre_categoria ?? `${cat.curso} ${cat.nivel}`

const mapMaterial = (mat: MaterialPublicoRelacionDTO, index: number) => ({
  id: String(index),
  nombre: mat.nombre_material,
  url: mat.enlace_acceso,
  tipo: mat.tipo_material === 'VIDEO_EXTERNO' ? 'Video' : mat.tipo_material.includes('DOCUMENTO') ? 'Documento' : 'PDF',
  tamano: '',
})

const mapFase = (fase: FasePublicaUnionDTO) => ({
  id: String(fase.id_fase),
  nombre: fase.nombre_fase,
  descripcion: fase.descripcion ?? 'Sin descripcion registrada.',
  tipo: fase.tipo_fase === 'PRUEBA' ? 'Prueba' : 'Preparación',
  subtipo: '',
  fechas: fase.tipo_fase === 'PRUEBA' ? formatDate(fase.fecha_realizacion) : formatRange(fase.fecha_inicio, fase.fecha_fin),
  modalidad: fase.modalidad ? fase.modalidad.charAt(0) + fase.modalidad.slice(1).toLowerCase() : '',
  materiales: (materialesByFase.value[String(fase.id_fase)] ?? []).map((m, i) => mapMaterial(m, i)),
})

const conv = computed(() => {
  if (!detalle.value) return null
  const dto = detalle.value

  return {
    id: String(dto.id_convocatoria),
    nombre: dto.nombre_convocatoria,
    gestion: dto.gestion,
    estado: dto.estado_temporal,
    descripcionBreve: dto.descripcion ?? '',
    categorias: (dto.categorias || []).map((cat, index) => {
      const id = categoriaId(cat, index)
      return {
        id,
        nombre: categoriaNombre(cat),
        fases: (cat.id_categoria ? fasesByCategoria.value[String(cat.id_categoria)] ?? [] : []).map(mapFase)
      }
    }),
    materialGeneral: (materialGeneralList.value || []).map((m, i) => mapMaterial(m, i)),
  }
})

const aficheUrl = computed(() => detalle.value?.material_principal?.afiche?.enlace_acceso ?? null)
const convocatoriaDocumentoUrl = computed(() => detalle.value?.material_principal?.convocatoria?.enlace_acceso ?? null)
const reglamentoUrl = computed(() => detalle.value?.material_principal?.reglamento?.enlace_acceso ?? null)
const primaryVisualUrl = computed(() => aficheUrl.value ?? convocatoriaDocumentoUrl.value)
const primaryVisualLabel = computed(() => aficheUrl.value ? 'Afiche oficial' : convocatoriaDocumentoUrl.value ? 'Convocatoria oficial' : 'Sin afiche/convocatoria')
const showInscripcion = computed(() => conv.value?.estado === 'INSCRIPCION EN CURSO')

const loadDetalle = async () => {
  const id = Number(route.params.id)
  if (!Number.isFinite(id)) return
  
  isLoading.value = true
  loadError.value = null
  
  try {
    const resConv = await publicService.obtenerConvocatoriaDetalle(id)
    const data = resConv.data
    detalle.value = data

    // Cargar material general de la convocatoria
    const resMatGeneral = await publicService.obtenerMaterialesPorConvocatoria(id)
    materialGeneralList.value = resMatGeneral.data

    // Cargar fases para cada categoría
    const catsWithId = data.categorias?.filter((cat) => cat.id_categoria != null) || []
    const faseEntries = await Promise.all(catsWithId.map(async (cat) => {
      const res = await publicService.obtenerFasesPorCategoria(cat.id_categoria)
      return [String(cat.id_categoria), res.data] as const
    }))
    fasesByCategoria.value = Object.fromEntries(faseEntries)

    // Cargar materiales para cada fase
    const fases = faseEntries.flatMap(([, items]) => items)
    const materialEntries = await Promise.all(fases.map(async (fase) => {
      const res = await publicService.obtenerMaterialesPorFase(fase.id_fase)
      return [String(fase.id_fase), res.data] as const
    }))
    materialesByFase.value = Object.fromEntries(materialEntries)

  } catch (err: any) {
    loadError.value = err?.message || 'No se pudo cargar la convocatoria.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadDetalle()
})
</script>

<template>
  <div class="bg-gray-50 w-full min-h-screen">
    
    <DetalleConvocatoriaHeader 
      v-if="conv"
      :convocatoria="conv"
      :show-inscripcion="showInscripcion"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20 pb-20">
      <template v-if="!conv">
        <div class="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
          <AlertCircle class="w-16 h-16 text-text-muted mb-6" />
          <h1 class="text-3xl font-heading font-bold text-text-main mb-4">{{ isLoading ? 'Cargando convocatoria' : 'Convocatoria no encontrada' }}</h1>
          <p class="text-lg text-text-muted mb-8 max-w-md text-center">{{ isLoading ? 'Consultando datos oficiales.' : 'La convocatoria que buscas no existe o ha sido eliminada del sistema.' }}</p>
          <Button 
            as="router-link"
            to="/convocatorias"
            size="lg"
            class="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg font-semibold transition-all shadow-md h-auto"
          >
            <ArrowRight class="w-5 h-5 rotate-180" />
            Volver a Convocatorias
          </Button>
        </div>
      </template>

      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 space-y-8">
            <DetalleConvocatoriaCategorias :categorias="conv.categorias" />
            <DetalleConvocatoriaMateriales 
              v-if="conv.materialGeneral && conv.materialGeneral.length > 0" 
              :materiales="conv.materialGeneral" 
            />
          </div>

          <div class="space-y-6">
            <DetalleConvocatoriaSidebar 
              :afiche-url="aficheUrl"
              :convocatoria-documento-url="convocatoriaDocumentoUrl"
              :reglamento-url="reglamentoUrl"
              :primary-visual-url="primaryVisualUrl"
              :primary-visual-label="primaryVisualLabel"
              :estado="conv.estado"
            />
          </div>
          
        </div>
      </template>
    </div>
  </div>
</template>