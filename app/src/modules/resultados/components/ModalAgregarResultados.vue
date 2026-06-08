<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Loader2, UserCheck, X, Users, Trophy } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import { inscripcionesService } from '@/modules/inscripcion/services/inscripcion.service'
import { resultadosService } from '@/modules/resultados/services/resultados.service'
import type { InscripcionDTO } from '@/modules/inscripcion/types/inscripcion.api'
import type { ResultadoDTO, ResultadoMasivoUpdateItemDTO } from '@/modules/resultados/types/resultados.api'

interface FilaEditable {
  id_inscripcion: number
  id_resultado: number | null
  nombres: string
  apellidos: string
  carnet: string
  nota: string
  observaciones: string
  esNuevo: boolean
}

type ModosCarga = 'todos' | 'aprobados_fase_anterior'

const props = defineProps<{
  open: boolean
  faseId: number
  categoriaId: number
  idFaseAnterior: number | null
  criterioAprobacion: number
  resultadosExistentes: ResultadoDTO[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
  (e: 'error', msg: string): void
}>()

const isLoading = ref(false)
const isSaving = ref(false)
const filas = ref<FilaEditable[]>([])
const modoActual = ref<ModosCarga | null>(null)

const tieneFaseAnterior = computed(() => props.idFaseAnterior !== null)

const buildFilas = (inscripciones: InscripcionDTO[]): FilaEditable[] =>
  inscripciones.map((insc) => {
    const existente = props.resultadosExistentes.find((r) => r.id_inscripcion === insc.id_inscripcion)
    const est = insc.estudiante
    return {
      id_inscripcion: insc.id_inscripcion,
      id_resultado: existente?.id_resultado ?? null,
      nombres: est?.nombres ?? '',
      apellidos: [est?.paterno, est?.materno].filter(Boolean).join(' '),
      carnet: est?.carnet_identidad ?? '',
      nota: existente ? String(existente.nota) : '',
      observaciones: existente?.observaciones ?? '',
      esNuevo: !existente,
    }
  })

const cargarTodos = async () => {
  isLoading.value = true
  modoActual.value = 'todos'
  filas.value = []
  try {
    const res = await inscripcionesService.listarInscripciones({
      id_categoria: props.categoriaId,
      estado: 'APROBADO',
      page: 1,
      limit: 500,
    })
    filas.value = buildFilas(res.data.items)
  } catch {
    emit('error', 'No se pudo cargar la lista de inscritos.')
    modoActual.value = null
  } finally {
    isLoading.value = false
  }
}

const cargarAprobadosFaseAnterior = async () => {
  if (!props.idFaseAnterior) return
  isLoading.value = true
  modoActual.value = 'aprobados_fase_anterior'
  filas.value = []
  try {
    const aprobadosRes = await resultadosService.listarAprobadosPorFase(props.idFaseAnterior)
    const inscripcionIds = aprobadosRes.data.map((a) => a.id_inscripcion)
    const allRes = await inscripcionesService.listarInscripciones({
      id_categoria: props.categoriaId,
      page: 1,
      limit: 500,
    })
    const filtrados = allRes.data.items.filter((i) => inscripcionIds.includes(i.id_inscripcion))
    filas.value = buildFilas(filtrados)
  } catch {
    emit('error', 'No se pudo cargar los aprobados de la fase anterior.')
    modoActual.value = null
  } finally {
    isLoading.value = false
  }
}

watch(() => props.open, (val) => {
  if (!val) {
    filas.value = []
    modoActual.value = null
  }
})

const notaColor = (nota: string) => {
  const n = parseFloat(nota)
  if (isNaN(n)) return ''
  return n >= props.criterioAprobacion
    ? 'border-success bg-success/5 text-success'
    : 'border-error bg-error/5 text-error'
}

const handleKeyDown = (event: KeyboardEvent, campo: 'nota' | 'obs') => {
  const inputs = document.querySelectorAll<HTMLInputElement>('.resultado-input')
  const currentIdx = Array.from(inputs).indexOf(event.target as HTMLInputElement)
  if (currentIdx === -1) return

  if (event.key === 'ArrowDown' || event.key === 'Enter') {
    event.preventDefault()
    const next = inputs[currentIdx + 2]
    if (next) next.focus()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const prev = inputs[currentIdx - 2]
    if (prev) prev.focus()
  } else if (event.key === 'ArrowRight' && campo === 'nota') {
    event.preventDefault()
    const next = inputs[currentIdx + 1]
    if (next) next.focus()
  } else if (event.key === 'ArrowLeft' && campo === 'obs') {
    event.preventDefault()
    const prev = inputs[currentIdx - 1]
    if (prev) prev.focus()
  }
}

const save = async () => {
  isSaving.value = true
  try {
    const nuevas = filas.value.filter((f) => f.esNuevo && f.nota !== '')
    const existentes = filas.value.filter((f) => !f.esNuevo && f.nota !== '' && f.id_resultado !== null)

    if (nuevas.length > 0) {
      await resultadosService.crearResultadosMasivos({
        id_fase_prueba: props.faseId,
        id_categoria: props.categoriaId,
        ids_inscripciones: nuevas.map((f) => f.id_inscripcion),
      })
    }

    if (existentes.length > 0) {
      const items: ResultadoMasivoUpdateItemDTO[] = existentes.map((f) => ({
        id_resultado: f.id_resultado!,
        nota: parseFloat(f.nota),
        observaciones: f.observaciones || null,
      }))
      await resultadosService.actualizarResultadosMasivos({
        id_fase_prueba: props.faseId,
        resultados: items,
      })
    }

    emit('saved')
  } catch {
    emit('error', 'No se pudieron guardar los resultados.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4"
  >
    <Card class="my-auto w-full max-w-5xl border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-200">
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <UserCheck class="h-5 w-5 text-primary" />
            Agregar / Editar Resultados
          </CardTitle>
          <Button variant="ghost" size="sm" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </div>
        <p class="mt-1 text-sm text-text-muted">
          Criterio de aprobación: <span class="font-bold text-primary">{{ criterioAprobacion }}</span>
        </p>
      </CardHeader>

      <CardContent class="p-0">
        <div v-if="modoActual === null && !isLoading" class="space-y-4 p-6">
          <p class="text-sm font-medium text-text-main">¿Desde qué listado quieres cargar los participantes?</p>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              class="flex flex-col items-start gap-2 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-soft"
              @click="cargarTodos"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-secondary-dark">
                <Users class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="font-bold text-text-main">Todos los inscritos</p>
                <p class="mt-0.5 text-xs text-text-muted">Carga todos los participantes aprobados de la categoría.</p>
              </div>
            </button>

            <button
              class="flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all"
              :class="tieneFaseAnterior
                ? 'border-gray-200 bg-white hover:border-accent/50 hover:bg-accent/5 hover:shadow-soft cursor-pointer'
                : 'border-dashed border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'"
              :disabled="!tieneFaseAnterior"
              @click="tieneFaseAnterior && cargarAprobadosFaseAnterior()"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg"
                :class="tieneFaseAnterior ? 'bg-gradient-to-br from-accent to-accent-dark' : 'bg-gray-200'"
              >
                <Trophy class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="font-bold text-text-main">Aprobados de fase anterior</p>
                <p class="mt-0.5 text-xs text-text-muted">
                  {{ tieneFaseAnterior
                    ? 'Carga solo los participantes que aprobaron la fase previa.'
                    : 'Esta fase no tiene una fase anterior configurada.' }}
                </p>
              </div>
              <Badge
                v-if="!tieneFaseAnterior"
                variant="outline"
                class="border-gray-300 bg-gray-100 text-text-muted text-xs"
              >
                No disponible
              </Badge>
            </button>
          </div>
        </div>

        <div v-else-if="isLoading" class="flex items-center justify-center py-16">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <template v-else>
          <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
            <div class="flex items-center gap-2">
              <Badge
                variant="outline"
                :class="modoActual === 'todos'
                  ? 'border-secondary/20 bg-secondary/10 text-secondary'
                  : 'border-accent/20 bg-accent/10 text-accent-dark'"
              >
                <Users v-if="modoActual === 'todos'" class="mr-1 h-3 w-3" />
                <Trophy v-else class="mr-1 h-3 w-3" />
                {{ modoActual === 'todos' ? 'Todos los inscritos' : 'Aprobados fase anterior' }}
              </Badge>
              <span class="text-xs text-text-muted">{{ filas.length }} participantes</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="text-xs text-text-muted hover:text-primary"
              @click="() => { filas = []; modoActual = null }"
            >
              Cambiar listado
            </Button>
          </div>

          <div v-if="filas.length === 0" class="py-12 text-center text-sm text-text-muted">
            No hay participantes disponibles para este listado.
          </div>

          <div v-else class="max-h-[55vh] overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Estudiante</th>
                  <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">CI</th>
                  <th class="w-32 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Nota</th>
                  <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Observación</th>
                  <th class="w-24 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(fila, idx) in filas"
                  :key="fila.id_inscripcion"
                  class="transition-colors hover:bg-gray-50"
                >
                  <td class="px-4 py-2 font-medium text-text-main">
                    {{ fila.nombres }} {{ fila.apellidos }}
                  </td>
                  <td class="px-4 py-2 font-mono text-xs text-text-muted">{{ fila.carnet }}</td>
                  <td class="px-4 py-2">
                    <input
                      v-model="fila.nota"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      class="resultado-input h-9 w-28 rounded-lg border px-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      :class="fila.nota ? notaColor(fila.nota) : 'border-gray-300'"
                      @wheel.prevent
                      @keydown="handleKeyDown($event, 'nota')"
                    />
                  </td>
                  <td class="px-4 py-2">
                    <input
                      v-model="fila.observaciones"
                      type="text"
                      class="resultado-input h-9 w-full rounded-lg border border-gray-300 px-2 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      placeholder="Opcional"
                      @keydown="handleKeyDown($event, 'obs')"
                    />
                  </td>
                  <td class="px-4 py-2">
                    <Badge
                      v-if="!fila.esNuevo"
                      variant="outline"
                      class="border-info/20 bg-info/10 text-info text-xs"
                    >
                      Existente
                    </Badge>
                    <Badge
                      v-else
                      variant="outline"
                      class="border-success/20 bg-success/10 text-success text-xs"
                    >
                      Nuevo
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between border-t border-gray-200 p-4">
            <p class="text-xs text-text-muted">
              Usa ↑ ↓ → ← para navegar. El scroll no altera las notas.
            </p>
            <div class="flex gap-2">
              <Button variant="outline" :disabled="isSaving" @click="emit('close')">Cancelar</Button>
              <Button
                variant="accent"
                class="flex items-center gap-2"
                :disabled="isSaving || filas.length === 0"
                @click="save"
              >
                <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
                Guardar Resultados
              </Button>
            </div>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>