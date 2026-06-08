<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, FileText, Download, AlertCircle, CheckCircle, RefreshCw, X, Loader2 } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { resultadosService } from '@/modules/resultados/services/resultados.service'
import type { AnalisisImportacionDTO } from '@/modules/resultados/types/resultados.api'

const props = defineProps<{
  open: boolean
  faseId: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported'): void
  (e: 'error', msg: string): void
}>()

const step = ref<'upload' | 'analisis' | 'confirmacion'>('upload')
const isDragging = ref(false)
const archivo = ref<File | null>(null)
const isAnalyzing = ref(false)
const isImporting = ref(false)
const analisis = ref<AnalisisImportacionDTO | null>(null)
const sobreescribir = ref(false)

const reset = () => {
  step.value = 'upload'
  archivo.value = null
  analisis.value = null
  sobreescribir.value = false
  isDragging.value = false
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.name.endsWith('.csv')) archivo.value = file
}

const onFileInput = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) archivo.value = file
}

const analizar = async () => {
  if (!archivo.value) return
  isAnalyzing.value = true
  try {
    const res = await resultadosService.analizarCsvFase(props.faseId, archivo.value)
    analisis.value = res.data
    step.value = 'analisis'
  } catch {
    emit('error', 'Error al analizar el CSV.')
  } finally {
    isAnalyzing.value = false
  }
}

const descargarPlantilla = () => {
  const headers = 'carnet_identidad,nota,observaciones\n'
  const blob = new Blob([headers], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_resultados.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const descargarErrores = async () => {
  if (!analisis.value?.archivo_errores) return
  try {
    const res = await resultadosService.descargarCsvErrores(analisis.value.archivo_errores, {
      responseType: 'blob',
    })
    const blob = new Blob([res as BlobPart], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = analisis.value.archivo_errores
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    emit('error', 'No se pudo descargar el archivo de errores.')
  }
}

const confirmarImport = async () => {
  if (!analisis.value?.token) return
  isImporting.value = true
  try {
    await resultadosService.importarCsvDefinitivo(props.faseId, {
      token: analisis.value.token,
      sobreescribir_existentes: sobreescribir.value,
    })
    emit('imported')
    reset()
  } catch {
    emit('error', 'Error al importar los resultados.')
  } finally {
    isImporting.value = false
  }
}

const totalValidos = computed(() => (analisis.value?.validos_nuevos.length ?? 0) + (sobreescribir.value ? (analisis.value?.existentes.length ?? 0) : 0))
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4"
  >
    <Card class="my-auto w-full max-w-4xl border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-200">
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <Upload class="h-5 w-5 text-primary" />
            Importar Resultados desde CSV
          </CardTitle>
          <Button variant="ghost" size="sm" @click="() => { reset(); emit('close') }">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent class="space-y-5 p-6">
        <div v-if="step === 'upload'" class="space-y-4">
          <div class="rounded-xl border border-info/20 bg-info/5 p-4">
            <p class="mb-2 text-sm font-bold text-slate-800">Columnas requeridas en el CSV</p>
            <div class="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" class="border-primary/20 bg-primary/5 text-primary font-mono">carnet_identidad / carnet / ci / cedula / documento / nro_documento / numero_documento</Badge>
              <Badge variant="outline" class="border-accent/20 bg-accent/5 text-accent-dark font-mono">resultado / nota / puntaje / calificacion / score</Badge>
              <Badge variant="outline" class="border-gray-300 bg-gray-100 text-slate-600 font-mono">observaciones / observacion / comentarios / obs / detalle (opcional)</Badge>
            </div>
            <Button variant="outline" size="sm" class="mt-3 flex items-center gap-2 text-xs" @click="descargarPlantilla">
              <Download class="h-3.5 w-3.5" />
              Descargar plantilla CSV
            </Button>
          </div>

          <div
            class="rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
            :class="isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
            @click="($refs.fileInput as HTMLInputElement)?.click()"
          >
            <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="onFileInput" />
            <FileText class="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p class="text-sm font-medium text-slate-800">
              {{ archivo ? archivo.name : 'Arrastra tu CSV aquí o haz clic para seleccionar' }}
            </p>
            <p v-if="!archivo" class="mt-1 text-xs text-slate-500">Solo archivos .csv</p>
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="() => { reset(); emit('close') }">Cancelar</Button>
            <Button
              variant="accent"
              class="flex items-center gap-2"
              :disabled="!archivo || isAnalyzing"
              @click="analizar"
            >
              <Loader2 v-if="isAnalyzing" class="h-4 w-4 animate-spin" />
              <RefreshCw v-else class="h-4 w-4" />
              Analizar CSV
            </Button>
          </div>
        </div>

        <div v-else-if="step === 'analisis' && analisis" class="space-y-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-xl border border-green-200 bg-green-50 p-4 text-center shadow-sm">
              <p class="text-3xl font-extrabold text-green-600">{{ analisis.validos_nuevos.length }}</p>
              <p class="mt-1 text-sm font-bold text-green-700">Válidos nuevos</p>
            </div>
            <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center shadow-sm">
              <p class="text-3xl font-extrabold text-blue-600">{{ analisis.existentes.length }}</p>
              <p class="mt-1 text-sm font-bold text-blue-700">Ya existentes</p>
            </div>
            <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-center shadow-sm">
              <p class="text-3xl font-extrabold text-red-600">{{ analisis.errores.length }}</p>
              <p class="mt-1 text-sm font-bold text-red-700">Errores</p>
            </div>
          </div>

          <div v-if="analisis.validos_nuevos.length > 0" class="space-y-2">
            <p class="text-sm font-bold text-green-700 flex items-center gap-2">
              <CheckCircle class="h-5 w-5 text-green-600" />Válidos nuevos
            </p>
            <div class="max-h-40 overflow-y-auto overflow-x-auto rounded-xl border border-green-200 shadow-sm">
              <table class="w-full text-left text-xs">
                <thead class="sticky top-0 border-b border-green-200 bg-green-100 text-green-800">
                  <tr>
                    <th class="px-4 py-3 font-bold whitespace-nowrap">CI</th>
                    <th class="px-4 py-3 font-bold whitespace-nowrap">Nota</th>
                    <th class="px-4 py-3 font-bold">Observación</th>
                  </tr>
                </thead>
                <tbody class="text-slate-700">
                  <tr v-for="row in analisis.validos_nuevos" :key="row.ci" class="border-b border-green-100 transition-colors odd:bg-white even:bg-green-50/50 hover:bg-green-100/50">
                    <td class="px-4 py-2.5 font-medium">{{ row.ci }}</td>
                    <td class="px-4 py-2.5 font-bold text-green-600">{{ row.nota }}</td>
                    <td class="px-4 py-2.5">{{ row.observaciones ?? '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="analisis.existentes.length > 0" class="space-y-2">
            <p class="text-sm font-bold text-blue-700 flex items-center gap-2">
              <AlertCircle class="h-5 w-5 text-blue-600" />Ya existentes
            </p>
            <div class="max-h-40 overflow-y-auto overflow-x-auto rounded-xl border border-blue-200 shadow-sm">
              <table class="w-full text-left text-xs">
                <thead class="sticky top-0 border-b border-blue-200 bg-blue-100 text-blue-800">
                  <tr>
                    <th class="px-4 py-3 font-bold whitespace-nowrap">CI</th>
                    <th class="px-4 py-3 font-bold whitespace-nowrap">Nota CSV</th>
                    <th class="px-4 py-3 font-bold whitespace-nowrap">Nota Actual</th>
                  </tr>
                </thead>
                <tbody class="text-slate-700">
                  <tr v-for="row in analisis.existentes" :key="row.ci" class="border-b border-blue-100 transition-colors odd:bg-white even:bg-blue-50/50 hover:bg-blue-100/50">
                    <td class="px-4 py-2.5 font-medium">{{ row.ci }}</td>
                    <td class="px-4 py-2.5 font-bold text-blue-600">{{ row.resultado_csv }}</td>
                    <td class="px-4 py-2.5 font-bold text-slate-500">{{ row.resultado_actual }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="analisis.errores.length > 0" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-red-700 flex items-center gap-2">
                <AlertCircle class="h-5 w-5 text-red-600" />Errores
              </p>
              <Button
                v-if="analisis.archivo_errores"
                variant="outline"
                size="sm"
                class="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-50"
                @click="descargarErrores"
              >
                <Download class="h-3.5 w-3.5" />
                Descargar errores CSV
              </Button>
            </div>
            <div class="max-h-40 overflow-y-auto overflow-x-auto rounded-xl border border-red-200 shadow-sm">
              <table class="w-full text-left text-xs">
                <thead class="sticky top-0 border-b border-red-200 bg-red-100 text-red-800">
                  <tr>
                    <th class="px-4 py-3 font-bold whitespace-nowrap">Fila</th>
                    <th class="px-4 py-3 font-bold whitespace-nowrap">CI</th>
                    <th class="px-4 py-3 font-bold">Error</th>
                  </tr>
                </thead>
                <tbody class="text-slate-700">
                  <tr v-for="row in analisis.errores" :key="row.fila" class="border-b border-red-100 transition-colors odd:bg-white even:bg-red-50 hover:bg-red-100/50">
                    <td class="px-4 py-2.5">{{ row.fila }}</td>
                    <td class="px-4 py-2.5 font-medium">{{ row.ci ?? '-' }}</td>
                    <td class="px-4 py-2.5 text-red-600 font-medium">{{ row.error }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 p-4 shadow-sm">
            <input
              id="sobreescribir"
              v-model="sobreescribir"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label for="sobreescribir" class="text-sm font-semibold text-slate-800 cursor-pointer select-none">
              Sobreescribir resultados existentes ({{ analisis.existentes.length }} registros)
            </label>
          </div>

          <div class="flex items-center justify-between pt-2">
            <Button variant="outline" class="flex items-center gap-2 border-gray-300 text-slate-700 hover:bg-gray-50" @click="reset">
              <RefreshCw class="h-4 w-4" />
              Nuevo archivo
            </Button>
            <div class="flex gap-2">
              <Button variant="outline" class="border-gray-300 text-slate-700 hover:bg-gray-50" @click="() => { reset(); emit('close') }">Cancelar</Button>
              <Button
                class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isImporting || (analisis.validos_nuevos.length === 0 && !sobreescribir)"
                @click="confirmarImport"
              >
                <Loader2 v-if="isImporting" class="h-4 w-4 animate-spin" />
                Importar {{ totalValidos }} registros
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>