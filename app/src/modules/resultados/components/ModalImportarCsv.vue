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
            <p class="mb-2 text-sm font-bold text-text-main">Columnas requeridas en el CSV</p>
            <div class="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" class="border-primary/20 bg-primary/5 text-primary font-mono">carnet_identidad / carnet / ci / cedula / documento / nro_documento / numero_documento</Badge>
              <Badge variant="outline" class="border-accent/20 bg-accent/5 text-accent-dark font-mono">resultado / nota / puntaje / calificacion / score</Badge>
              <Badge variant="outline" class="border-gray-300 bg-gray-100 text-text-muted font-mono">observaciones / observacion / comentarios / obs / detalle (opcional)</Badge>
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
            <FileText class="mx-auto mb-3 h-10 w-10 text-text-muted" />
            <p class="text-sm font-medium text-text-main">
              {{ archivo ? archivo.name : 'Arrastra tu CSV aquí o haz clic para seleccionar' }}
            </p>
            <p v-if="!archivo" class="mt-1 text-xs text-text-muted">Solo archivos .csv</p>
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
            <div class="rounded-xl border border-success/20 bg-success/10 p-3 text-center">
              <p class="text-2xl font-bold text-success">{{ analisis.validos_nuevos.length }}</p>
              <p class="text-xs font-medium text-success">Válidos nuevos</p>
            </div>
            <div class="rounded-xl border border-info/20 bg-info/10 p-3 text-center">
              <p class="text-2xl font-bold text-secondary">{{ analisis.existentes.length }}</p>
              <p class="text-xs font-medium text-secondary">Ya existentes</p>
            </div>
            <div class="rounded-xl border border-error/20 bg-error/10 p-3 text-center">
              <p class="text-2xl font-bold text-error">{{ analisis.errores.length }}</p>
              <p class="text-xs font-medium text-error">Errores</p>
            </div>
          </div>

          <div v-if="analisis.validos_nuevos.length > 0" class="space-y-2">
            <p class="text-sm font-bold text-text-main flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-success" />Válidos nuevos
            </p>
            <div class="max-h-40 overflow-y-auto rounded-xl border border-gray-200">
              <table class="w-full text-xs">
                <thead class="sticky top-0 bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-text-muted">CI</th>
                    <th class="px-3 py-2 text-left text-text-muted">Nota</th>
                    <th class="px-3 py-2 text-left text-text-muted">Observación</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in analisis.validos_nuevos" :key="row.ci">
                    <td class="px-3 py-1.5 font-mono">{{ row.ci }}</td>
                    <td class="px-3 py-1.5 font-bold">{{ row.nota }}</td>
                    <td class="px-3 py-1.5 text-text-muted">{{ row.observaciones ?? '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="analisis.existentes.length > 0" class="space-y-2">
            <p class="text-sm font-bold text-text-main flex items-center gap-2">
              <AlertCircle class="h-4 w-4 text-secondary" />Ya existentes
            </p>
            <div class="max-h-40 overflow-y-auto rounded-xl border border-gray-200">
              <table class="w-full text-xs">
                <thead class="sticky top-0 bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-text-muted">CI</th>
                    <th class="px-3 py-2 text-left text-text-muted">Nota CSV</th>
                    <th class="px-3 py-2 text-left text-text-muted">Nota Actual</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in analisis.existentes" :key="row.ci">
                    <td class="px-3 py-1.5 font-mono">{{ row.ci }}</td>
                    <td class="px-3 py-1.5 font-bold text-accent-dark">{{ row.resultado_csv }}</td>
                    <td class="px-3 py-1.5 font-bold text-primary">{{ row.resultado_actual }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="analisis.errores.length > 0" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-text-main flex items-center gap-2">
                <AlertCircle class="h-4 w-4 text-error" />Errores
              </p>
              <Button
                v-if="analisis.archivo_errores"
                variant="outline"
                size="sm"
                class="flex items-center gap-1.5 text-xs"
                @click="descargarErrores"
              >
                <Download class="h-3.5 w-3.5" />
                Descargar errores CSV
              </Button>
            </div>
            <div class="max-h-40 overflow-y-auto rounded-xl border border-error/20 bg-error/5">
              <table class="w-full text-xs">
                <thead class="sticky top-0 bg-error/10">
                  <tr>
                    <th class="px-3 py-2 text-left text-error">Fila</th>
                    <th class="px-3 py-2 text-left text-error">CI</th>
                    <th class="px-3 py-2 text-left text-error">Error</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-error/10">
                  <tr v-for="row in analisis.errores" :key="row.fila">
                    <td class="px-3 py-1.5 font-mono">{{ row.fila }}</td>
                    <td class="px-3 py-1.5 font-mono">{{ row.ci ?? '-' }}</td>
                    <td class="px-3 py-1.5 text-error">{{ row.error }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="flex items-center gap-2 rounded-xl border border-warning/20 bg-warning/10 p-3">
            <input
              id="sobreescribir"
              v-model="sobreescribir"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-primary"
            />
            <label for="sobreescribir" class="text-sm font-medium text-text-main cursor-pointer">
              Sobreescribir resultados existentes ({{ analisis.existentes.length }} registros)
            </label>
          </div>

          <div class="flex items-center justify-between">
            <Button variant="outline" class="flex items-center gap-2" @click="reset">
              <RefreshCw class="h-4 w-4" />
              Nuevo archivo
            </Button>
            <div class="flex gap-2">
              <Button variant="outline" @click="() => { reset(); emit('close') }">Cancelar</Button>
              <Button
                class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark"
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