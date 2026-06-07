<script setup lang="ts">
import { ref, watch } from 'vue'
import { CalendarDays, Plus, AlertCircle, X } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

import FaseCard from '@/modules/fases/components/FaseCard.vue'
import DeleteFaseModal from '@/modules/fases/components/DeleteFaseModal.vue'
import FaseModal from '@/modules/fases/components/FaseModal.vue'
import MaterialModal from '@/modules/material/components/MaterialModal.vue'
import type { NuevoMaterialForm } from '@/modules/material/components/MaterialModal.vue'

import { fasesService } from '@/modules/fases/services/fases.service'
import { materialesService } from '@/modules/material/services/material.service'
import type { FaseUnionDTO, FasePreparacionDTO, FasePruebaDTO, ModalidadFase } from '@/modules/fases/types/fases.api'
import type { MaterialDTO, TipoMaterialEnum } from '@/modules/material/types/material.api'

type FaseTipo = 'preparacion' | 'prueba'
type Modalidad = 'virtual' | 'presencial' | 'semipresencial'
type MaterialTipo = TipoMaterialEnum

export interface MaterialItem {
  id: string
  nombre: string
  tipo: MaterialTipo
  idMaterial?: number
}

export interface FaseItem {
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

const fasesRaw = ref<FaseUnionDTO[]>([])
const fases = ref<FaseItem[]>([])
const isLoadingFases = ref(false)
const errorMessage = ref('')

const showDeleteModal = ref(false)
const isDeletingFase = ref(false)
const faseToDelete = ref<string | null>(null)

const faseModalRef = ref<InstanceType<typeof FaseModal> | null>(null)
const materialModalRef = ref<InstanceType<typeof MaterialModal> | null>(null)

const isMaterialModalOpen = ref(false)
const selectedFaseId = ref<string>('')
const existingMaterials = ref<MaterialDTO[]>([])

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

const formatUIDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Sin fecha'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return dateStr.slice(0, 16)
  }
}

const fromModalidad = (value: string): Modalidad => value.toLowerCase() as Modalidad

const toFaseItem = (item: FaseUnionDTO): FaseItem => {
  const isPrueba = item.tipo_fase === 'PRUEBA'
  const prueba = isPrueba ? (item as FasePruebaDTO) : null
  const prep = !isPrueba ? (item as FasePreparacionDTO) : null
  return {
    id: String(item.id_fase),
    nombre: item.nombre_fase,
    inicio: formatUIDate(isPrueba ? prueba!.fecha_realizacion : prep!.fecha_inicio),
    fin: formatUIDate(isPrueba ? prueba!.fecha_realizacion : prep!.fecha_fin),
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
  errorMessage.value = ''
  try {
    const res = await fasesService.listarFasesPorCategoria(props.categoriaId, { page: 1, limit: 100 })
    fasesRaw.value = res.data.items || []
    
    const oldMaterialsMap = new Map(fases.value.map(f => [f.id, f.materiales]))
    fases.value = fasesRaw.value.map(dto => {
      const item = toFaseItem(dto)
      item.materiales = oldMaterialsMap.get(item.id) || []
      return item
    })
  } catch (err: any) {
    fasesRaw.value = []
    fases.value = []
    extractError(err, 'No se pudieron cargar las fases.')
  } finally {
    isLoadingFases.value = false
  }
}

watch(() => props.categoriaId, loadFases, { immediate: true })

const getFaseAnteriorNombre = (faseAnteriorId: string) => {
  return fases.value.find(f => f.id === faseAnteriorId)?.nombre || 'Ninguna'
}

// ----- Acciones de Fase -----
const openCreateFase = () => faseModalRef.value?.openCreate()

const openEditFase = (fase: FaseItem) => {
  const raw = fasesRaw.value.find(f => String(f.id_fase) === fase.id)
  if (raw) faseModalRef.value?.openEdit(raw)
}

const requestDeleteFase = (id: string) => {
  faseToDelete.value = id
  showDeleteModal.value = true
}

const confirmDeleteFase = async () => {
  if (!faseToDelete.value) return
  isDeletingFase.value = true
  errorMessage.value = ''
  
  try {
    await fasesService.eliminarFaseFisica(Number(faseToDelete.value))
    await loadFases()
    showDeleteModal.value = false
  } catch(err) {
    extractError(err, 'No se pudo eliminar la fase.')
  } finally {
    isDeletingFase.value = false
    faseToDelete.value = null
  }
}

// ----- Acciones de Materiales -----
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
  errorMessage.value = ''
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
        tipo: res.data.tipo_material as MaterialTipo,
        idMaterial: res.data.id_material,
      })
    }
    isMaterialModalOpen.value = false
  } catch(err) {
    extractError(err, 'No se pudo guardar el material.')
  }
}

const saveMaterialExistente = async (ids: number[]) => {
  if (!selectedFaseId.value) return
  errorMessage.value = ''
  try {
    await Promise.all(ids.map((id) => materialesService.ligarFase(id, Number(selectedFaseId.value))))
    const fase = fases.value.find((item) => item.id === selectedFaseId.value)
    if (fase) {
      const toAdd = existingMaterials.value
        .filter((m) => ids.includes(m.id_material))
        .map((m) => ({
          id: `mat-${m.id_material}`,
          nombre: m.nombre_material,
          tipo: m.tipo_material as MaterialTipo,
          idMaterial: m.id_material,
        }))
      fase.materiales.push(...toAdd)
    }
    isMaterialModalOpen.value = false
  } catch(err) {
    extractError(err, 'No se pudo vincular el material.')
  }
}

const removeMaterial = async (faseId: string, materialId: string, idMaterial?: number) => {
  errorMessage.value = ''
  try {
    if (idMaterial) await materialesService.desligarFase(idMaterial, Number(faseId))
    const fase = fases.value.find((item) => item.id === faseId)
    if (fase) fase.materiales = fase.materiales.filter((item) => item.id !== materialId)
  } catch(err) {
    extractError(err, 'No se pudo eliminar el material.')
  }
}
</script>

<template>
  <Card class="border-gray-200 border-l-4 border-l-accent shadow-soft bg-white relative">
    <CardHeader class="border-b border-gray-100 pb-4">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center gap-2 text-text-main">
            <CalendarDays class="h-5 w-5 text-accent" />Fases de la Categoría
          </CardTitle>
          <p class="mt-1 text-sm text-text-muted">Administra el cronograma y los materiales asignados.</p>
        </div>
        <Button variant="accent" class="flex items-center gap-2 shadow-sm" @click="openCreateFase">
          <Plus class="h-4 w-4" />Nueva Fase
        </Button>
      </div>
    </CardHeader>

    <CardContent class="space-y-4 p-6">
      <transition name="slide">
        <div v-if="errorMessage" class="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3 shadow-sm shrink-0">
          <AlertCircle class="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <h4 class="text-[11px] font-bold uppercase tracking-wider text-danger">Error</h4>
            <p class="text-xs font-medium wrap-break-word whitespace-pre-wrap text-danger">{{ errorMessage }}</p>
          </div>
          <button @click="errorMessage = ''" class="text-danger/60 hover:text-danger-hover transition-colors shrink-0">
            <X class="h-3 w-3 text-danger" />
          </button>
        </div>
      </transition>

      <div v-if="isLoadingFases" class="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm font-medium text-text-muted animate-pulse">
        Cargando fases...
      </div>
      
      <div v-else-if="fases.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center flex flex-col items-center justify-center">
        <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <CalendarDays class="h-6 w-6 text-gray-400" />
        </div>
        <p class="text-sm font-bold text-text-main">Sin fases registradas</p>
        <p class="text-xs text-text-muted mt-1 max-w-xs">No se ha creado el cronograma de evaluación ni preparación para esta categoría aún.</p>
      </div>

      <div class="space-y-4">
        <FaseCard
          v-for="fase in fases"
          :key="fase.id"
          :fase="fase"
          :fase-anterior-nombre="getFaseAnteriorNombre(fase.faseAnteriorId)"
          @edit="openEditFase"
          @delete="requestDeleteFase"
          @add-material="openMaterialModal"
          @remove-material="removeMaterial"
        />
      </div>
    </CardContent>

    <DeleteFaseModal 
      :show="showDeleteModal" 
      :is-deleting="isDeletingFase"
      @cancel="showDeleteModal = false"
      @confirm="confirmDeleteFase"
    />
  </Card>

  <FaseModal
    ref="faseModalRef"
    :categoria-id="categoriaId"
    :fases="fasesRaw"
    @refresh="loadFases"
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

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>