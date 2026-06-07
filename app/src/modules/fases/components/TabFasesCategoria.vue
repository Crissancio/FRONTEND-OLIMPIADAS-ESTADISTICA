<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  CalendarDays, Trophy, BookOpen, Clock,
  ChevronDown, ChevronUp, Upload, Edit, Trash2, Plus, File, Eye,
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import FaseModal from '@/modules/fases/components/FaseModal.vue'
import MaterialModal from '@/modules/material/components/MaterialModal.vue'
import type { FaseFormData, FaseListItem } from '@/modules/fases/components/FaseModal.vue'
import type { NuevoMaterialForm } from '@/modules/material/components/MaterialModal.vue'
import { fasesService } from '@/modules/fases/services/fases.service'
import { materialesService } from '@/modules/material/services/material.service'
import type { FaseUnionDTO, FasePreparacionDTO, FasePruebaDTO, ModalidadFase } from '@/modules/fases/types/fases.api'
import type { MaterialDTO, TipoMaterialEnum } from '@/modules/material/types/material.api'

type FaseTipo = 'preparacion' | 'prueba'
type Modalidad = 'virtual' | 'presencial' | 'semipresencial'
type MaterialTipo = TipoMaterialEnum

interface MaterialItem {
  id: string
  nombre: string
  tipo: MaterialTipo
  idMaterial?: number
}

interface FaseItem {
  id: string
  nombre: string
  inicio: string
  fin: string
  descripcion: string
  tipo: FaseTipo
  modalidad: Modalidad
  criterioAprobacion: number | null
  lugarRealizacion: string
  faseAnteriorId: string
  materiales: MaterialItem[]
}

const props = defineProps<{
  categoriaId: number
}>()

const emit = defineEmits<{
  (e: 'error', msg: string): void
}>()

const fases = ref<FaseItem[]>([])
const isLoadingFases = ref(false)
const fasesError = ref('')
const expanded = ref<string[]>([])

const today = new Date()
today.setHours(0, 0, 0, 0)

const toDateInput = (value?: string | null) => value?.slice(0, 19) ?? ''
const toDateTime = (value: string) => {
  if (value.includes('T')) return value.length === 16 ? `${value}:00` : value
  return `${value}T00:00:00`
}
const toModalidad = (value: Modalidad): ModalidadFase => value.toUpperCase() as ModalidadFase
const fromModalidad = (value: string): Modalidad => value.toLowerCase() as Modalidad

const toFaseItem = (item: FaseUnionDTO): FaseItem => {
  const isPrueba = item.tipo_fase === 'PRUEBA'
  const prueba = isPrueba ? (item as FasePruebaDTO) : null
  const prep = !isPrueba ? (item as FasePreparacionDTO) : null
  return {
    id: String(item.id_fase),
    nombre: item.nombre_fase,
    inicio: toDateInput(isPrueba ? prueba!.fecha_realizacion : prep!.fecha_inicio),
    fin: toDateInput(isPrueba ? prueba!.fecha_realizacion : prep!.fecha_fin),
    descripcion: item.descripcion ?? '',
    tipo: isPrueba ? 'prueba' : 'preparacion',
    modalidad: fromModalidad(item.modalidad),
    criterioAprobacion: prueba?.criterio_aprobacion ?? null,
    lugarRealizacion: prueba?.lugar_realizacion ?? '',
    faseAnteriorId: prueba?.id_fase_anterior ? String(prueba.id_fase_anterior) : '',
    materiales: [],
  }
}

const loadFases = async () => {
  if (!Number.isFinite(props.categoriaId)) return
  isLoadingFases.value = true
  fasesError.value = ''
  try {
    const res = await fasesService.listarFasesPorCategoria(props.categoriaId, { page: 1, limit: 100 })
    fases.value = res.data.items.map(toFaseItem)
  } catch (err: any) {
    fases.value = []
    fasesError.value = 'No se pudieron cargar las fases.'
    emit('error', fasesError.value)
  } finally {
    isLoadingFases.value = false
  }
}

watch(() => props.categoriaId, loadFases, { immediate: true })

const toggleExpand = (id: string) => {
  expanded.value = expanded.value.includes(id)
    ? expanded.value.filter((item) => item !== id)
    : [...expanded.value, id]
}

const faseModalRef = ref<InstanceType<typeof FaseModal> | null>(null)
const isFaseModalOpen = ref(false)
const editingFaseId = ref<string | null>(null)

const faseListItems = computed<FaseListItem[]>(() =>
  fases.value.map((f) => ({ id: f.id, nombre: f.nombre, tipo: f.tipo })),
)

const openCreateFase = () => {
  editingFaseId.value = null
  faseModalRef.value?.reset()
  isFaseModalOpen.value = true
}

const openEditFase = (fase: FaseItem) => {
  editingFaseId.value = fase.id
  faseModalRef.value?.reset({
    nombre: fase.nombre,
    inicio: fase.inicio,
    fin: fase.fin,
    descripcion: fase.descripcion,
    tipo: fase.tipo,
    modalidad: fase.modalidad,
    criterioAprobacion: fase.criterioAprobacion ?? 51,
    lugarRealizacion: fase.lugarRealizacion,
    faseAnteriorId: fase.faseAnteriorId,
  })
  isFaseModalOpen.value = true
}

const saveFase = async (form: FaseFormData) => {
  try {
    const base = {
      id_categoria_fk: props.categoriaId,
      nombre_fase: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      modalidad: toModalidad(form.modalidad),
    }
    if (!editingFaseId.value) {
      if (form.tipo === 'preparacion') {
        const res = await fasesService.crearFasePreparacion({
          ...base,
          fecha_inicio: toDateTime(form.inicio),
          fecha_fin: toDateTime(form.fin),
        })
        fases.value = [toFaseItem(res.data), ...fases.value]
      } else {
        const res = await fasesService.crearFasePrueba({
          ...base,
          id_fase_anterior: form.faseAnteriorId ? Number(form.faseAnteriorId) : null,
          criterio_aprobacion: Number(form.criterioAprobacion),
          fecha_realizacion: toDateTime(form.inicio),
          lugar_realizacion: form.lugarRealizacion.trim() || null,
        })
        fases.value = [toFaseItem(res.data), ...fases.value]
      }
    } else {
      if (form.tipo === 'preparacion') {
        const res = await fasesService.actualizarFasePreparacion(Number(editingFaseId.value), {
          ...base,
          fecha_inicio: toDateTime(form.inicio),
          fecha_fin: toDateTime(form.fin),
        })
        fases.value = fases.value.map((item) =>
          item.id !== editingFaseId.value ? item : { ...toFaseItem(res.data), materiales: item.materiales },
        )
      } else {
        const res = await fasesService.actualizarFasePrueba(Number(editingFaseId.value), {
          ...base,
          criterio_aprobacion: Number(form.criterioAprobacion),
          fecha_realizacion: toDateTime(form.inicio),
          lugar_realizacion: form.lugarRealizacion.trim() || null,
          id_fase_anterior: form.faseAnteriorId ? Number(form.faseAnteriorId) : null,
        })
        fases.value = fases.value.map((item) =>
          item.id !== editingFaseId.value ? item : { ...toFaseItem(res.data), materiales: item.materiales },
        )
      }
    }
    isFaseModalOpen.value = false
  } catch (err: any) {
    emit('error', 'No se pudo guardar la fase.')
  }
}

const removeFase = async (id: string) => {
  try {
    await fasesService.eliminarFaseFisica(Number(id))
    fases.value = fases.value.filter((item) => item.id !== id)
  } catch {
    emit('error', 'No se pudo eliminar la fase.')
  }
}

const materialModalRef = ref<InstanceType<typeof MaterialModal> | null>(null)
const isMaterialModalOpen = ref(false)
const selectedFaseId = ref<string>('')
const existingMaterials = ref<MaterialDTO[]>([])

const openMaterialModal = async (faseId: string) => {
  selectedFaseId.value = faseId
  materialModalRef.value?.reset()
  try {
    const res = await materialesService.obtenerPorFase(Number(faseId))
    existingMaterials.value = res.data
  } catch {
    existingMaterials.value = []
  }
  isMaterialModalOpen.value = true
}

const saveMaterialNuevo = async (form: NuevoMaterialForm) => {
  if (!selectedFaseId.value) return
  try {
    const res = await materialesService.crearMaterialExterno({
      nombre_material: form.nombre,
      tipo_material: form.tipo,
      enlace_acceso: form.enlace,
    })
    await materialesService.ligarFase(res.data.id_material, Number(selectedFaseId.value))
    const fase = fases.value.find((item) => item.id === selectedFaseId.value)
    if (fase) {
      fase.materiales.push({
        id: `mat-${res.data.id_material}`,
        nombre: res.data.nombre_material,
        tipo: res.data.tipo_material,
        idMaterial: res.data.id_material,
      })
    }
    isMaterialModalOpen.value = false
  } catch {
    emit('error', 'No se pudo guardar el material.')
  }
}

const saveMaterialExistente = async (ids: number[]) => {
  if (!selectedFaseId.value) return
  try {
    await Promise.all(ids.map((id) => materialesService.ligarFase(id, Number(selectedFaseId.value))))
    const fase = fases.value.find((item) => item.id === selectedFaseId.value)
    if (fase) {
      const toAdd = existingMaterials.value
        .filter((m) => ids.includes(m.id_material))
        .map((m) => ({
          id: `mat-${m.id_material}`,
          nombre: m.nombre_material,
          tipo: m.tipo_material,
          idMaterial: m.id_material,
        }))
      fase.materiales.push(...toAdd)
    }
    isMaterialModalOpen.value = false
  } catch {
    emit('error', 'No se pudo vincular el material.')
  }
}

const removeMaterial = async (faseId: string, materialId: string, idMaterial?: number) => {
  try {
    if (idMaterial) await materialesService.desligarFase(idMaterial, Number(faseId))
    const fase = fases.value.find((item) => item.id === faseId)
    if (fase) fase.materiales = fase.materiales.filter((item) => item.id !== materialId)
  } catch {
    emit('error', 'No se pudo eliminar el material.')
  }
}

const faseTypeClass = (type: FaseTipo) =>
  type === 'prueba'
    ? 'bg-error/10 text-error border-error/20'
    : 'bg-secondary/10 text-secondary border-secondary/20'

const materialTypeClass = (type: MaterialTipo) => {
  if (type === 'VIDEO_EXTERNO') return 'bg-error/10 text-error border-error/20'
  if (type === 'DOCUMENTO' || type === 'DOCUMENTO_EXTERNO') return 'bg-success/10 text-success border-success/20'
  if (type === 'EJERCICIOS') return 'bg-warning/10 text-warning border-warning/20'
  if (type === 'PAGINA_EXTERNA') return 'bg-info/10 text-info border-info/20'
  if (type === 'EXAMEN') return 'bg-secondary/10 text-secondary border-secondary/20'
  if (type === 'SOLUCIONARIO') return 'bg-success/10 text-success border-success/20'
  return 'bg-gray-100 text-text-muted border-gray-200'
}
</script>

<template>
  <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white">
    <CardHeader class="border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center gap-2">
            <CalendarDays class="h-5 w-5 text-accent" />Fases de la Categoría
          </CardTitle>
          <p class="mt-1 text-sm text-text-muted">Administra cronograma y materiales.</p>
        </div>
        <Button variant="accent" class="flex items-center gap-2" @click="openCreateFase">
          <Plus class="h-4 w-4" />Nueva Fase
        </Button>
      </div>
    </CardHeader>

    <CardContent class="space-y-3 p-6">
      <div v-if="isLoadingFases" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted">
        Cargando fases...
      </div>
      <div v-else-if="fasesError" class="rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
        {{ fasesError }}
      </div>
      <div v-else-if="fases.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-sm text-text-muted">
        Sin fases registradas
      </div>

      <div
        v-for="fase in fases"
        :key="fase.id"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-accent/40"
      >
        <div class="p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-xl"
                :class="fase.tipo === 'prueba' ? 'bg-linear-to-br from-accent to-accent-dark' : 'bg-linear-to-br from-secondary to-[#0090B0]'"
              >
                <Trophy v-if="fase.tipo === 'prueba'" class="h-5 w-5 text-white" />
                <BookOpen v-else class="h-5 w-5 text-white" />
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-bold text-text-main">{{ fase.nombre }}</p>
                  <Badge variant="outline" :class="`border px-2 py-0.5 ${faseTypeClass(fase.tipo)}`">
                    {{ fase.tipo === 'prueba' ? 'Prueba' : 'Preparación' }}
                  </Badge>
                  <Badge variant="outline" class="border-info/20 bg-info/10 text-info px-2 py-0.5">
                    {{ fase.modalidad }}
                  </Badge>
                </div>
                <p class="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <Clock class="h-4 w-4 text-text-muted" />{{ fase.inicio }} → {{ fase.fin }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" class="text-text-muted hover:bg-gray-100" @click="toggleExpand(fase.id)">
                <ChevronUp v-if="expanded.includes(fase.id)" class="h-5 w-5" />
                <ChevronDown v-else class="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" class="flex items-center gap-1.5 hover:border-accent/40 hover:bg-accent/10" @click="openMaterialModal(fase.id)">
                <Upload class="h-4 w-4" />Material
              </Button>
              <Button variant="outline" size="sm" class="text-text-muted" @click="openEditFase(fase)">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" class="text-error hover:bg-error/10" @click="removeFase(fase.id)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div v-if="expanded.includes(fase.id)" class="border-t border-gray-200 bg-gray-50 p-4">
          <p class="text-sm text-text-muted">{{ fase.descripcion }}</p>
          <div
            v-if="fase.tipo === 'prueba'"
            class="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-accent/20 bg-accent/10 p-3 text-sm sm:grid-cols-3"
          >
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-accent-dark">Criterio</p>
              <p class="font-semibold text-text-main">{{ fase.criterioAprobacion ?? 'Sin definir' }}</p>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-accent-dark">Lugar</p>
              <p class="font-semibold text-text-main">{{ fase.lugarRealizacion || 'Sin definir' }}</p>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-accent-dark">Fase anterior</p>
              <p class="font-semibold text-text-main">{{ fase.faseAnteriorId || 'Ninguna' }}</p>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <p class="text-sm font-bold text-text-main">Materiales de Estudio</p>
            <div
              v-if="fase.materiales.length === 0"
              class="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center text-sm text-text-muted"
            >
              Sin materiales adjuntos
            </div>
            <div
              v-for="material in fase.materiales"
              :key="material.id"
              class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div class="flex items-center gap-2">
                <File class="h-4 w-4 text-text-muted" />
                <p class="text-sm font-bold text-text-main">{{ material.nombre }}</p>
                <Badge variant="outline" :class="`border capitalize px-2 py-0.5 ${materialTypeClass(material.tipo)}`">
                  {{ material.tipo }}
                </Badge>
              </div>
              <div class="flex items-center gap-1">
                <Button variant="ghost" size="sm" class="text-text-muted hover:text-primary">
                  <Eye class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-error hover:bg-error/10"
                  @click="removeMaterial(fase.id, material.id, material.idMaterial)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <FaseModal
    ref="faseModalRef"
    :open="isFaseModalOpen"
    :editing-fase-id="editingFaseId"
    :fases="faseListItems"
    :today="today"
    @close="isFaseModalOpen = false"
    @save="saveFase"
  />

  <MaterialModal
    ref="materialModalRef"
    :open="isMaterialModalOpen"
    :existing-materials="existingMaterials"
    @close="isMaterialModalOpen = false"
    @save-nuevo="saveMaterialNuevo"
    @save-existentes="saveMaterialExistente"
  />
</template>