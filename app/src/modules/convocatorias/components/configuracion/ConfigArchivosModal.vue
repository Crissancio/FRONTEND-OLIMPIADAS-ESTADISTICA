<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Image as ImageIcon, FileText, Check, AlertCircle } from 'lucide-vue-next'
import { materialesService } from '@/modules/material/services/material.service'
import type { TipoMaterialPrincipal, TipoMaterialEnum } from '@/modules/material/types/material.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{ 
  convocatoriaId: number, 
  convocatoriaNombre: string 
}>()
const emit = defineEmits(['refresh'])

const isOpen = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

const documentModalTab = ref<'nuevo' | 'existente'>('nuevo')
const documentModifying = ref<TipoMaterialPrincipal | null>(null)

// Campos del formulario para material nuevo
const formNombre = ref('')
const formDescripcion = ref('')
const attachedFile = ref<File | null>(null)

const selectedArchivoExistenteId = ref<number | null>(null)
const materialesExistentes = ref<any[]>([])

const previewUrl = computed(() => {
  if (documentModalTab.value === 'nuevo' && attachedFile.value) {
    return URL.createObjectURL(attachedFile.value)
  }
  if (documentModalTab.value === 'existente' && selectedArchivoExistenteId.value) {
    const file = materialesExistentes.value.find(m => m.id_material === selectedArchivoExistenteId.value)
    return file ? file.enlace_acceso : null
  }
  return null
})

const isPreviewImage = computed(() => {
  if (documentModifying.value === 'AFICHE') return true
  if (previewUrl.value) {
    return previewUrl.value.match(/\.(jpeg|jpg|gif|png)$/i) != null || (attachedFile.value && attachedFile.value.type.startsWith('image/'))
  }
  return false
})

const openModal = async (tipo: TipoMaterialPrincipal) => {
  documentModifying.value = tipo
  attachedFile.value = null
  selectedArchivoExistenteId.value = null
  documentModalTab.value = 'nuevo'
  errorMsg.value = ''
  materialesExistentes.value = []
  
  // Autocompletamos con un nombre por defecto amigable, pero que se pueda editar
  formNombre.value = `${tipo} - ${props.convocatoriaNombre}`.substring(0, 100)
  formDescripcion.value = ''
  
  isOpen.value = true
}

const loadMaterialesExistentes = async () => {
  if (!documentModifying.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    // Usamos el servicio tipado 
    const res = await materialesService.conseguirMaterialPrincipalTipo(documentModifying.value)
    const data = res.data
    // Prevenimos fallos asegurando un array compatible
    materialesExistentes.value = Array.isArray(data) ? data : ((data as any).items || Object.values(data) || [])
  } catch (err: any) {
    extractError(err, 'No se pudieron cargar los materiales existentes.')
  } finally {
    isLoading.value = false
  }
}

const switchTab = (tab: 'nuevo' | 'existente') => {
  documentModalTab.value = tab
  errorMsg.value = ''
  if (tab === 'existente' && materialesExistentes.value.length === 0) {
    loadMaterialesExistentes()
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) attachedFile.value = target.files[0]
}

// === EXTRACCIÓN ROBUSTA DE ERRORES ===
const extractError = (err: any, fallbackMsg: string) => {
  console.error('Error detallado de API:', err.response?.data || err)
  const responseData = err.response?.data || err.data
  
  if (responseData) {
    if (typeof responseData === 'string') {
      errorMsg.value = responseData
    } else {
      errorMsg.value = responseData.error 
        || responseData.message 
        || (Array.isArray(responseData.detail) ? JSON.stringify(responseData.detail) : responseData.detail)
        || JSON.stringify(responseData)
    }
  } else {
    errorMsg.value = err.message && !err.message.includes('status code') 
      ? err.message 
      : fallbackMsg
  }
}

const saveArchivosRequeridos = async () => {
  if (!documentModifying.value) return

  isLoading.value = true
  errorMsg.value = ''

  try {
    if (documentModalTab.value === 'nuevo') {
      if (!attachedFile.value) throw new Error('Debe seleccionar un archivo válido.')
      if (!formNombre.value.trim()) throw new Error('El nombre del material es obligatorio.')
      
      // Llamada al método de Creación de Archivo Principal
      await materialesService.crearMaterialPrincipal({
        id_convocatoria: props.convocatoriaId,
        tipo_material: documentModifying.value as TipoMaterialEnum,
        nombre_material: formNombre.value.trim(),
        descripcion: formDescripcion.value.trim() || undefined,
        file: attachedFile.value
      })

    } else {
      if (!selectedArchivoExistenteId.value) throw new Error('Debe seleccionar un archivo de la lista.')
      
      // Llamada al nuevo método Ligar usando el DTO
      await materialesService.ligarMaterialPrincipalConvocatoria({
        id_material: selectedArchivoExistenteId.value,
        id_convocatoria: props.convocatoriaId,
        tipo_material: documentModifying.value
      })
    }

    emit('refresh')
    isOpen.value = false
  } catch (err: any) {
    extractError(err, 'El servidor rechazó el archivo o la conexión falló. Verifique el formato.')
  } finally {
    isLoading.value = false
  }
}

defineExpose({ openModal })
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <Card class="w-full max-w-4xl border-gray-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
      
      <CardHeader class="border-b border-gray-100 pb-3 shrink-0">
        <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
          <span>Configurar {{ documentModifying }}</span>
          <button @click="isOpen = false" class="rounded-md p-1 text-text-muted hover:bg-gray-100 transition-colors">
            <X class="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>
      
      <div class="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-100">
        
        <div class="shrink-0 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 flex flex-col p-4 items-center justify-center">
          <p class="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3 w-full text-center">Vista Previa</p>
          
          <div class="w-32 h-44 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex items-center justify-center relative shrink-0">
            <template v-if="previewUrl">
              <img v-if="isPreviewImage" :src="previewUrl" class="w-full h-full object-cover" />
              <iframe v-else :src="previewUrl" class="w-full h-full border-none"></iframe>
              <div class="absolute inset-0 bg-black/5 pointer-events-none"></div>
            </template>
            <template v-else>
              <div class="text-center p-4">
                <ImageIcon v-if="documentModifying === 'AFICHE'" class="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <FileText v-else class="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p class="text-[10px] text-gray-400 font-medium leading-tight">Sin selección</p>
              </div>
            </template>
          </div>
        </div>

        <div class="flex-1 flex flex-col overflow-hidden w-full">
          <div class="flex border-b border-gray-200 text-xs sm:text-sm shrink-0">
            <button 
              type="button" 
              class="flex-1 py-3 font-bold text-center border-b-2 transition-colors" 
              :class="documentModalTab === 'nuevo' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-main'" 
              @click="switchTab('nuevo')"
            >
              Subir Archivo Nuevo
            </button>
            <button 
              type="button" 
              class="flex-1 py-3 font-bold text-center border-b-2 transition-colors" 
              :class="documentModalTab === 'existente' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-main'" 
              @click="switchTab('existente')"
            >
              Seleccionar Existente
            </button>
          </div>

          <CardContent class="pt-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
            
            <transition name="fade-slide">
              <div v-if="errorMsg" class="flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 p-3 shadow-sm shrink-0">
                <AlertCircle class="h-4 w-4 text-error shrink-0 mt-0.5" />
                <div class="flex-1">
                  <h4 class="text-[11px] font-bold text-error uppercase tracking-wider">Error</h4>
                  <p class="text-xs text-error/90 font-medium wrap-break-word whitespace-pre-wrap">{{ errorMsg }}</p>
                </div>
                <button @click="errorMsg = ''" class="text-error/60 hover:text-error transition-colors">
                  <X class="h-3 w-3" />
                </button>
              </div>
            </transition>

            <div v-if="documentModalTab === 'nuevo'" class="flex-1 flex flex-col space-y-4">
              
              <div>
                <label class="block text-xs font-bold text-text-main mb-1.5">Nombre del Material <span class="text-error">*</span></label>
                <input 
                  v-model="formNombre" 
                  type="text" 
                  maxlength="100"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" 
                  placeholder="Ej: AFICHE - Convocatoria 2026"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-text-main mb-1.5">Descripción <span class="text-gray-400 font-normal">(Opcional)</span></label>
                <textarea 
                  v-model="formDescripcion" 
                  rows="2" 
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none transition-colors"
                  placeholder="Detalles sobre este material..."
                ></textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-text-main mb-1.5 uppercase tracking-wider">Archivo <span class="text-error">*</span></label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  @change="handleFileUpload" 
                  class="w-full text-xs text-text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer border border-dashed border-gray-300 rounded-lg p-2 bg-gray-50/50" 
                />
                <p class="text-[11px] text-text-muted mt-2">
                  Formatos aceptados: <strong class="text-text-main">PDF, DOC, DOCX, JPG, PNG</strong>.
                </p>
              </div>

            </div>

            <div v-else class="flex-1 flex flex-col h-full">
              <label class="block text-xs font-bold text-text-main uppercase tracking-wider mb-3">
                Materiales en Repositorio ({{ documentModifying }})
              </label>
              
              <div v-if="isLoading && materialesExistentes.length === 0" class="flex-1 flex items-center justify-center">
                <span class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              </div>

              <div v-else-if="materialesExistentes.length === 0" class="flex-1 flex flex-col items-center justify-center text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                <FileText class="h-8 w-8 text-gray-300 mb-2" />
                <p class="text-xs text-text-muted font-medium">No se encontraron materiales previos de este tipo.</p>
              </div>

              <div v-else class="flex-1 space-y-2 pr-1 custom-scrollbar">
                <div 
                  v-for="file in materialesExistentes" 
                  :key="file.id_material" 
                  @click="selectedArchivoExistenteId = file.id_material" 
                  class="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer bg-white" 
                  :class="selectedArchivoExistenteId === file.id_material ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="rounded-lg p-2" :class="selectedArchivoExistenteId === file.id_material ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-text-muted'">
                      <ImageIcon v-if="documentModifying === 'AFICHE'" class="h-4 w-4" />
                      <FileText v-else class="h-4 w-4" />
                    </div>
                    <div>
                      <p class="text-xs font-bold text-text-main truncate max-w-55" :title="file.nombre_material">
                        {{ file.nombre_material }}
                      </p>
                    </div>
                  </div>
                  
                  <div v-if="selectedArchivoExistenteId === file.id_material" class="h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-scale-up shrink-0">
                    <Check class="h-3 w-3 text-white stroke-[3px]" />
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
          
          <div class="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3">
            <Button variant="outline" @click="isOpen = false" :disabled="isLoading">Cancelar</Button>
            <Button 
              variant="accent" 
              @click="saveArchivosRequeridos" 
              :disabled="isLoading || (documentModalTab === 'nuevo' && (!attachedFile || !formNombre)) || (documentModalTab === 'existente' && !selectedArchivoExistenteId)"
            >
              <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              {{ isLoading ? 'Procesando...' : 'Confirmar Archivo' }}
            </Button>
          </div>
        </div>

      </div>
    </Card>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.animate-scale-up { animation: scaleUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>