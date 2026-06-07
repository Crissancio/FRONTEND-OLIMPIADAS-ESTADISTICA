<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, Plus, AlertCircle, X } from 'lucide-vue-next'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

import FaseCard from '@/modules/fases/components/FaseCard.vue'
import FaseModal from '@/modules/fases/components/FaseModal.vue'
import FaseGestionModal from '@/modules/fases/components/FaseGestionModal.vue'
import MaterialModal from '@/modules/material/components/MaterialModal.vue'
import type { NuevoMaterialForm } from '@/modules/material/components/MaterialModal.vue'

import { fasesService } from '@/modules/fases/services/fases.service'
import { materialesService } from '@/modules/material/services/material.service'
import type { FaseUnionDTO } from '@/modules/fases/types/fases.api'
import type { MaterialDTO } from '@/modules/material/types/material.api'

const props = defineProps<{
  convocatoriaId: number
  categoriaId: number
}>()

const emit = defineEmits<{
  (e: 'error', msg: string): void
}>()

const router = useRouter()

// ESTADO
const fases = ref<FaseUnionDTO[]>([])
const isLoadingFases = ref(false)
const errorMessage = ref('')

// REFERENCIAS A MODALES
const faseModalRef = ref<InstanceType<typeof FaseModal> | null>(null)
const gestionModalRef = ref<InstanceType<typeof FaseGestionModal> | null>(null)
const materialModalRef = ref<InstanceType<typeof MaterialModal> | null>(null)

// ESTADO PARA MATERIALES
const isMaterialModalOpen = ref(false)
const selectedFaseId = ref<number | null>(null)
const existingMaterials = ref<MaterialDTO[]>([])

// MANEJO DE ERRORES
const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

// CARGA DE DATOS
const loadFases = async () => {
  if (!Number.isFinite(props.categoriaId)) return
  isLoadingFases.value = true
  errorMessage.value = ''
  
  try {
    const res = await fasesService.listarFasesPorCategoria(props.categoriaId, { page: 1, limit: 100 })
    fases.value = res.data.items || []
  } catch (err: any) {
    fases.value = []
    extractError(err, 'No se pudieron cargar las fases de esta categoría.')
    emit('error', errorMessage.value)
  } finally {
    isLoadingFases.value = false
  }
}

watch(() => props.categoriaId, loadFases, { immediate: true })

// ----- MANEJADORES DE LA TARJETA (FaseCard) -----

const openCreateFase = () => {
  faseModalRef.value?.openCreate()
}

// 1. ADMINISTRAR -> Abre el FaseGestionModal
const handleAdministrar = (fase: FaseUnionDTO) => {
  gestionModalRef.value?.openManage(fase)
}

// 2. MATERIALES -> Abre el MaterialModal
const handleMateriales = async (fase: FaseUnionDTO) => {
  selectedFaseId.value = fase.id_fase
  materialModalRef.value?.reset()
  
  try {
    const res = await materialesService.obtenerPorFase(fase.id_fase)
    existingMaterials.value = res.data
  } catch {
    existingMaterials.value = []
  }
  
  isMaterialModalOpen.value = true
}

// 3. RESULTADOS -> Redirige a la página de resultados
const handleResultados = (fase: FaseUnionDTO) => {
  router.push({
    name: 'admin-fase-gestion', // Reemplaza por el nombre exacto de tu ruta
    params: { 
      convocatoriaId: props.convocatoriaId, 
      categoriaId: props.categoriaId, 
      faseId: fase.id_fase 
    }
  })
}

// ----- GUARDADO DE MATERIALES -----
const saveMaterialNuevo = async (form: NuevoMaterialForm) => {
  if (!selectedFaseId.value) return
  errorMessage.value = ''
  try {
    const res = await materialesService.crearMaterialExterno({
      nombre_material: form.nombre,
      tipo_material: form.tipo,
      enlace_acceso: form.enlace,
    })
    await materialesService.ligarFase(res.data.id_material, selectedFaseId.value)
    isMaterialModalOpen.value = false
  } catch(err) {
    extractError(err, 'No se pudo guardar el material.')
  }
}

const saveMaterialExistente = async (ids: number[]) => {
  if (!selectedFaseId.value) return
  errorMessage.value = ''
  try {
    await Promise.all(ids.map((id) => materialesService.ligarFase(id, selectedFaseId.value as number)))
    isMaterialModalOpen.value = false
  } catch(err) {
    extractError(err, 'No se pudo vincular el material.')
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
          <p class="mt-1 text-sm text-text-muted">Visualiza el cronograma de evaluación y preparación.</p>
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
        Cargando cronograma de fases...
      </div>
      
      <div v-else-if="fases.length === 0" class="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center flex flex-col items-center justify-center">
        <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <CalendarDays class="h-6 w-6 text-gray-400" />
        </div>
        <p class="text-sm font-bold text-text-main">Sin fases registradas</p>
        <p class="text-xs text-text-muted mt-1 max-w-xs">No se ha creado el cronograma de evaluación ni preparación para esta categoría aún.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
        <FaseCard
          v-for="fase in fases"
          :key="fase.id_fase"
          :fase="fase"
          @administrar="handleAdministrar"
          @materiales="handleMateriales"
          @resultados="handleResultados"
        />
      </div>
    </CardContent>
  </Card>

  <FaseModal
    ref="faseModalRef"
    :categoria-id="categoriaId"
    :fases="fases"
    @refresh="loadFases"
  />

  <FaseGestionModal
    ref="gestionModalRef"
    :categoria-id="categoriaId"
    :fases="fases"
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