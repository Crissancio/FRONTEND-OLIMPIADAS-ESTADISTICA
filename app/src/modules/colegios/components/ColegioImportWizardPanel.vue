<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, UploadCloud, CheckCircle2, AlertCircle, Download, FileText, RefreshCw, Database } from 'lucide-vue-next'
import { useColegiosStore } from '../stores/colegio.store'
import Button from '@/shared/components/ui/atoms/Button.vue'
import type { CSVUploadResponseDTO, CSVImportDBResponseDTO } from '../types/colegios.api'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void, (e: 'imported'): void }>()

const colegiosStore = useColegiosStore()
const currentStep = ref(1)
const selectedFile = ref<File | null>(null)
const isProcessing = ref(false)

// Variables para manejo de errores
const globalError = ref<string | null>(null)
const csvFormatError = ref(false) // Nueva variable para errores críticos 500/Estructurales

const selectedDepartamento = ref('LA PAZ') 

const validationData = ref<CSVUploadResponseDTO | null>(null)
const dbResultData = ref<CSVImportDBResponseDTO | null>(null)

const DEPARTAMENTOS = ['BENI', 'CHUQUISACA', 'COCHABAMBA', 'LA PAZ', 'ORURO', 'PANDO', 'POTOSI', 'SANTA CRUZ', 'TARIJA']
const COLUMN_HELPERS = ['MUNICIPIO', 'CÓDIGO', 'NOMBRE', 'DEPENDENCIA', 'TURNO', 'ZONA', 'DIRECCIÓN', 'APELLIDOS Y NOMBRES DEL DIRECTOR', 'TELÉFONO 1', 'TELÉFONO 2']

const handleFileDrop = (e: DragEvent) => {
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    selectedFile.value = e.dataTransfer.files[0]
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const validateFile = async () => {
  if (!selectedFile.value || !selectedDepartamento.value) return
  isProcessing.value = true
  globalError.value = null
  csvFormatError.value = false // Reiniciamos el estado del error

  try {
    const result = await colegiosStore.uploadCsv(selectedDepartamento.value, selectedFile.value)
    validationData.value = result 
    currentStep.value = 2
  } catch (err: any) {
    // Detectamos si es un error 500, de red, o un error fatal de procesamiento
    const isServerError = err.response?.status === 500 || 
                          err.message?.toLowerCase().includes('network') || 
                          err.message?.includes('500');

    if (isServerError) {
      csvFormatError.value = true;
    } else {
      globalError.value = err.message || 'Error en el formato o lectura del archivo.';
    }
  } finally {
    isProcessing.value = false
  }
}

const executeDatabaseImport = async () => {
  if (!validationData.value || validationData.value.validos.length === 0) return
  isProcessing.value = true
  globalError.value = null

  try {
    const result = await colegiosStore.importCSV(validationData.value.validos)
    dbResultData.value = result
    currentStep.value = 3
    emit('imported')
  } catch (err: any) {
    globalError.value = err.message || 'Error al intentar insertar los registros en la base de datos.'
  } finally {
    isProcessing.value = false
  }
}

const downloadErrorCSV = async () => {
  if (!validationData.value?.csv_errores_url) return
  try {
    const blob = await colegiosStore.downloadCSVErrors(validationData.value.csv_errores_url)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = validationData.value.csv_errores_url
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al descargar el CSV de errores', error)
  }
}

const downloadTemplate = () => {
  const headers = COLUMN_HELPERS.join(',')
  const sampleRow = 'NUESTRA SEÑORA DE LA PAZ,12345678,COLEGIO EJEMPLO,FISCAL,MAÑANA,ZONA CENTRAL,CALLE PRINCIPAL 123,PÉREZ JUAN,77712345,2223344'
  const csvContent = `${headers}\n${sampleRow}`
  
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'plantilla_importacion_colegios.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const closeWizard = () => {
  currentStep.value = 1
  selectedFile.value = null
  validationData.value = null
  dbResultData.value = null
  globalError.value = null
  csvFormatError.value = false // Limpiamos al cerrar
  emit('close')
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="closeWizard">
      <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <TransitionChild as="template" enter="transform transition ease-in-out duration-300 sm:duration-500" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-300 sm:duration-500" leave-from="translate-x-0" leave-to="translate-x-full">
              <DialogPanel class="pointer-events-auto w-screen max-w-md lg:max-w-4xl">
                <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  
                  <div class="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <DialogTitle class="font-heading text-xl font-bold text-text-main">
                        Asistente de Importación Masiva
                      </DialogTitle>
                      <Button variant="ghost" size="icon" @click="closeWizard">
                        <X class="h-5 w-5 text-text-muted" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <div class="relative flex-1 px-4 py-6 sm:px-6">
                    
                    <div v-if="globalError" class="mb-4 flex items-start gap-2 p-3 bg-estado-rechazado-soft border border-estado-rechazado/20 text-estado-rechazado text-xs rounded-xl">
                      <AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{{ globalError }}</span>
                    </div>

                    <div v-if="csvFormatError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl space-y-4 text-sm text-red-800 shadow-sm">
                      <div class="flex items-center gap-2 font-bold text-red-700 text-base border-b border-red-200 pb-2">
                        <AlertCircle class="h-5 w-5" />
                        <h3>ERROR EN LOS DATOS DEL CSV</h3>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p class="font-bold mb-2">Posibles escenarios que generan el error:</p>
                          <ul class="list-disc pl-5 space-y-1.5 text-xs">
                            <li>Una columna está <b>completamente vacía</b>.</li>
                            <li>Hay celdas con <b>espacios en blanco</b> o valores nulos <i>(None, null, "")</i>.</li>
                            <li>El CSV tiene <b>más o menos columnas</b> de las esperadas.</li>
                          </ul>
                        </div>

                        <div>
                          <p class="font-bold mb-2">Recomendaciones:</p>
                          <ul class="list-disc pl-5 space-y-1.5 text-xs">
                            <li>Asegúrate de no dejar <b>filas vacías al final</b> del archivo.</li>
                            <li>Verifica que el separador de columnas sea correcto <i>(recomendamos usar delimitador por comas)</i>.</li>
                            <li>Revisa que no falten datos en columnas obligatorias como <b>Código</b> o <b>Nombre</b>.</li>
                            <li>Abre el archivo en un editor de texto simple <i>(ej. Bloc de notas)</i> para comprobar su estructura real, a veces Excel oculta formatos corruptos.</li>
                          </ul>
                        </div>
                      </div>

                      <div class="font-bold text-xs uppercase bg-red-100 p-2.5 rounded text-center text-red-700 mt-2 tracking-wide">
                        POR FAVOR REVISE EL ARCHIVO ANTES DE ENVIARLO A PROCESAR
                      </div>
                    </div>

                    <div v-if="currentStep === 1" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div class="space-y-4">
                        <div class="flex items-center justify-between">
                          <h4 class="font-bold text-text-main text-sm">Referencias de Columnas Requeridas</h4>
                          <Button variant="outline" size="sm" class="text-[11px] h-7 px-2 flex items-center gap-1.5 border-gray-300" @click="downloadTemplate">
                            <Download class="h-3.5 w-3.5" />
                            Descargar Plantilla CSV
                          </Button>
                        </div>

                        <div class="flex flex-wrap gap-1.5 pb-4 border-b border-gray-100">
                          <span v-for="col in COLUMN_HELPERS" :key="col" class="bg-gray-100 text-text-main font-medium text-[10px] px-2 py-1 rounded border border-gray-200">
                            {{ col }}
                          </span>
                        </div>
                        
                        <div class="space-y-2">
                          <label class="block text-sm font-bold text-text-main">Departamento de los Colegios</label>
                          <select v-model="selectedDepartamento" class="input-base w-full py-2 bg-white cursor-pointer text-sm">
                            <option v-for="dep in DEPARTAMENTOS" :key="dep" :value="dep">{{ dep }}</option>
                          </select>
                          <p class="text-[11px] text-text-muted">Este departamento se asignará a todos los registros del documento actual.</p>
                        </div>
                      </div>

                      <div class="space-y-4 flex flex-col justify-center">
                        <div @dragover.prevent @drop.prevent="handleFileDrop" @click="($refs.fileSelector as HTMLInputElement).click()" class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                          <input ref="fileSelector" type="file" accept=".csv" class="hidden" @change="handleFileSelect" />
                          <UploadCloud class="mx-auto h-10 w-10 text-text-muted" />
                          <p class="mt-3 text-xs font-bold text-text-main">Escoge o arrastra tu archivo CSV</p>
                        </div>
                        <div v-if="selectedFile" class="flex items-center gap-2 p-3 bg-primary-soft/30 border border-primary/20 rounded-xl">
                          <FileText class="h-6 w-6 text-primary" />
                          <span class="text-xs text-text-main truncate flex-1 font-medium">{{ selectedFile.name }}</span>
                        </div>
                        <Button variant="accent" class="w-full py-2.5 text-xs font-bold" :disabled="!selectedFile || isProcessing" @click="validateFile">
                          {{ isProcessing ? 'Analizando...' : 'Analizar Archivo' }}
                        </Button>
                      </div>
                    </div>

                    <div v-if="currentStep === 2 && validationData" class="space-y-6">
                      <div class="flex items-center justify-between p-4 bg-estado-revisado-soft/40 border border-estado-revisado/20 rounded-xl">
                        <div class="flex items-center gap-3">
                          <CheckCircle2 class="h-8 w-8 text-estado-revisado" />
                          <div>
                            <h4 class="text-sm font-bold text-text-main">Análisis Completado</h4>
                            <p class="text-xs text-text-muted">Listos para insertar: {{ validationData.total_validos }} | Errores detectados: {{ validationData.total_errores }}</p>
                          </div>
                        </div>
                        <Button v-if="validationData.csv_errores_url" variant="outline" size="sm" class="text-xs flex items-center gap-1 border-estado-rechazado/30 text-estado-rechazado" @click="downloadErrorCSV">
                          <Download class="h-3.5 w-3.5" /> Descargar CSV de Errores
                        </Button>
                      </div>

                      <div v-if="validationData.errores.length > 0" class="border border-red-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        <table class="min-w-full divide-y divide-gray-200 text-left text-[11px]">
                          <thead class="bg-red-50 text-red-700 font-bold sticky top-0">
                            <tr>
                              <th class="px-4 py-2">Fila</th>
                              <th class="px-4 py-2">Código</th>
                              <th class="px-4 py-2">Nombre</th>
                              <th class="px-4 py-2">Detalle del Error</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200 bg-white">
                            <tr v-for="(err, i) in validationData.errores" :key="i">
                              <td class="px-4 py-2 font-bold">{{ err.fila }}</td>
                              <td class="px-4 py-2">{{ err.codigo || '-' }}</td>
                              <td class="px-4 py-2">{{ err.nombre || '-' }}</td>
                              <td class="px-4 py-2 text-red-600">{{ err.error }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <Button variant="outline" size="sm" @click="currentStep = 1">Volver a subir</Button>
                        <Button variant="primary" size="sm" class="flex items-center gap-2" :disabled="validationData.validos.length === 0 || isProcessing" @click="executeDatabaseImport">
                          <Database class="h-4 w-4" /> {{ isProcessing ? 'Guardando en Base de Datos...' : `Insertar ${validationData.validos.length} Válidos` }}
                        </Button>
                      </div>
                    </div>

                    <div v-if="currentStep === 3 && dbResultData" class="py-10 text-center space-y-4">
                      <div class="h-16 w-16 mx-auto bg-estado-revisado-soft text-estado-revisado rounded-full flex items-center justify-center">
                        <CheckCircle2 class="h-10 w-10" />
                      </div>
                      <h3 class="text-xl font-bold text-text-main">¡Importación Finalizada!</h3>
                      <p class="text-sm text-text-muted">Se insertaron <b>{{ dbResultData.insertados }}</b> colegios correctamente en la base de datos.</p>
                      
                      <div v-if="dbResultData.errores.length > 0" class="mt-4 text-xs text-estado-rechazado">
                        Hubo {{ dbResultData.errores.length }} errores durante la inserción final.
                      </div>
                      
                      <div class="flex justify-center gap-3 mt-6">
                        <Button variant="primary" @click="closeWizard">Cerrar y Actualizar Tabla</Button>
                      </div>
                    </div>

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