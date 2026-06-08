<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Search, UserPlus, Users, Loader2, Check, Building } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { estudiantesService } from '@/modules/estudiantes/services/estudiantes.service'
import { inscripcionesService } from '@/modules/inscripcion/services/inscripcion.service'
import { useInscripcionStore } from '@/modules/inscripcion/stores/inscripcion.store'
import type { EstudianteDTO, EstudianteCreateDTO, EstudianteUpdateDTO, NivelEducativo } from '@/modules/estudiantes/types/estudiantes.api'
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'

type TabModal = 'existente' | 'nuevo'

const props = defineProps<{
  open: boolean
  convocatoriaId: number
  categoriaId: number
  cursoCat: number
  nivelCat: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
  (e: 'error', msg: string): void
}>()

const tab = ref<TabModal>('existente')
const errorMessage = ref('')
const inscripcionStore = useInscripcionStore()

const extractError = (err: any, fallbackMsg: string) => {
  console.log(err)
  const responseData = err?.response?.data ?? err?.data ?? err?.details ?? null
  if (responseData) {
    errorMessage.value = responseData.error || responseData.message || responseData.detail || fallbackMsg
    return
  }
  errorMessage.value = err?.message && !err.message.includes('status code') ? err.message : fallbackMsg
}

const searchTerm = ref('')
const isSearching = ref(false)
const listaEstudiantes = ref<EstudianteDTO[]>([])
const selectedEstudiante = ref<EstudianteDTO | null>(null)
const isEditingSelected = ref(false)
const isSavingEdit = ref(false)
const isCreatingInsc = ref(false)

const editForm = ref({
  nombres: '', paterno: '', materno: '', correo: '', telefono: '', rude: '', id_colegio: null as number | null
})

let debounceTimer: ReturnType<typeof setTimeout>

const buscarEstudiantes = async () => {
  isSearching.value = true
  try {
    const res = await estudiantesService.listarEstudiantes({
      search: searchTerm.value || null,
      page: 1,
      limit: 50,
    })
    listaEstudiantes.value = res.data.items
  } catch (err) {
    extractError(err, 'No se pudo buscar estudiantes.')
  } finally {
    isSearching.value = false
  }
}

watch(() => props.open, async (val) => {
  if (val) {
    tab.value = 'existente'
    searchTerm.value = ''
    selectedEstudiante.value = null
    isEditingSelected.value = false
    errorMessage.value = ''
    buscarEstudiantes()
    
    if (!inscripcionStore.colegios || inscripcionStore.colegios.length === 0) {
      try {
        await inscripcionStore.loadColegios()
      } catch (err) {
        console.error('Error cargando colegios en el store:', err)
      }
    }
  }
})

watch(searchTerm, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(buscarEstudiantes, 200)
})

const colegioSearchEdit = ref('')
const showColegioDropdownEdit = ref(false)

const filteredColegiosEdit = computed(() => {
  if (colegioSearchEdit.value.length < 2) return []
  const search = colegioSearchEdit.value.toLowerCase()
  const deStore = inscripcionStore.colegios || []
  return deStore.filter((col: any) => col.nombre.toLowerCase().includes(search)).slice(0, 10)
})

const selectEstudiante = (est: EstudianteDTO) => {
  selectedEstudiante.value = est
  isEditingSelected.value = false
  editForm.value = {
    nombres: est.nombres,
    paterno: est.paterno,
    materno: est.materno ?? '',
    correo: est.correo ?? '',
    telefono: est.telefono ?? '',
    rude: est.rude ?? '',
    id_colegio: est.colegio?.id_colegio ?? null
  }
  colegioSearchEdit.value = est.colegio?.nombre ?? ''
}

const selectColegioEditItem = (col: any) => {
  editForm.value.id_colegio = col.id_colegio
  colegioSearchEdit.value = col.nombre
  showColegioDropdownEdit.value = false
}

const onBlurColegioEdit = () => {
  setTimeout(() => {
    showColegioDropdownEdit.value = false
  }, 200)
}

const calcEdad = (fechaNac: string) => {
  const d = new Date(fechaNac)
  const hoy = new Date()
  return hoy.getFullYear() - d.getFullYear()
}

const guardarEdicion = async () => {
  if (!selectedEstudiante.value) return
  isSavingEdit.value = true
  errorMessage.value = ''
  try {
    const payload: EstudianteUpdateDTO = {
      nombres: editForm.value.nombres.trim() || null,
      paterno: editForm.value.paterno.trim() || null,
      materno: editForm.value.materno.trim() || null,
      correo: editForm.value.correo.trim() || null,
      telefono: editForm.value.telefono.trim() || null,
      rude: editForm.value.rude.trim() || null,
      curso: props.cursoCat,
      nivel: props.nivelCat as NivelEducativo,
      id_colegio: editForm.value.id_colegio
    }
    const res = await estudiantesService.actualizarEstudiante(selectedEstudiante.value.id_estudiante, payload)
    selectedEstudiante.value = res.data
    isEditingSelected.value = false
  } catch (err) {
    extractError(err, 'No se pudo actualizar el estudiante.')
  } finally {
    isSavingEdit.value = false
  }
}

const crearInscripcionExistente = async () => {
  if (!selectedEstudiante.value) return
  isCreatingInsc.value = true
  errorMessage.value = ''
  try {
    await inscripcionesService.crearInscripcionManualAdmin({
      id_estudiante: selectedEstudiante.value.id_estudiante,
      id_convocatoria: props.convocatoriaId,
      id_categoria: props.categoriaId,
    })
    emit('created')
  } catch (err) {
    extractError(err, 'No se pudo crear la inscripción.')
  } finally {
    isCreatingInsc.value = false
  }
}

const nuevoForm = ref<EstudianteCreateDTO>({
  nombres: '', paterno: '', materno: '',
  carnet_identidad: '', fecha_nacimiento: '',
  curso: props.cursoCat, nivel: props.nivelCat as NivelEducativo,
  rude: '', telefono: '', correo: '', id_colegio: 0,
})

const fechaNacimientoV = ref<Date | null>(null)
const defaultDatePage = computed(() => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear() - 14
}))

watch(fechaNacimientoV, (val) => {
  if (val) {
    const tzOffset = val.getTimezoneOffset() * 60000
    const localISOTime = (new Date(val.getTime() - tzOffset)).toISOString().split('T')[0]
    nuevoForm.value.fecha_nacimiento = localISOTime
  } else {
    nuevoForm.value.fecha_nacimiento = ''
  }
})

const isCreatingNuevo = ref(false)
const colegioSearchNuevo = ref('')
const showColegioDropdownNuevo = ref(false)

const filteredColegiosNuevo = computed(() => {
  if (colegioSearchNuevo.value.length < 2) return []
  const search = colegioSearchNuevo.value.toLowerCase()
  const deStore = inscripcionStore.colegios || []
  return deStore.filter((col: any) => col.nombre.toLowerCase().includes(search)).slice(0, 10)
})

const selectColegioNuevoItem = (col: any) => {
  nuevoForm.value.id_colegio = col.id_colegio
  colegioSearchNuevo.value = col.nombre
  showColegioDropdownNuevo.value = false
}

const onBlurColegioNuevo = () => {
  setTimeout(() => {
    showColegioDropdownNuevo.value = false
  }, 200)
}

const crearNuevoYInscribir = async () => {
  isCreatingNuevo.value = true
  errorMessage.value = ''
  try {
    const payload = {
      ...nuevoForm.value,
      curso: props.cursoCat,
      nivel: props.nivelCat as NivelEducativo,
      materno: nuevoForm.value.materno || null,
      rude: nuevoForm.value.rude || null,
      telefono: nuevoForm.value.telefono || null,
      correo: nuevoForm.value.correo || null,
    }
    const res = await estudiantesService.crearEstudiante(payload)
    await inscripcionesService.crearInscripcionManualAdmin({
      id_estudiante: res.data.id_estudiante,
      id_convocatoria: props.convocatoriaId,
      id_categoria: props.categoriaId,
    })
    emit('created')
  } catch (err) {
    extractError(err, 'No se pudo crear el estudiante o la inscripción.')
  } finally {
    isCreatingNuevo.value = false
  }
}

const inputClass = 'h-10 w-full rounded-lg border border-gray-300 px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:bg-gray-50 disabled:text-text-muted disabled:cursor-not-allowed'
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4"
  >
    <Card class="my-auto w-full max-w-3xl border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-200">
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <UserPlus class="h-5 w-5 text-primary" />
            Nueva Inscripción
          </CardTitle>
          <Button variant="ghost" size="sm" @click="emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent class="p-0">
        <div v-if="errorMessage" class="mx-5 mt-4 rounded-xl border border-error/20 bg-error/10 px-4 py-2.5 text-sm text-error flex justify-between items-center">
          <span>{{ errorMessage }}</span>
          <button class="ml-2 font-bold hover:opacity-70" @click="errorMessage = ''">✕</button>
        </div>

        <div class="flex border-b border-gray-200 px-4 pt-2 gap-1 bg-gray-50/50">
          <button
            class="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-300"
            :class="tab === 'existente' ? 'bg-primary text-white rounded-tl-xl rounded-tr-xl border-t border-x border-gray-200/30' : 'text-text-muted hover:bg-gray-100 rounded-tl-xl rounded-tr-xl'"
            @click="tab = 'existente'"
          >
            <Users class="h-4 w-4" />
            Estudiante existente
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-300"
            :class="tab === 'nuevo' ? 'bg-primary text-white rounded-tl-xl rounded-tr-xl border-t border-x border-gray-200/30' : 'text-text-muted hover:bg-gray-100 rounded-tl-xl rounded-tr-xl'"
            @click="tab = 'nuevo'"
          >
            <UserPlus class="h-4 w-4" />
            Crear estudiante nuevo
          </button>
        </div>

        <transition name="fade-tabs" mode="out-in">
          <div v-if="tab === 'existente'" key="existente" class="space-y-4 p-5">
            <div class="relative">
              <Search class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
              <input
                v-model="searchTerm"
                class="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                :placeholder="`Buscar por nombre, apellido o carnet (${cursoCat}° ${nivelCat})`"
              />
            </div>

            <div class="max-h-52 space-y-2 overflow-y-auto">
              <div v-if="isSearching" class="flex justify-center py-6">
                <Loader2 class="h-6 w-6 animate-spin text-primary" />
              </div>
              <div v-else-if="listaEstudiantes.length === 0" class="py-6 text-center text-sm text-text-muted">
                No se encontraron estudiantes.
              </div>
              <div
                v-for="est in listaEstudiantes"
                :key="est.id_estudiante"
                class="flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all"
                :class="selectedEstudiante?.id_estudiante === est.id_estudiante
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'"
                @click="selectEstudiante(est)"
              >
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-secondary to-secondary-dark text-xs font-bold text-white">
                    {{ est.nombres.charAt(0) }}{{ est.paterno.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-text-main">{{ est.nombres }} {{ est.paterno }} {{ est.materno }}</p>
                    <div class="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                      <span class="font-mono">{{ est.carnet_identidad }}</span>
                      <span>·</span>
                      <span>{{ est.colegio?.nombre ?? 'Sin colegio' }}</span>
                      <span>·</span>
                      <span>{{ calcEdad(est.fecha_nacimiento) }} años</span>
                    </div>
                  </div>
                </div>
                <Check v-if="selectedEstudiante?.id_estudiante === est.id_estudiante" class="h-4 w-4 text-primary" />
              </div>
            </div>

            <div v-if="selectedEstudiante" class="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div class="flex items-center justify-between">
                <p class="text-sm font-bold text-primary">Estudiante seleccionado</p>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-xs"
                  @click="isEditingSelected = !isEditingSelected"
                >
                  {{ isEditingSelected ? 'Cancelar edición' : 'Editar datos' }}
                </Button>
              </div>

              <div v-if="isEditingSelected" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">Nombres</label>
                  <input v-model="editForm.nombres" :class="inputClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">Paterno</label>
                  <input v-model="editForm.paterno" :class="inputClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">Materno</label>
                  <input v-model="editForm.materno" :class="inputClass" />
                </div>
                <div class="relative sm:col-span-2">
                  <label class="mb-1 block text-xs font-bold text-text-muted">Colegio</label>
                  <div class="relative">
                    <Building class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
                    <input
                      v-model="colegioSearchEdit"
                      class="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      placeholder="Buscar colegio por nombre..."
                      @focus="showColegioDropdownEdit = true"
                      @blur="onBlurColegioEdit"
                    />
                  </div>
                  <div v-if="showColegioDropdownEdit && filteredColegiosEdit.length > 0" class="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg max-h-48 overflow-y-auto">
                    <div
                      v-for="col in filteredColegiosEdit"
                      :key="col.id_colegio"
                      class="cursor-pointer px-4 py-2 text-sm hover:bg-gray-50"
                      @mousedown.prevent="selectColegioEditItem(col)"
                    >
                      <p class="font-medium text-text-main">{{ col.nombre }}</p>
                      <p class="text-xs text-text-muted">{{ col.municipio || 'Sin municipio' }}</p><p class="text-xs text-gray-500 font-extrabold">{{ col.turno }}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">Curso (Bloqueado por Categoría)</label>
                  <input :value="props.cursoCat" disabled :class="inputClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">Nivel (Bloqueado por Categoría)</label>
                  <input :value="props.nivelCat" disabled :class="inputClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">Correo</label>
                  <input v-model="editForm.correo" type="email" :class="inputClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">Teléfono</label>
                  <input v-model="editForm.telefono" :class="inputClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">RUDE</label>
                  <input v-model="editForm.rude" :class="inputClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">CI (no editable)</label>
                  <input :value="selectedEstudiante.carnet_identidad" disabled :class="inputClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-text-muted">Nacimiento (no editable)</label>
                  <input :value="selectedEstudiante.fecha_nacimiento" disabled :class="inputClass" />
                </div>
                <div class="sm:col-span-2 flex justify-end">
                  <Button
                    class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark text-sm"
                    :disabled="isSavingEdit"
                    @click="guardarEdicion"
                  >
                    <Loader2 v-if="isSavingEdit" class="h-4 w-4 animate-spin" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <Button variant="outline" @click="emit('close')">Cancelar</Button>
              <Button
                class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark"
                :disabled="!selectedEstudiante || isCreatingInsc"
                @click="crearInscripcionExistente"
              >
                <Loader2 v-if="isCreatingInsc" class="h-4 w-4 animate-spin" />
                Inscribir estudiante
              </Button>
            </div>
          </div>

          <div v-else key="nuevo" class="space-y-4 p-5">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Nombres *</label>
                <input v-model="nuevoForm.nombres" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Apellido paterno *</label>
                <input v-model="nuevoForm.paterno" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Apellido materno</label>
                <input v-model="nuevoForm.materno" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Carnet identidad *</label>
                <input v-model="nuevoForm.carnet_identidad" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Fecha nacimiento *</label>
                <VDatePicker
                  v-model="fechaNacimientoV"
                  :default-page="defaultDatePage"
                  color="blue"
                >
                  <template #default="{ inputValue, inputEvents }">
                    <input
                      class="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 bg-white"
                      :value="inputValue"
                      v-on="inputEvents"
                      placeholder="Seleccionar fecha"
                      readonly
                    />
                  </template>
                </VDatePicker>
              </div>
              <div class="relative sm:col-span-1">
                <label class="mb-1 block text-xs font-bold text-text-muted">Colegio *</label>
                <div class="relative">
                  <Building class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-text-muted" />
                  <input
                    v-model="colegioSearchNuevo"
                    class="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    placeholder="Buscar colegio..."
                    @focus="showColegioDropdownNuevo = true"
                    @blur="onBlurColegioNuevo"
                  />
                </div>
                <div v-if="showColegioDropdownNuevo && filteredColegiosNuevo.length > 0" class="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg max-h-48 overflow-y-auto">
                  <div
                    v-for="col in filteredColegiosNuevo"
                    :key="col.id_colegio"
                    class="cursor-pointer px-4 py-2 text-sm hover:bg-gray-50"
                    @mousedown.prevent="selectColegioNuevoItem(col)"
                  >
                    <p class="font-medium text-text-main">{{ col.nombre }}</p>
                    <p class="text-xs text-text-muted">{{ col.municipio || 'Sin municipio' }}</p><p class="text-xs text-gray-500 font-extrabold">{{ col.turno }}</p>
                  </div>
                </div>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Curso (Bloqueado por Categoría)</label>
                <input :value="props.cursoCat" disabled :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Nivel (Bloqueado por Categoría)</label>
                <input :value="props.nivelCat" disabled :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Correo</label>
                <input v-model="nuevoForm.correo" type="email" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">Teléfono</label>
                <input v-model="nuevoForm.telefono" :class="inputClass" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-text-muted">RUDE</label>
                <input v-model="nuevoForm.rude" :class="inputClass" />
              </div>
            </div>

            <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <Button variant="outline" @click="emit('close')">Cancelar</Button>
              <Button
                class="flex items-center gap-2 bg-primary text-white hover:bg-primary-dark"
                :disabled="isCreatingNuevo"
                @click="crearNuevoYInscribir"
              >
                <Loader2 v-if="isCreatingNuevo" class="h-4 w-4 animate-spin" />
                Crear e inscribir
              </Button>
            </div>
          </div>
        </transition>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.fade-tabs-enter-active,
.fade-tabs-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-tabs-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.fade-tabs-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>