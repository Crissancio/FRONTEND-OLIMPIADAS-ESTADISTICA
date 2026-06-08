<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  Plus, Search, Filter, Edit, ExternalLink, Loader2,
  FileQuestion, BookOpenCheck, Calculator, Megaphone,
  Scale, ScrollText, FileText, FileArchive, Link as LinkIcon,
  Globe, Youtube
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { useMaterialAdminStore } from '@/modules/material/stores/materialAdmin.store'
import { materialesService } from '@/modules/material/services/material.service'
import type { MaterialDTO, TipoMaterialEnum, EstadoTemporalMaterial } from '@/modules/material/types/material.api'
import ModalCrearMaterial from '@/modules/material/components/ModalCrearMaterial.vue'
import ModalAdministrarMaterial from '@/modules/material/components/ModalAdministrarMaterial.vue'

const store = useMaterialAdminStore()

const materials = ref<MaterialDTO[]>([])
const isLoading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const totalItems = ref(0)

const scrollContainer = ref<HTMLElement | null>(null)
const observerTarget = ref<HTMLElement | null>(null)

const isCrearOpen = ref(false)
const isAdminOpen = ref(false)
const selectedMaterial = ref<MaterialDTO | null>(null)

let searchTimeout: ReturnType<typeof setTimeout>

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    resetAndFetch()
  }, 400)
}

const resetAndFetch = async () => {
  page.value = 1
  materials.value = []
  hasMore.value = true
  await fetchMaterials()
}

const fetchMaterials = async () => {
  if (isLoading.value || !hasMore.value) return
  isLoading.value = true
  try {
    const res = await materialesService.listarMateriales({
      page: page.value,
      limit: 20,
      busqueda: store.filters?.busqueda || null,
      tipo_material: store.filters?.tipo_material === 'all' ? null : (store.filters?.tipo_material as TipoMaterialEnum)
    })
    
    const items = res.data.items || []
    materials.value.push(...items)
    totalItems.value = res.data.meta?.total || 0
    
    if (items.length < 20) {
      hasMore.value = false
    } else {
      page.value++
    }
  } catch (error) {
    console.error('Error cargando materiales:', error)
  } finally {
    isLoading.value = false
  }
}

let observer: IntersectionObserver

onMounted(() => {
  if (!store.filters) {
    store.filters = { busqueda: '', tipo_material: 'all' }
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchMaterials()
    }
  }, { root: scrollContainer.value, rootMargin: '200px' })

  if (observerTarget.value) {
    observer.observe(observerTarget.value)
  }

  if (store.scrollPosition && scrollContainer.value) {
    setTimeout(() => {
      if (scrollContainer.value) scrollContainer.value.scrollTop = store.scrollPosition
    }, 100)
  }
})

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  store.scrollPosition = target.scrollTop
}

const getTipoConfig = (tipo: TipoMaterialEnum) => {
  const icons: Record<string, any> = {
    EXAMEN: FileQuestion, SOLUCIONARIO: BookOpenCheck, EJERCICIOS: Calculator,
    CONVOCATORIA: Megaphone, REGLAMENTO: Scale, AFICHE: ScrollText,
    DOCUMENTO: FileText, OTRO: FileArchive,
    DOCUMENTO_EXTERNO: LinkIcon, ARCHIVO_EXTERNO: ExternalLink, PAGINA_EXTERNA: Globe, VIDEO_EXTERNO: Youtube
  }
  
  const icon = icons[tipo] || FileText
  
  if (['EXAMEN', 'SOLUCIONARIO', 'EJERCICIOS'].includes(tipo)) {
    return { style: 'background-color: var(--color-material-academico-soft); color: var(--color-material-academico-text); border-color: var(--color-material-academico-border);', icon }
  }
  if (['CONVOCATORIA', 'REGLAMENTO', 'AFICHE'].includes(tipo)) {
    return { style: 'background-color: var(--color-material-institucional-soft); color: var(--color-material-institucional-text); border-color: var(--color-material-institucional-border);', icon }
  }
  if (['DOCUMENTO', 'OTRO'].includes(tipo)) {
    return { style: 'background-color: var(--color-material-documento-soft); color: var(--color-material-documento-text); border-color: var(--color-material-documento-border);', icon }
  }
  return { style: 'background-color: var(--color-material-externo-soft); color: var(--color-material-externo-text); border-color: var(--color-material-externo-border);', icon }
}

const getEstadoTemporalStyle = (estado: EstadoTemporalMaterial) => {
  switch (estado) {
    case 'BORRADOR': 
      return 'background-color: var(--color-material-borrador-soft); color: var(--color-material-borrador-text); border-color: var(--color-material-borrador-border);'
    case 'VISIBLE': 
      return 'background-color: var(--color-material-visible-soft); color: var(--color-material-visible-text); border-color: var(--color-material-visible-border);'
    case 'NO_VISIBLE': 
      return 'background-color: var(--color-material-no-visible-soft); color: var(--color-material-no-visible-text); border-color: var(--color-material-no-visible-border);'
    case 'OCULTO': 
      return 'background-color: var(--color-material-oculto-soft); color: var(--color-material-oculto-text); border-color: var(--color-material-oculto-border);'
    default: 
      return 'background-color: #F3F4F6; color: #374151; border-color: #D1D5DB;'
  }
}

const getEstadoTemporalLabel = (estado: EstadoTemporalMaterial) => {
  if (!estado) return 'Desconocido'
  return estado.replace('_', ' ')
}

const openMaterialLink = (mat: MaterialDTO) => {
  if (mat.enlace_acceso) window.open(mat.enlace_acceso, '_blank', 'noopener,noreferrer')
}

const openAdminModal = (mat: MaterialDTO) => {
  selectedMaterial.value = mat
  isAdminOpen.value = true
}

const onMaterialSaved = () => {
  isCrearOpen.value = false
  isAdminOpen.value = false
  resetAndFetch()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-slate-800">Gestión de Material</h1>
        <p class="mt-1 text-sm text-slate-500">Administra recursos académicos e institucionales.</p>
      </div>
      <Button variant="accent" class="h-auto px-4 py-2.5 flex items-center gap-2" @click="isCrearOpen = true">
        <Plus class="h-4 w-4" />
        Añadir Material
      </Button>
    </div>

    <Card class="overflow-hidden border-gray-200 shadow-soft bg-white flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      <CardContent class="p-0 flex flex-col h-full">
        <div class="flex flex-col items-center gap-4 border-b border-gray-200 bg-gray-50/50 p-4 sm:flex-row shrink-0">
          <div class="relative w-full sm:w-80">
            <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
            <input
              v-model="store.filters.busqueda"
              type="text"
              class="h-auto w-full rounded-lg border-gray-300 bg-white py-2 pl-9 pr-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors shadow-sm"
              placeholder="Buscar material..."
              @input="handleSearch"
            />
          </div>
          
          <select 
            v-model="store.filters.tipo_material" 
            class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium sm:w-56 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-colors shadow-sm"
            @change="resetAndFetch"
          >
            <option value="all">Todos los tipos</option>
            <optgroup label="Académico">
              <option value="EXAMEN">Examen</option>
              <option value="SOLUCIONARIO">Solucionario</option>
              <option value="EJERCICIOS">Ejercicios</option>
            </optgroup>
            <optgroup label="Institucional">
              <option value="CONVOCATORIA">Convocatoria</option>
              <option value="REGLAMENTO">Reglamento</option>
              <option value="AFICHE">Afiche</option>
            </optgroup>
            <optgroup label="Documentación">
              <option value="DOCUMENTO">Documento general</option>
              <option value="OTRO">Otro</option>
            </optgroup>
            <optgroup label="Recursos externos">
              <option value="DOCUMENTO_EXTERNO">Documento externo</option>
              <option value="ARCHIVO_EXTERNO">Archivo externo</option>
              <option value="PAGINA_EXTERNA">Página externa</option>
              <option value="VIDEO_EXTERNO">Video externo</option>
            </optgroup>
          </select>
          
          <Button variant="outline" class="h-10 w-full justify-center gap-2 sm:w-auto shadow-sm">
            <Filter class="h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div class="flex-1 overflow-auto bg-white" ref="scrollContainer" @scroll="handleScroll">
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nombre y descripción</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tipo</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="mat in materials" :key="mat.id_material" class="group transition-colors hover:bg-slate-50/70">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-800">{{ mat.nombre_material }}</span>
                    <span class="mt-1 text-xs font-medium text-slate-500 line-clamp-2 max-w-md">{{ mat.descripcion || 'Sin descripción' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <Badge variant="outline" class="inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-extrabold shadow-sm" :style="getTipoConfig(mat.tipo_material).style">
                    <component :is="getTipoConfig(mat.tipo_material).icon" class="h-3.5 w-3.5" />
                    {{ mat.tipo_material }}
                  </Badge>
                </td>
                <td class="px-6 py-4">
                  <Badge variant="outline" class="border px-2.5 py-1 text-[11px] font-extrabold shadow-sm tracking-wide" :style="getEstadoTemporalStyle(mat.estado_temporal)">
                    {{ getEstadoTemporalLabel(mat.estado_temporal) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button variant="ghost" size="icon" class="text-slate-400 hover:bg-blue-50 hover:text-blue-600" @click="openMaterialLink(mat)">
                      <ExternalLink class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" class="text-slate-400 hover:bg-primary/10 hover:text-primary" @click="openAdminModal(mat)">
                      <Edit class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="isLoading" class="bg-white">
                <td colspan="4" class="px-6 py-8 text-center text-sm font-medium text-slate-500">
                  <Loader2 class="mx-auto h-6 w-6 animate-spin text-primary mb-2" />
                  Cargando materiales...
                </td>
              </tr>
              
              <tr v-else-if="materials.length === 0" class="bg-white">
                <td colspan="4" class="px-6 py-12 text-center text-sm font-medium text-slate-500">
                  <div class="flex flex-col items-center justify-center">
                    <FileText class="h-10 w-10 text-slate-300 mb-3" />
                    No se encontraron materiales con los filtros aplicados.
                  </div>
                </td>
              </tr>
              
              <tr ref="observerTarget" class="h-4"></tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 p-4 text-sm font-medium text-slate-500 shrink-0">
          <span>Mostrando {{ materials.length }} de {{ totalItems }} materiales</span>
        </div>
      </CardContent>
    </Card>

    <ModalCrearMaterial 
      :open="isCrearOpen" 
      @close="isCrearOpen = false" 
      @saved="onMaterialSaved" 
    />
    
    <ModalAdministrarMaterial 
      :open="isAdminOpen" 
      :material="selectedMaterial" 
      @close="isAdminOpen = false" 
      @updated="onMaterialSaved" 
    />
  </div>
</template>