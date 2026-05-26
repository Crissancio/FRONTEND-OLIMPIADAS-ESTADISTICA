<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, UploadCloud, Download, FileText, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-vue-next'
import { useColegiosStore } from '../stores/colegio.store'
import Button from '@/shared/components/ui/atoms/Button.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported'): void
}>()

const colegiosStore = useColegiosStore()

const currentStep = ref(1)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const parsedRows = ref<any[]>([])
const isProcessing = ref(false)
const importError = ref<string | null>(null)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0])
  }
}

const processFile = (file: File) => {
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    importError.value = 'El archivo debe ser de formato CSV.'
    return
  }
  selectedFile.value = file
  importError.value = null
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    parseCSV(text)
  }
  reader.readAsText(file)
}

const parseCSV = (text: string) => {
  const lines = text.split(/\r?\n/)
  if (lines.length <= 1) return

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const values = lines[i].split(',').map(v => v.trim())
    const rowData: Record<string, any> = {}
    
    headers.forEach((header, index) => {
      rowData[header] = values[index] || ''
    })
    
    rows.push({
      codigo: Number(rowData.codigo) || 0,
      nombre: rowData.nombre || '',
      tipo: rowData.tipo?.toUpperCase() || '',
      turno: rowData.turno?.toUpperCase() || '',
      departamento: rowData.departamento || '',
      municipio: rowData.municipio || '',
      calle: rowData.calle || null
    })
  }

  parsedRows.value = rows
}

const downloadTemplate = () => {
  const headers = 'codigo,nombre,tipo,turno,departamento,municipio,calle\n'
  const example = '102030,Colegio Nacional San Martin,PUBLICO,MAÑANA,La Paz,El Alto,Av. Juan Pablo II\n'
  const blob = new Blob([headers + example], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_colegios.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const nextStep = () => {
  if (currentStep.value === 1 && selectedFile.value) {
    currentStep.value = 2
  }
}

const prevStep = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1
  }
}

const executeImport = async () => {
  isProcessing.value = true
  importError.value = null
  try {
    await colegiosStore.importCSV(parsedRows.value)
    currentStep.value = 3
    emit('imported')
  } catch (error) {
    importError.value = 'Ocurrió un error al procesar el archivo en el servidor.'
  } finally {
    isProcessing.value = false
  }
}

const closeWizard = () => {
  currentStep.value = 1
  selectedFile.value = null
  parsedRows.value = []
  importError.value = null
  emit('close')
}

const isNextDisabled = computed(() => {
  return currentStep.value === 1 && !selectedFile.value
})
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="closeWizard">
      <TransitionChild 
        as="template" 
        enter="ease-in-out duration-300" 
        enter-from="opacity-0" 
        enter-to="opacity-100" 
        leave="ease-in-out duration-300" 
        leave-from="opacity-100" 
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <TransitionChild 
              as="template" 
              enter="transform transition ease-in-out duration-300 sm:duration-500" 
              enter-from="translate-x-full" 
              enter-to="translate-x-0" 
              leave="transform transition ease-in-out duration-300 sm:duration-500" 
              leave-from="translate-x-0" 
              leave-to="translate-x-full"
            >
              <DialogPanel class="pointer-events-auto w-screen max-w-md lg:max-w-2xl">
                <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  
                  <div class="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <DialogTitle class="font-heading text-xl font-bold text-text-main">
                        Importación Masiva de Colegios
                      </DialogTitle>
                      <div class="ml-3 flex h-7 items-center">
                        <Button variant="ghost" size="icon" @click="closeWizard">
                          <X class="h-5 w-5 text-text-muted" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>

                    <div class="mt-6 flex items-center justify-between relative">
                      <div class="absolute inset-0 flex items-center" aria-hidden="true">
                        <div class="w-full border-t border-gray-200"></div>
                      </div>
                      <div class="relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors z-10" :class="currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-text-muted'">1</div>
                      <div class="relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors z-10" :class="currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-text-muted'">2</div>
                      <div class="relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors z-10" :class="currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-text-muted'">3</div>
                    </div>
                  </div>

                  <div class="relative flex-1 px-4 py-6 sm:px-6">
                    
                    <div v-if="importError" class="mb-4 flex items-start gap-2 p-3 bg-estado-rechazado-soft border border-estado-rechazado/20 text-estado-rechazado text-sm rounded-lg">
                      <AlertCircle class="h-5 w-5 shrink-0" />
                      <span>{{ importError }}</span>
                    </div>

                    <div v-if="currentStep === 1" class="space-y-6">
                      <div 
                        @dragover.prevent 
                        @drop.prevent="handleDrop"
                        @click="triggerFileSelect"
                        class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-colors group"
                      >
                        <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileChange" />
                        <UploadCloud class="mx-auto h-12 w-12 text-text-muted group-hover:text-primary transition-colors" />
                        <p class="mt-4 text-sm font-bold text-text-main">Arrastra tu archivo CSV aquí o haz clic para buscar</p>
                        <p class="mt-1 text-xs text-text-muted">Solo se permiten archivos con extensión .csv</p>
                      </div>

                      <div v-if="selectedFile" class="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <FileText class="h-8 w-8 text-primary" />
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-text-main truncate">{{ selectedFile.name }}</p>
                          <p class="text-xs text-text-muted">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
                        </div>
                        <Badge variant="outline" class="bg-estado-revisado-soft text-estado-revisado border-estado-revisado/20 text-xs">Cargado</Badge>
                      </div>

                      <div class="border-t border-gray-100 pt-6">
                        <h4 class="text-sm font-bold text-text-main mb-2">¿No tienes la estructura correcta?</h4>
                        <p class="text-xs text-text-muted mb-4">Descarga nuestra plantilla estructurada para asegurar que la carga no contenga errores de formato.</p>
                        <Button type="button" variant="outline" class="flex items-center gap-2 text-xs" @click="downloadTemplate">
                          <Download class="h-4 w-4" />
                          Descargar Plantilla CSV
                        </Button>
                      </div>
                    </div>

                    <div v-if="currentStep === 2" class="space-y-4">
                      <div class="flex justify-between items-center">
                        <h4 class="font-bold text-text-main text-sm">Registros encontrados ({{ parsedRows.length }})</h4>
                        <p class="text-xs text-text-muted">Revisa las filas antes del guardado definitivo</p>
                      </div>

                      <div class="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                        <table class="min-w-full divide-y divide-gray-200 text-left text-xs">
                          <thead class="bg-gray-50 sticky top-0 font-bold text-text-main">
                            <tr>
                              <th class="px-4 py-3">SIE</th>
                              <th class="px-4 py-3">Nombre</th>
                              <th class="px-4 py-3">Tipo</th>
                              <th class="px-4 py-3">Turno</th>
                              <th class="px-4 py-3">Municipio</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200 bg-white text-text-muted">
                            <tr v-for="(row, index) in parsedRows" :key="index">
                              <td class="px-4 py-3 font-medium text-text-main">{{ row.codigo }}</td>
                              <td class="px-4 py-3 truncate max-w-[150px]">{{ row.nombre }}</td>
                              <td class="px-4 py-3">{{ row.tipo }}</td>
                              <td class="px-4 py-3">{{ row.turno }}</td>
                              <td class="px-4 py-3">{{ row.municipio }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div v-if="currentStep === 3" class="flex flex-col items-center justify-center py-12 text-center">
                      <div class="h-16 w-16 bg-estado-revisado-soft text-estado-revisado rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 class="h-10 w-10" />
                      </div>
                      <h3 class="text-xl font-bold text-text-main mb-2">¡Importación Exitosa!</h3>
                      <p class="text-sm text-text-muted max-w-sm mb-6">Todos los registros válidos del archivo CSV se han procesado e incorporado correctamente al sistema.</p>
                      <Button variant="primary" @click="closeWizard">Entendido</Button>
                    </div>

                  </div>

                  <div v-if="currentStep < 3" class="flex flex-shrink-0 justify-between px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <Button variant="outline" type="button" :disabled="currentStep === 1 || isProcessing" @click="prevStep" class="flex items-center gap-1">
                      <ChevronLeft class="h-4 w-4" />
                      Atrás
                    </Button>

                    <Button v-if="currentStep === 1" variant="primary" type="button" :disabled="isNextDisabled" @click="nextStep" class="flex items-center gap-1">
                      Siguiente
                      <ChevronRight class="h-4 w-4" />
                    </Button>

                    <Button v-else variant="accent" type="button" :disabled="isProcessing || parsedRows.length === 0" @click="executeImport" class="flex items-center gap-2">
                      <div v-if="isProcessing" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {{ isProcessing ? 'Procesando...' : 'Confirmar y Guardar' }}
                    </Button>
                  </div>

                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>