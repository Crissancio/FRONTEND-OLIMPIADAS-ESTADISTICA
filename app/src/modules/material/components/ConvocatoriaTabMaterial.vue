<template>
  <div class="space-y-4">
    <div class="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-soft sm:flex-row sm:items-center">
      <div>
        <h2 class="font-heading text-xl font-bold text-text-main">Material Educativo Adjunto</h2>
        <p class="mt-1 text-sm text-text-muted">Gestión de recursos didácticos globales vinculados al repositorio de esta convocatoria.</p>
      </div>
      <Button variant="accent" @click="openCreateModal" class="flex items-center gap-2">
        <Plus class="h-4 w-4" /> Subir Recurso
      </Button>
    </div>

    <div v-if="materialesStore.loading" class="rounded-xl border border-gray-200 bg-white p-6 text-sm text-text-muted shadow-soft">
      Consultando catálogo de archivos multimedia adjuntos...
    </div>
    
    <div v-else-if="materialesStore.materiales.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <div 
        v-for="material in materialesStore.materiales" 
        :key="material.id_material" 
        class="border border-gray-200 bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <Badge variant="outline" class="bg-primary/5 text-primary text-xs font-bold">{{ material.tipo_material }}</Badge>
            <Badge :variant="material.estado === 'PUBLICO' ? 'default' : 'outline'" class="text-xs uppercase tracking-wider">
              {{ material.estado }}
            </Badge>
          </div>
          <h3 class="font-bold text-text-main text-sm md:text-base line-clamp-1">{{ material.nombre_material }}</h3>
          <p class="text-xs text-text-muted mt-1 line-clamp-2">{{ material.descripcion || 'Sin descripción provista.' }}</p>
        </div>
        
        <div class="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-gray-100">
          <a :href="material.enlace_acceso" target="_blank" rel="noopener" class="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
            <Eye class="h-3.5 w-3.5" /> Ver Recurso
          </a>
          <div class="flex gap-1">
            <Button variant="ghost" size="icon" class="h-8 w-8 text-text-muted hover:text-text-main" @click="toggleVisibility(material)">
              <Settings class="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" class="h-8 w-8 text-error hover:bg-error/5" @click="deleteResource(material.id_material)">
              <Trash2 class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <Card v-else class="border-gray-200 bg-white shadow-soft">
      <CardContent class="py-14 text-center">
        <FileText class="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p class="font-bold text-text-main">No hay material adjunto</p>
        <p class="mt-1 text-sm text-text-muted">Ningún recurso digital se ha anexado al alcance de esta convocatoria pública.</p>
      </CardContent>
    </Card>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card class="w-full max-w-md border-gray-200 bg-white shadow-xl">
        <CardHeader>
          <CardTitle class="flex items-center justify-between text-base font-bold">
            <span>Adjuntar Archivo al Repositorio</span>
            <Button variant="ghost" size="icon" @click="closeModal"><X class="h-4 w-4" /></Button>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
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
              <option value="OTRO">OTRO</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-1">Notas / Descripción Corta</label>
            <textarea v-model="form.descripcion" rows="3" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="Información opcional sobre el uso de este material..."></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-1">Seleccionar Fichero Binario</label>
            <input type="file" @change="handleFileUpload" class="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" @click="closeModal">Cancelar</Button>
            <Button variant="default" @click="uploadDocument" :disabled="materialesStore.loading || !attachedFile">
              {{ materialesStore.loading ? 'Transmitiendo...' : 'Iniciar Carga' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FileText, Plus, Trash2, Eye, X, Settings } from 'lucide-vue-next'
import { useMaterialesStore } from '../stores/material.store'
import type { MaterialDTO } from '../types/material.api'

const props = defineProps<{ convocatoriaId: number }>()
const materialesStore = useMaterialesStore()

const isModalOpen = ref(false)
const attachedFile = ref<File | null>(null)

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
  isModalOpen.value = true
}

function closeModal() { isModalOpen.value = false }

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    attachedFile.value = target.files[0]
  }
}

async function uploadDocument() {
  if (!form.value.nombre_material.trim() || !attachedFile.value) return
  try {
    await materialesStore.createPrincipal({
      id_convocatoria: props.convocatoriaId,
      tipo_material: form.value.tipo_material,
      nombre_material: form.value.nombre_material,
      descripcion: form.value.descripcion,
      file: attachedFile.value
    })
    closeModal()
    await materialesStore.fetchMateriales()
  } catch (err) { console.error(err) }
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