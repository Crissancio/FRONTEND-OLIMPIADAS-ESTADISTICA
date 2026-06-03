<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Edit, Save, X, Settings, Image as ImageIcon, FileText, Upload, Eye, Check } from 'lucide-vue-next'
import { useConvocatoriasStore } from '@/modules/convocatorias/stores/convocatorias.store'
import { useMaterialesStore } from '@/modules/material/stores/material.store'
import type { ConvocatoriaDTO } from '@/modules/convocatorias/types/convocatorias.api'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardHeader from '@/shared/components/ui/molecules/CardHeader.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import CardTitle from '@/shared/components/ui/atoms/CardTitle.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{ convocatoria: ConvocatoriaDTO }>()
const convocatoriasStore = useConvocatoriasStore()
const materialesStore = useMaterialesStore()

const isEditingData = ref(false)
const isEditingFiles = ref(false)

// Estado del Formulario General
const form = ref({
  nombre: props.convocatoria.nombre_convocatoria,
  gestion: props.convocatoria.gestion,
  montoInscripcion: props.convocatoria.monto_inscripcion || '',
  descripcion: props.convocatoria.descripcion || '',
  inicioOlimpiada: props.convocatoria.inicio_olimpiadas,
  finOlimpiada: props.convocatoria.fin_olimpiadas,
  inicioInscripcion: props.convocatoria.fecha_inicio_inscripcion,
  finInscripcion: props.convocatoria.fecha_fin_inscripcion,
})

onMounted(() => {
  materialesStore.fetchMateriales()
})

// === LÓGICA DEL CALENDARIO ORIGINAL (VCalendar) ===
const startOfDay = (date: Date) => { const next = new Date(date); next.setHours(0, 0, 0, 0); return next }
const endOfDay = (date: Date) => { const next = new Date(date); next.setHours(23, 59, 59, 999); return next }
const parseDateOnly = (val: string | null | undefined) => {
  if (!val) return null
  const [datePart] = val.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}
const parseDateTime = (val: string | null | undefined) => {
  if (!val) return null
  const normalized = val.length === 10 ? `${val}T00:00:00` : val
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}
const toDateInputValue = (date: Date | null) => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const toDateTimeInputValue = (date: Date | null) => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const minEditInicioOlimpiada = computed(() => startOfDay(new Date()))

const editInicioOlimpiadaDate = computed({
  get: () => parseDateOnly(form.value.inicioOlimpiada),
  set: (date: Date | null) => {
    form.value.inicioOlimpiada = toDateInputValue(date)
    if (!date) { form.value.finOlimpiada = null; form.value.inicioInscripcion = null; form.value.finInscripcion = null; return }
    const fin = parseDateOnly(form.value.finOlimpiada)
    if (fin && startOfDay(fin) < startOfDay(date)) form.value.finOlimpiada = null
  }
})
const editFinOlimpiadaDate = computed({
  get: () => parseDateOnly(form.value.finOlimpiada),
  set: (date: Date | null) => {
    form.value.finOlimpiada = toDateInputValue(date)
    if (!date) { form.value.inicioInscripcion = null; form.value.finInscripcion = null; return }
    const max = endOfDay(date)
    const inicioInscripcion = parseDateTime(form.value.inicioInscripcion)
    const finInscripcion = parseDateTime(form.value.finInscripcion)
    if (inicioInscripcion && inicioInscripcion > max) form.value.inicioInscripcion = null
    if (finInscripcion && finInscripcion > max) form.value.finInscripcion = null
  }
})
const editInicioInscripcionDate = computed({
  get: () => parseDateTime(form.value.inicioInscripcion),
  set: (date: Date | null) => {
    form.value.inicioInscripcion = toDateTimeInputValue(date)
    if (!date) { form.value.finInscripcion = null; return }
    const fin = parseDateTime(form.value.finInscripcion)
    if (fin && fin < date) form.value.finInscripcion = null
  }
})
const editFinInscripcionDate = computed({
  get: () => parseDateTime(form.value.finInscripcion),
  set: (date: Date | null) => { form.value.finInscripcion = toDateTimeInputValue(date) }
})

const minEditFinOlimpiada = computed(() => editInicioOlimpiadaDate.value ? startOfDay(editInicioOlimpiadaDate.value) : undefined)
const minEditInscripcion = computed(() => editInicioOlimpiadaDate.value ? startOfDay(editInicioOlimpiadaDate.value) : undefined)
const maxEditInscripcion = computed(() => editFinOlimpiadaDate.value ? endOfDay(editFinOlimpiadaDate.value) : undefined)
const minEditFinInscripcion = computed(() => editInicioInscripcionDate.value ?? minEditInscripcion.value)

function cancelDataEdit() {
  form.value = {
    nombre: props.convocatoria.nombre_convocatoria,
    gestion: props.convocatoria.gestion,
    montoInscripcion: props.convocatoria.monto_inscripcion || '',
    descripcion: props.convocatoria.descripcion || '',
    inicioOlimpiada: props.convocatoria.inicio_olimpiadas,
    finOlimpiada: props.convocatoria.fin_olimpiadas,
    inicioInscripcion: props.convocatoria.fecha_inicio_inscripcion,
    finInscripcion: props.convocatoria.fecha_fin_inscripcion,
  }
  isEditingData.value = false
}

async function saveData() {
  const montoRaw = typeof form.value.montoInscripcion === 'number' ? String(form.value.montoInscripcion) : String(form.value.montoInscripcion || '').trim()
  const montoParsed = montoRaw ? Number(montoRaw) : NaN
  const finalMonto = Number.isFinite(montoParsed) && montoParsed >= 0 ? montoParsed : null

  await convocatoriasStore.updateConvocatoria(props.convocatoria.id_convocatoria, {
    nombre_convocatoria: form.value.nombre,
    gestion: Number(form.value.gestion),
    monto_inscripcion: finalMonto,
    descripcion: form.value.descripcion,
    inicio_olimpiadas: form.value.inicioOlimpiada,
    fin_olimpiadas: form.value.finOlimpiada,
    fecha_inicio_inscripcion: form.value.inicioInscripcion,
    fecha_fin_inscripcion: form.value.finInscripcion
  })
  isEditingData.value = false
}

// === NUEVA / RESTAURADA LÓGICA DE CONTROL DE ARCHIVOS PRINCIPALES ===
const isDocumentModalOpen = ref(false)
const documentModalTab = ref<'nuevo' | 'existente'>('nuevo')
const documentModifying = ref<'AFICHE' | 'REGLAMENTO' | 'CONVOCATORIA' | null>(null)
const attachedFile = ref<File | null>(null)
const selectedArchivoExistenteId = ref<number | null>(null)

const afiche = computed(() => materialesStore.materiales.find(m => m.tipo_material === 'AFICHE'))
const reglamento = computed(() => materialesStore.materiales.find(m => m.tipo_material === 'REGLAMENTO'))
const convocatoriaPdf = computed(() => materialesStore.materiales.find(m => m.tipo_material === 'CONVOCATORIA'))

// Filtrar dinámicamente los materiales de la base de datos según el tipo que se está editando
const filteredMaterialesExistentes = computed(() => {
  if (!documentModifying.value) return []
  return materialesStore.materiales.filter(m => m.tipo_material === documentModifying.value)
})

function openDocumentModal(tipo: 'AFICHE' | 'REGLAMENTO' | 'CONVOCATORIA') {
  documentModifying.value = tipo
  attachedFile.value = null
  selectedArchivoExistenteId.value = null
  documentModalTab.value = 'nuevo' // Por defecto abre en "subir nuevo"
  isDocumentModalOpen.value = true
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) attachedFile.value = target.files[0]
}

async function saveArchivosRequeridos() {
  if (!documentModifying.value) return

  if (documentModalTab.value === 'nuevo') {
    // Escenario 1: Subir un archivo nuevo desde la computadora
    if (!attachedFile.value) return
    await materialesStore.createPrincipal({
      id_convocatoria: props.convocatoria.id_convocatoria,
      tipo_material: documentModifying.value,
      nombre_material: `${documentModifying.value} - ${props.convocatoria.nombre_convocatoria}`,
      file: attachedFile.value
    })
  } else {
    // Escenario 2: Vincular uno existente filtrado previamente
    if (!selectedArchivoExistenteId.value) return
    await materialesStore.linkConvocatoria(props.convocatoria.id_convocatoria, selectedArchivoExistenteId.value
    )
  }

  isDocumentModalOpen.value = false
  await materialesStore.fetchMateriales() // Recargar listas locales
}
</script>

<template>
  <div class="space-y-6">
    <Card class="border-gray-200 bg-white shadow-soft">
      <CardHeader class="border-b border-gray-100 pb-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle class="flex items-center gap-2 text-text-main">
              <Settings class="h-5 w-5 text-primary" /> Configuración General
            </CardTitle>
            <p class="text-xs text-text-muted mt-1">
              {{ isEditingData ? 'Modifica los campos y haz clic en Guardar cambios.' : 'Haz clic en Editar para habilitar los campos y el calendario.' }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <template v-if="!isEditingData">
              <Button variant="outline" class="flex items-center gap-2" @click="isEditingData = true">
                <Edit class="h-4 w-4" /> Habilitar Edición
              </Button>
            </template>
            <template v-else>
              <Button variant="outline" class="flex items-center gap-2" @click="cancelDataEdit">
                <X class="h-4 w-4" /> Cancelar
              </Button>
              <Button variant="accent" class="flex items-center gap-2" @click="saveData" :disabled="convocatoriasStore.loading">
                <Save class="h-4 w-4" /> {{ convocatoriasStore.loading ? 'Guardando...' : 'Guardar cambios' }}
              </Button>
            </template>
          </div>
        </div>
      </CardHeader>

      <CardContent class="pt-6">
        <div class="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <div>
              <h3 class="font-heading text-base font-bold text-text-main">Datos generales</h3>
              <p class="mt-1 text-sm text-text-muted">Información editable de la convocatoria.</p>
            </div>
            
            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Nombre</label>
              <input v-model="form.nombre" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-bold text-text-main">Gestión</label>
                <input v-model.number="form.gestion" type="number" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-bold text-text-main">Inscripción (Bs)</label>
                <input v-model.number="form.montoInscripcion" type="number" step="0.01" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50" />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-bold text-text-main">Descripción</label>
              <textarea v-model="form.descripcion" rows="4" :disabled="!isEditingData" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:bg-gray-50"></textarea>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4 ope-calendar-theme">
            <div>
              <h3 class="font-heading text-base font-bold text-text-main">Fechas de la convocatoria</h3>
              <p class="mt-1 text-sm text-text-muted">Ajusta los periodos mediante el calendario gráfico.</p>
            </div>
            <div class="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!isEditingData ? 'opacity-70 pointer-events-none' : ''">
                <label class="mb-2 block text-sm font-semibold text-text-main">Inicio Olimpiada</label>
                <VDatePicker v-model="editInicioOlimpiadaDate" mode="date" locale="es" :first-day-of-week="2" :min-date="minEditInicioOlimpiada" expanded :disabled="!isEditingData" />
              </div>
              <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!isEditingData || !editInicioOlimpiadaDate ? 'opacity-70 pointer-events-none' : ''">
                <label class="mb-2 block text-sm font-semibold text-text-main">Fin Olimpiada</label>
                <VDatePicker v-model="editFinOlimpiadaDate" mode="date" locale="es" :first-day-of-week="2" :min-date="minEditFinOlimpiada" expanded :disabled="!isEditingData || !editInicioOlimpiadaDate" />
              </div>
              <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!isEditingData || !editFinOlimpiadaDate ? 'opacity-70 pointer-events-none' : ''">
                <label class="mb-2 block text-sm font-semibold text-text-main">Inicio Inscripción</label>
                <VDatePicker v-model="editInicioInscripcionDate" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minEditInscripcion" :max-date="maxEditInscripcion" expanded :disabled="!isEditingData || !editFinOlimpiadaDate" />
              </div>
              <div class="rounded-xl border border-gray-200 bg-gray-50/50 p-2 sm:p-3" :class="!isEditingData || !editInicioInscripcionDate ? 'opacity-70 pointer-events-none' : ''">
                <label class="mb-2 block text-sm font-semibold text-text-main">Fin Inscripción</label>
                <VDatePicker v-model="editFinInscripcionDate" mode="dateTime" is24hr locale="es" :first-day-of-week="2" :min-date="minEditFinInscripcion" :max-date="maxEditInscripcion" expanded :disabled="!isEditingData || !editInicioInscripcionDate" />
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>

    <Card class="border-gray-200 bg-white shadow-soft mt-6">
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
    </Card>

    <div v-if="isDocumentModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <Card class="w-full max-w-md border-gray-200 bg-white shadow-xl animate-fade-in">
        <CardHeader class="border-b border-gray-100 pb-3">
          <CardTitle class="flex items-center justify-between text-base font-bold text-text-main">
            <span>Configurar {{ documentModifying }}</span>
            <button @click="isDocumentModalOpen = false" class="rounded-md p-1 text-text-muted hover:bg-gray-100 transition-colors">
              <X class="h-4 w-4" />
            </button>
          </CardTitle>
        </CardHeader>
        
        <div class="flex border-b border-gray-200 text-xs sm:text-sm">
          <button 
            type="button" 
            class="flex-1 py-2.5 font-bold text-center border-b-2 transition-colors"
            :class="documentModalTab === 'nuevo' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-main'"
            @click="documentModalTab = 'nuevo'"
          >
            Subir archivo nuevo
          </button>
          <button 
            type="button" 
            class="flex-1 py-2.5 font-bold text-center border-b-2 transition-colors"
            :class="documentModalTab === 'existente' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-text-main'"
            @click="documentModalTab = 'existente'"
          >
            Seleccionar existente
          </button>
        </div>

        <CardContent class="pt-4 space-y-4">
          <div v-if="documentModalTab === 'nuevo'" class="space-y-2">
            <label class="block text-xs font-bold text-text-main uppercase tracking-wider">Seleccionar desde dispositivo</label>
            <input 
              type="file" 
              @change="handleFileUpload" 
              class="w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" 
            />
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
              <div 
                v-for="file in filteredMaterialesExistentes" 
                :key="file.id_material"
                @click="selectedArchivoExistenteId = file.id_material"
                class="flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer bg-white"
                :class="selectedArchivoExistenteId === file.id_material ? 'border-primary bg-primary/5 shadow-xs' : 'border-gray-200 hover:border-gray-300'"
              >
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
                  <a 
                    :href="file.enlace_acceso" 
                    target="_blank" 
                    class="p-1 rounded-md text-text-muted hover:bg-gray-100 hover:text-primary transition-colors"
                    title="Ver documento original"
                    @click.stop
                  >
                    <Eye class="h-3.5 w-3.5" />
                  </a>
                  <div 
                    v-if="selectedArchivoExistenteId === file.id_material" 
                    class="h-4 w-4 rounded-full bg-primary flex items-center justify-center animate-scale-up"
                  >
                    <Check class="h-2.5 w-2.5 text-white stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="outline" @click="isDocumentModalOpen = false">Cancelar</Button>
            <Button 
              variant="accent" 
              @click="saveArchivosRequeridos" 
              :disabled="materialesStore.loading || (documentModalTab === 'nuevo' && !attachedFile) || (documentModalTab === 'existente' && !selectedArchivoExistenteId)"
            >
              {{ materialesStore.loading ? 'Guardando...' : 'Confirmar Cambios' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.ope-calendar-theme {
  --vc-accent-50: #f3f6fb;
  --vc-accent-100: #dfe8f4;
  --vc-accent-200: #c2d1e7;
  --vc-accent-300: #99b2d5;
  --vc-accent-400: #6689bd;
  --vc-accent-500: #315a94;
  --vc-accent-600: #113264;
  --vc-accent-700: #0f2b56;
  --vc-accent-800: #0c2448;
  --vc-accent-900: #0A1E3C;
  --vc-hover-bg: rgba(17, 50, 100, 0.1);
  --vc-focus-ring: 0 0 0 2px rgba(17, 50, 100, 0.28);
  --vc-header-arrow-color: #113264;
  --vc-header-arrow-hover-bg: rgba(17, 50, 100, 0.1);
  --vc-header-title-color: #1E293B;
  --vc-weekday-color: #113264;
  --vc-nav-item-active-bg: #113264;
  --vc-nav-item-current-color: #113264;
  --vc-time-month-color: #113264;
  --vc-time-day-color: #113264;
  --vc-time-select-group-icon-color: #113264;
  --vc-select-hover-bg: rgba(17, 50, 100, 0.1);
  --vc-day-content-hover-bg: rgba(17, 50, 100, 0.1);
  --vc-day-content-disabled-color: rgba(17, 50, 100, 0.38);
}
.ope-calendar-theme :deep(.vc-container) { width: 100%; border-color: rgba(17, 50, 100, 0.16); border-radius: 0.75rem; font-family: var(--font-sans); }
.ope-calendar-theme :deep(.vc-highlight-light) { background-color: rgba(17, 50, 100, 0.16); }
.ope-calendar-theme :deep(.vc-highlight-outline) { border-color: rgba(17, 50, 100, 0.55); }
.ope-calendar-theme :deep(.vc-highlight-solid) { background-color: #113264; }
.ope-calendar-theme :deep(.vc-day-content.vc-disabled) { background-color: rgba(17, 50, 100, 0.06); color: rgba(17, 50, 100, 0.42); }
.ope-calendar-theme :deep(.vc-time-picker) { border-color: rgba(17, 50, 100, 0.16); }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.animate-scale-up { animation: scaleUp 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>