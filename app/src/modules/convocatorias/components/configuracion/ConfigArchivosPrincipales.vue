<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Edit, X, Image as ImageIcon, FileText, Upload, Eye, Check } from 'lucide-vue-next'
import { materialesService } from '@/modules/material/services/material.service'
import type { MaterialDTO, ConvocatoriaDTO } from '@/modules/material/types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{ convocatoria: ConvocatoriaDTO }>()

const isEditingFiles = ref(false)
const isDocumentModalOpen = ref(false)
const documentModalTab = ref<'nuevo' | 'existente'>('nuevo')
const documentModifying = ref<'AFICHE' | 'REGLAMENTO' | 'CONVOCATORIA' | null>(null)
const attachedFile = ref<File | null>(null)
const selectedArchivoExistenteId = ref<number | null>(null)

const isLoading = ref(false)
const errorMsg = ref('')
const materialesList = ref<MaterialDTO[]>([])

const afiche = computed(() => materialesList.value.find(m => m.tipo_material === 'AFICHE'))
const reglamento = computed(() => materialesList.value.find(m => m.tipo_material === 'REGLAMENTO'))
const convocatoriaPdf = computed(() => materialesList.value.find(m => m.tipo_material === 'CONVOCATORIA'))

const filteredMaterialesExistentes = computed(() => {
  if (!documentModifying.value) return []
  return materialesList.value.filter(m => m.tipo_material === documentModifying.value)
})

const fetchMateriales = async () => {
  try {
    const res = await materialesService.obtenerPorConvocatoria(props.convocatoria.id_convocatoria)
    materialesList.value = res.data || []
  } catch (err) {
    console.error('Error cargando materiales', err)
  }
}

onMounted(() => {
  fetchMateriales()
})

function openDocumentModal(tipo: 'AFICHE' | 'REGLAMENTO' | 'CONVOCATORIA') {
  documentModifying.value = tipo
  attachedFile.value = null
  selectedArchivoExistenteId.value = null
  documentModalTab.value = 'nuevo'
  errorMsg.value = ''
  isDocumentModalOpen.value = true
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) attachedFile.value = target.files[0]
}

async function saveArchivosRequeridos() {
  if (!documentModifying.value) return

  isLoading.value = true
  errorMsg.value = ''

  try {
    if (documentModalTab.value === 'nuevo') {
      if (!attachedFile.value) throw new Error('Debe seleccionar un archivo.')
      await materialesService.crearMaterialPrincipal({
        id_convocatoria: props.convocatoria.id_convocatoria,
        tipo_material: documentModifying.value,
        nombre_material: `${documentModifying.value} - ${props.convocatoria.nombre_convocatoria}`,
        file: attachedFile.value
      })
    } else {
      if (!selectedArchivoExistenteId.value) throw new Error('Debe seleccionar un archivo de la lista.')
      await materialesService.ligarConvocatoria(selectedArchivoExistenteId.value, props.convocatoria.id_convocatoria)
    }
    isDocumentModalOpen.value = false
    await fetchMateriales()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Error al procesar el archivo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card class="border-gray-200 bg-white shadow-soft">
    <CardHeader class="border-b border-gray-100 pb-4">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center gap-2 text-text-main">
            <FileText class="h-5 w-5 text-primary" /> Archivos Principales
          </CardTitle>
          <p class="text-xs text-text-muted mt-1">Anexos fundamentales visibles en la plataforma para los aspirantes.</p>
        </div>
        <Button :variant="isEditingFiles ? 'default' : 'outline'" size="sm" @click="isEditingFiles = !isEditingFiles">
          <Edit class="h-4 w-4 mr-2" /> {{ isEditingFiles ? 'Finalizar Edición' : 'Editar Archivos' }}
        </Button>
      </div>
    </CardHeader>
    <CardContent class="pt-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        
        <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ImageIcon class="h-5 w-5" />
              </div>
              <div>
                <p class="font-bold text-sm">Afiche Promocional</p>
                <p class="text-xs text-text-muted">.JPG, .PNG</p>
              </div>
            </div>
            <Badge v-if="afiche" variant="outline" class="bg-success/10 text-success text-xs">Cargado</Badge>
            <Badge v-else variant="outline" class="bg-gray-100 text-text-muted text-xs">Falta</Badge>
          </div>
          <div class="mt-4 flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button v-if="isEditingFiles" variant="outline" size="sm" class="w-full text-xs" @click="openDocumentModal('AFICHE')">
              <Upload class="mr-2 h-3.5 w-3.5" /> {{ afiche ? 'Gestionar' : 'Subir' }}
            </Button>
          </div>
        </div>

        <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText class="h-5 w-5" />
              </div>
              <div>
                <p class="font-bold text-sm">Reglamento Oficial</p>
                <p class="text-xs text-text-muted">.PDF</p>
              </div>
            </div>
            <Badge v-if="reglamento" variant="outline" class="bg-success/10 text-success text-xs">Cargado</Badge>
            <Badge v-else variant="outline" class="bg-gray-100 text-text-muted text-xs">Falta</Badge>
          </div>
          <div class="mt-4 flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button v-if="isEditingFiles" variant="outline" size="sm" class="w-full text-xs" @click="openDocumentModal('REGLAMENTO')">
              <Upload class="mr-2 h-3.5 w-3.5" /> {{ reglamento ? 'Gestionar' : 'Subir' }}
            </Button>
          </div>
        </div>

        <div class="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText class="h-5 w-5" />
              </div>
              <div>
                <p class="font-bold text-sm">Convocatoria Base</p>
                <p class="text-xs text-text-muted">.PDF</p>
              </div>
            </div>
            <Badge v-if="convocatoriaPdf" variant="outline" class="bg-success/10 text-success text-xs">Cargado</Badge>
            <Badge v-else variant="outline" class="bg-gray-100 text-text-muted text-xs">Falta</Badge>
          </div>
          <div class="mt-4 flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button v-if="isEditingFiles" variant="outline" size="sm" class="w-full text-xs" @click="openDocumentModal('CONVOCATORIA')">
              <Upload class="mr-2 h-3.5 w-3.5" /> {{ convocatoriaPdf ? 'Gestionar' : 'Subir' }}
            </Button>
          </div>
        </div>
      </div>
    </CardContent>

    <div v-if="isDocumentModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card class="w-full max-w-md border-gray-200 bg-white shadow-xl">
        <CardHeader class="border-b border-gray-100 pb-3">
          <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
            <span>Configurar {{ documentModifying }}</span>
            <button @click="isDocumentModalOpen = false" class="rounded-md p-1 text-text-muted hover:bg-gray-100 transition-colors">
              <X class="h-4 w-4" />
            </button>
          </CardTitle>
        </CardHeader>
        
        <div class="flex border-b border-gray-200 text-xs sm:text-sm">
          <button type="button" class="flex-1 py-2.5 font-bold text-center border-b-2 transition-colors" :class="documentModalTab === 'nuevo' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-main'" @click="documentModalTab = 'nuevo'">
            Subir archivo nuevo
          </button>
          <button type="button" class="flex-1 py-2.5 font-bold text-center border-b-2 transition-colors" :class="documentModalTab === 'existente' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-main'" @click="documentModalTab = 'existente'">
            Seleccionar existente
          </button>
        </div>

        <CardContent class="pt-4 space-y-4">
          <div v-if="documentModalTab === 'nuevo'" class="space-y-2">
            <label class="block text-xs font-bold text-text-main uppercase tracking-wider">Seleccionar desde dispositivo</label>
            <input type="file" @change="handleFileUpload" class="w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
            <p class="text-[11px] text-text-muted">Asegúrese de cargar un formato correspondiente al tipo seleccionado.</p>
          </div>

          <div v-else class="space-y-2">
            <label class="block text-xs font-bold text-text-main uppercase tracking-wider">
              Materiales Disponibles (Tipo: {{ documentModifying }})
            </label>
            
            <div v-if="filteredMaterialesExistentes.length === 0" class="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50">
              <FileText class="h-6 w-6 mx-auto text-gray-300 mb-1" />
              <p class="text-xs text-text-muted font-medium">No hay materiales previos de este tipo.</p>
            </div>

            <div v-else class="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <div v-for="file in filteredMaterialesExistentes" :key="file.id_material" @click="selectedArchivoExistenteId = file.id_material" class="flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer bg-white" :class="selectedArchivoExistenteId === file.id_material ? 'border-primary bg-primary/5 shadow-xs' : 'border-gray-200 hover:border-gray-300'">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="rounded-lg p-1.5" :class="selectedArchivoExistenteId === file.id_material ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-text-muted'">
                    <ImageIcon v-if="documentModifying === 'AFICHE'" class="h-4 w-4" />
                    <FileText v-else class="h-4 w-4" />
                  </div>
                  <span class="text-xs font-medium text-text-main truncate max-w-[220px]" :title="file.nombre_material">
                    {{ file.nombre_material }}
                  </span>
                </div>
                
                <div class="flex items-center gap-2">
                  <a :href="file.enlace_acceso" target="_blank" class="p-1 rounded-md text-text-muted hover:bg-gray-100 hover:text-primary transition-colors" title="Ver documento original" @click.stop>
                    <Eye class="h-3.5 w-3.5" />
                  </a>
                  <div v-if="selectedArchivoExistenteId === file.id_material" class="h-4 w-4 rounded-full bg-primary flex items-center justify-center animate-scale-up">
                    <Check class="h-2.5 w-2.5 text-white stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="errorMsg" class="rounded-lg border border-error/20 bg-error/10 p-3 text-xs font-semibold text-error text-center break-words">
            {{ errorMsg }}
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="outline" @click="isDocumentModalOpen = false">Cancelar</Button>
            <Button variant="accent" @click="saveArchivosRequeridos" :disabled="isLoading || (documentModalTab === 'nuevo' && !attachedFile) || (documentModalTab === 'existente' && !selectedArchivoExistenteId)">
              <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              {{ isLoading ? 'Guardando...' : 'Confirmar Cambios' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Card>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.animate-scale-up { animation: scaleUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>