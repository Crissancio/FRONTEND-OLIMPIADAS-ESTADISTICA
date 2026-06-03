<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, Plus, X, Upload } from 'lucide-vue-next'
import { useMaterialesStore } from '../stores/material.store'
import type { MaterialDTO } from '../types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import MaterialCard from '@/modules/admin/components/MaterialCard.vue'

const props = defineProps<{ convocatoriaId: number }>()
const materialesStore = useMaterialesStore()

// Manejo del Modal de Documentos (Original Modal Tab style)
const isDocumentModalOpen = ref(false)
const attachedFile = ref<File | null>(null)
const documentSaving = ref(false)
const documentSaveError = ref('')

const form = ref({
  nombre_material: '',
  tipo_material: 'EXAMEN' as any,
  descripcion: ''
})

onMounted(() => {
  materialesStore.fetchMateriales()
})

function openCreateModal() {
  form.value = { nombre_material: '', tipo_material: 'EXAMEN', descripcion: '' }
  attachedFile.value = null
  documentSaveError.value = ''
  isDocumentModalOpen.value = true
}

function closeDocumentModal() { 
  isDocumentModalOpen.value = false 
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    attachedFile.value = target.files[0]
  }
}

async function uploadDocument() {
  if (!form.value.nombre_material.trim() || !attachedFile.value) {
    documentSaveError.value = 'Debe proveer un nombre y un archivo'
    return
  }
  
  documentSaving.value = true
  documentSaveError.value = ''
  
  try {
    await materialesStore.createPrincipal({
      id_convocatoria: props.convocatoriaId,
      tipo_material: form.value.tipo_material,
      nombre_material: form.value.nombre_material,
      descripcion: form.value.descripcion,
      file: attachedFile.value
    })
    closeDocumentModal()
    await materialesStore.fetchMateriales()
  } catch (err: any) { 
    documentSaveError.value = err.message || 'Error al subir documento'
  } finally {
    documentSaving.value = false
  }
}

async function toggleVisibility(material: MaterialDTO) {
  const isPublishing = material.estado !== 'PUBLICO'
  await materialesStore.toggleVisibilidadMaterial(material.id_material, isPublishing)
}

async function deleteResource(id: number) {
  if (confirm('¿Remover este recurso multimedia del repositorio adjunto de forma permanente?')) {
    await materialesStore.deleteMaterial(id)
  }
}
</script>

<template>
  <Card class="border-gray-200 shadow-soft bg-white">
    <CardHeader class="border-b border-gray-100 pb-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle class="flex items-center gap-2 text-text-main">
            <FileText class="h-5 w-5 text-primary" />
            Material de Convocatoria
          </CardTitle>
          <p class="text-xs text-text-muted mt-1">
            Archivos, reglamentos y afiches globales de la olimpiada.
          </p>
        </div>
        <Button variant="accent" class="flex items-center gap-2" @click="openCreateModal">
          <Plus class="h-4 w-4" />
          Subir Material
        </Button>
      </div>
    </CardHeader>
    
    <CardContent class="pt-6">
      <div v-if="materialesStore.loading" class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-text-muted text-center animate-pulse">
        Cargando materiales...
      </div>

      <div v-else-if="materialesStore.materiales.length === 0" class="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
        <FileText class="mx-auto h-8 w-8 text-gray-300" />
        <h3 class="mt-2 text-sm font-semibold text-text-main">Sin material</h3>
        <p class="mt-1 text-xs text-text-muted">No se han subido archivos a esta convocatoria.</p>
        <Button variant="outline" size="sm" class="mt-4" @click="openCreateModal">
          <Upload class="mr-2 h-4 w-4" />Subir archivo
        </Button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MaterialCard
          v-for="mat in materialesStore.materiales"
          :key="mat.id_material"
          :material="mat"
          @delete="deleteResource(mat.id_material)"
          @toggle-visibility="toggleVisibility(mat)"
        />
      </div>
    </CardContent>

    <div v-if="isDocumentModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card class="w-full max-w-md border-gray-200 bg-white shadow-xl animate-fade-in">
        <CardHeader class="border-b border-gray-100 pb-4">
          <CardTitle class="flex items-center justify-between text-base font-bold">
            <span>Adjuntar Documento</span>
            <button @click="closeDocumentModal" class="rounded-md p-1 text-text-muted hover:bg-gray-100"><X class="h-4 w-4" /></button>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4 pt-4">
          <div>
            <label class="block text-sm font-semibold text-text-main mb-1">Nombre Comercial del Archivo</label>
            <input v-model="form.nombre_material" type="text" placeholder="Ej: Solucionario Fase Distrital 2026" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-1">Clasificación / Tipo de Documento</label>
            <select v-model="form.tipo_material" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
              <option value="EXAMEN">EXAMEN</option>
              <option value="SOLUCIONARIO">SOLUCIONARIO</option>
              <option value="EJERCICIOS">EJERCICIOS</option>
              <option value="DOCUMENTO">DOCUMENTO</option>
              <option value="AFICHE">AFICHE</option>
              <option value="REGLAMENTO">REGLAMENTO</option>
              <option value="OTRO">OTRO</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-1">Notas / Descripción Corta</label>
            <textarea v-model="form.descripcion" rows="3" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Información opcional sobre el uso de este material..."></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-1">Seleccionar Fichero</label>
            <input type="file" @change="handleFileUpload" class="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          </div>

          <div v-if="documentSaveError" class="rounded-xl border border-error/20 bg-error/10 p-3 text-sm font-medium text-error">
            {{ documentSaveError }}
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="outline" @click="closeDocumentModal">Cancelar</Button>
            <Button variant="accent" @click="uploadDocument" :disabled="documentSaving || !attachedFile">
              {{ documentSaving ? 'Subiendo...' : 'Iniciar Carga' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Card>
</template>