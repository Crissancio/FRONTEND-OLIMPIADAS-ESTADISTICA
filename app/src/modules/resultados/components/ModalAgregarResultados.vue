<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Loader2, UserCheck, X, Users, Trophy, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-vue-next'
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
  paterno: string
  materno: string
  carnet_identidad: string
  nota: string
  observaciones: string
  esNuevo: boolean
}

type ModosCarga = 'todos' | 'aprobados_fase_anterior' | 'existentes'

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
  (e: 'refresh'): void
  (e: 'error', msg: string): void
}>()

const isLoading = ref(false)
const isSaving = ref(false)
const filas = ref<FilaEditable[]>([])
const modoActual = ref<ModosCarga | null>(null)

const sortKey = ref<keyof FilaEditable | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const tieneFaseAnterior = computed(() => props.idFaseAnterior !== null)
const hayNuevos = computed(() => filas.value.some((f) => f.esNuevo))

const buildFilas = (inscripciones: InscripcionDTO[]): FilaEditable[] =>
  inscripciones.map((insc) => {
    const existente = props.resultadosExistentes.find((r) => r.id_inscripcion === insc.id_inscripcion)
    const est = insc.estudiante
    return {
      id_inscripcion: insc.id_inscripcion,
      id_resultado: existente?.id_resultado ?? null,
      nombres: est?.nombres ?? '',
      paterno: est?.paterno ?? '',
      materno: est?.materno ?? '',
      carnet_identidad: est?.carnet_identidad ?? '',
      nota: existente ? String(existente.nota) : '',
      observaciones: existente?.observaciones ?? '',
      esNuevo: !existente,
    }
  })

const cargarExistentes = async () => {
  isLoading.value = true
  modoActual.value = 'existentes'
  filas.value = []
  try {
    const res = await resultadosService.listarResultados({
      id_fase_prueba: props.faseId,
      page: 1,
      limit: 500,
    })
    
    filas.value = res.data.items.map((r) => ({
      id_inscripcion: r.id_inscripcion,
      id_resultado: r.id_resultado,
      nombres: r.nombres || '',
      paterno: r.paterno || '',
      materno: r.materno || '',
      carnet_identidad: r.carnet_identidad || '', 
      nota: r.nota !== null ? String(r.nota) : '',
      observaciones: r.observaciones || '',
      esNuevo: false,
    }))
  } catch {
    emit('error', 'No se pudieron cargar los resultados existentes.')
    modoActual.value = null
  } finally {
    isLoading.value = false
  }
}

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
  if (val) {
    cargarExistentes()
  } else {
    filas.value = []
    modoActual.value = null
    sortKey.value = null
  }
})

const sortBy = (key: keyof FilaEditable) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const filasOrdenadas = computed(() => {
  if (!sortKey.value) return filas.value
  
  return [...filas.value].sort((a, b) => {
    let valA = a[sortKey.value!]
    let valB = b[sortKey.value!]

    if (valA == null) valA = ''
    if (valB == null) valB = ''


    if (sortKey.value === 'nota') {
      valA = parseFloat(valA as string) || 0
      valB = parseFloat(valB as string) || 0
    } else if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase()
      valB = valB.toLowerCase()
    }

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
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

const accionarBotonPrincipal = async () => {
  isSaving.value = true

  try {
    if (hayNuevos.value) {
      const nuevas = filas.value.filter((f) => f.esNuevo)
      
      await resultadosService.crearResultadosMasivos({
        id_fase_prueba: props.faseId,
        id_categoria: props.categoriaId,
        ids_inscripciones: nuevas.map((f) => f.id_inscripcion),
      })

      const res = await resultadosService.listarResultados({
        id_fase_prueba: props.faseId,
        page: 1,
        limit: 500,
      })

      filas.value.forEach((fila) => {
        if (fila.esNuevo) {
          const match = res.data.items.find(r => r.id_inscripcion === fila.id_inscripcion)
          if (match) {
            fila.id_resultado = match.id_resultado
            fila.esNuevo = false
          }
        }
      })

    } else {
      const existentes = filas.value.filter((f) => !f.esNuevo && f.nota !== '' && f.id_resultado !== null)

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
      emit('refresh')
      emit('close')
    }
  } catch (error) {
    emit('error', hayNuevos.value 
      ? 'Hubo un error al intentar crear los resultados.' 
      : 'No se pudieron actualizar los resultados. Por favor, intenta nuevamente.')
  } finally {
    isSaving.value = false
  }
}

const normalizarNota = (fila: FilaEditable, event: Event) => {
  fila.nota = (event.target as HTMLInputElement).value.replace(',', '.')
}

const validarNota = (fila: FilaEditable) => {
  const valor = parseFloat(fila.nota)

  if (isNaN(valor)) {
    fila.nota = ''
    return
  }

  if (valor < 0) {
    fila.nota = '0'
  } else if (valor > 100) {
    fila.nota = '100'
  } else {
    fila.nota = valor.toString()
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4"
  >
    <Card class="my-auto w-full max-w-7xl border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-200">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <UserCheck class="h-5 w-5 text-primary" />
              Agregar / Editar Resultados
            </CardTitle>
            <p class="mt-1 text-sm text-text-muted">
              Criterio de aprobación: <span class="font-bold text-primary">{{ criterioAprobacion }}</span>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" @click="cargarExistentes" class="bg-white hover:bg-gray-50">
              Ver Actuales
            </Button>
            <Button variant="not_allowed" size="sm" @click="cargarTodos" class="bg-secondary text-white hover:bg-secondary/90 border-transparent">
              <Users class="mr-1.5 h-4 w-4" /> Todos los inscritos
            </Button>
            <Button 
              variant="accent" 
              size="sm" 
              :disabled="!tieneFaseAnterior" 
              @click="cargarAprobadosFaseAnterior"
              class="bg-accent text-white hover:bg-accent/90 disabled:opacity-50 border-transparent"
            >
              <Trophy class="mr-1.5 h-4 w-4" /> Aprobados fase anterior
            </Button>
            <Button variant="ghost" size="sm" @click="emit('close')" class="ml-2">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-0">
        <div v-if="isLoading" class="flex items-center justify-center py-16">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <template v-else>
          <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
            <div class="flex items-center gap-2">
              <Badge
                variant="outline"
                :class="{
                  'border-primary/20 bg-primary/10 text-primary': modoActual === 'existentes',
                  'border-secondary/20 bg-secondary/10 text-secondary': modoActual === 'todos',
                  'border-accent/20 bg-accent/10 text-accent-dark': modoActual === 'aprobados_fase_anterior'
                }"
              >
                <UserCheck v-if="modoActual === 'existentes'" class="mr-1 h-3 w-3" />
                <Users v-else-if="modoActual === 'todos'" class="mr-1 h-3 w-3" />
                <Trophy v-else class="mr-1 h-3 w-3" />
                {{ modoActual === 'existentes' ? 'Resultados Actuales de la Fase' : (modoActual === 'todos' ? 'Todos los inscritos' : 'Aprobados fase anterior') }}
              </Badge>
              <span class="text-xs text-text-muted">{{ filas.length }} participantes</span>
            </div>
          </div>

          <div v-if="filas.length === 0" class="py-12 text-center text-sm text-text-muted">
            No hay participantes disponibles para este listado.
          </div>

          <div v-else class="max-h-[55vh] overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="sticky top-0 z-10 border-b border-gray-200 bg-white">
                <tr>
                  <th 
                    class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-50 select-none"
                    @click="sortBy('carnet_identidad')"
                  >
                    <div class="flex items-center gap-1">
                      CI
                      <ArrowUp v-if="sortKey === 'carnet_identidad' && sortOrder === 'asc'" class="h-3 w-3" />
                      <ArrowDown v-else-if="sortKey === 'carnet_identidad' && sortOrder === 'desc'" class="h-3 w-3" />
                      <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                    </div>
                  </th>
                  <th 
                    class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-50 select-none"
                    @click="sortBy('paterno')"
                  >
                    <div class="flex items-center gap-1">
                      Paterno
                      <ArrowUp v-if="sortKey === 'paterno' && sortOrder === 'asc'" class="h-3 w-3" />
                      <ArrowDown v-else-if="sortKey === 'paterno' && sortOrder === 'desc'" class="h-3 w-3" />
                      <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                    </div>
                  </th>
                  <th 
                    class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-50 select-none"
                    @click="sortBy('materno')"
                  >
                    <div class="flex items-center gap-1">
                      Materno
                      <ArrowUp v-if="sortKey === 'materno' && sortOrder === 'asc'" class="h-3 w-3" />
                      <ArrowDown v-else-if="sortKey === 'materno' && sortOrder === 'desc'" class="h-3 w-3" />
                      <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                    </div>
                  </th>
                  <th 
                    class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-50 select-none"
                    @click="sortBy('nombres')"
                  >
                    <div class="flex items-center gap-1">
                      Nombres
                      <ArrowUp v-if="sortKey === 'nombres' && sortOrder === 'asc'" class="h-3 w-3" />
                      <ArrowDown v-else-if="sortKey === 'nombres' && sortOrder === 'desc'" class="h-3 w-3" />
                      <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                    </div>
                  </th>
                  <th 
                    class="w-32 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-50 select-none"
                    @click="sortBy('nota')"
                  >
                    <div class="flex items-center gap-1">
                      Nota
                      <ArrowUp v-if="sortKey === 'nota' && sortOrder === 'asc'" class="h-3 w-3" />
                      <ArrowDown v-else-if="sortKey === 'nota' && sortOrder === 'desc'" class="h-3 w-3" />
                      <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                    </div>
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Observación</th>
                  <th 
                    class="w-24 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted cursor-pointer hover:bg-gray-50 select-none"
                    @click="sortBy('esNuevo')"
                  >
                    <div class="flex items-center gap-1">
                      Estado
                      <ArrowUp v-if="sortKey === 'esNuevo' && sortOrder === 'asc'" class="h-3 w-3" />
                      <ArrowDown v-else-if="sortKey === 'esNuevo' && sortOrder === 'desc'" class="h-3 w-3" />
                      <ArrowUpDown v-else class="h-3 w-3 opacity-30" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(fila) in filasOrdenadas"
                  :key="fila.id_inscripcion"
                  class="transition-colors"
                  :class="fila.esNuevo ? 'bg-gray-50 hover:bg-gray-100' : 'bg-yellow-50/50 hover:bg-yellow-50'"
                >
                  <td class="px-4 py-2 font-mono text-xs text-text-muted">{{ fila.carnet_identidad }}</td>
                  <td class="px-4 py-2 font-medium text-text-main">{{ fila.paterno }}</td>
                  <td class="px-4 py-2 font-medium text-text-main">{{ fila.materno }}</td>
                  <td class="px-4 py-2 font-medium text-text-main">{{ fila.nombres }}</td>
                  
                  <td class="px-4 py-2">
                    <input
                      v-model="fila.nota"
                      type="text"
                      inputmode="decimal"
                      min="0"
                      max="100"
                      step="0.01"
                      class="resultado-input h-9 w-28 rounded-lg border px-2 text-sm font-bold bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      :class="fila.nota ? notaColor(fila.nota) : 'border-gray-300'"
                      @wheel.prevent
                      @keydown="handleKeyDown($event, 'nota')"
                      @input="normalizarNota(fila, $event)"
                      oninput="this.value=this.value.slice(0,6)"
                      @blur="validarNota(fila)"
                    />
                  </td>
                  <td class="px-4 py-2">
                    <input
                      v-model="fila.observaciones"
                      type="text"
                      class="resultado-input h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      placeholder="Opcional"
                      @keydown="handleKeyDown($event, 'obs')"
                    />
                  </td>
                  <td class="px-4 py-2">
                    <Badge
                      v-if="!fila.esNuevo"
                      variant="not_allowed"
                      class="border-info/20 bg-white text-info text-xs"
                    >
                      Existente
                    </Badge>
                    <Badge
                      v-else
                      variant="not_allowed"
                      class="border-gray-300 bg-white text-text-muted text-xs"
                    >
                      Nuevo
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between border-t border-gray-200 p-4 bg-white">
            <p class="text-xs text-text-muted">
              Usa ↑ ↓ → ← para navegar. El scroll no altera las notas.
            </p>
            <div class="flex gap-2">
              <Button variant="outline" :disabled="isSaving" @click="emit('close')">Cancelar</Button>
              <Button
                variant="accent"
                class="flex items-center gap-2"
                :disabled="isSaving || filas.length === 0"
                @click="accionarBotonPrincipal"
              >
                <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
                {{ hayNuevos ? 'Crear Nuevos' : 'Guardar Resultados' }}
              </Button>
            </div>
          </div>
        </template>
      </CardContent>
    </Card>
  </div>
</template>