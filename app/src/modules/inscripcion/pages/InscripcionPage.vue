<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { usePublicStore } from '@/modules/public/stores/public.store'
import { inscripcionesService } from '../services/inscripcion.service'
import { publicService } from '@/modules/public/services/public.service'
import type { 
  EstudianteBusquedaDTO, 
  EstudianteFormularioDTO, 
  InscripcionFormularioRequestDTO 
} from '../types/inscripcion.api'
import { useInscripcionStore } from '../stores/inscripcion.store'

import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'

import VerificacionPaso from '../components/VerificacionPaso.vue'
import FormularioInscripcion from '../components/FormularioInscripcion.vue'
import VistaExito from '../components/VistaExito.vue'
import VistaError from '../components/VistaError.vue'
import CabezalConvocatoria from '../components/CabezalConvocatoria.vue'

const router = useRouter()
const publicStore = usePublicStore()
const inscripcionStore = useInscripcionStore()

const convocatoriaLocal = ref<any>(null)
const isFetchingConvocatoria = ref(false)
const isLoadingProceso = ref(false)

const convocatoriaActiva = computed(() => publicStore.convocatoriaInicio || convocatoriaLocal.value)

const pasoActual = ref<'verificacion' | 'formulario' | 'exito' | 'error'>('verificacion')
const errorMessage = ref<string | null>(null)
const datosVerificados = ref<{ carnet_identidad: string; fecha_nacimiento: string } | null>(null)
const estudianteData = ref<EstudianteBusquedaDTO | null>(null)
const formularioTemporal = ref<EstudianteFormularioDTO | null>(null)

const datosEstudianteParaCarnet = computed(() => {
  return {
    nombres: formularioTemporal.value?.nombres || estudianteData.value?.nombres || '',
    apellidos: formularioTemporal.value?.paterno || estudianteData.value?.paterno || '',
    carnet_identidad: formularioTemporal.value?.carnet_identidad || datosVerificados.value?.carnet_identidad || '',
    nivel: formularioTemporal.value?.nivel || estudianteData.value?.nivel || '',
    curso: formularioTemporal.value?.curso || estudianteData.value?.curso || ''
  }
})

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (pasoActual.value === 'formulario') {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)

  if (!publicStore.convocatoriaInicio) {
    isFetchingConvocatoria.value = true
    try {
      const response = await publicService.obtenerInicio()
      if (response.data) {
        convocatoriaLocal.value = response.data
      } else {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    } finally {
      isFetchingConvocatoria.value = false
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  inscripcionStore.clearColegios()
})

const handleVerificacion = async (payload: { carnet_identidad: string; fecha_nacimiento: Date; username_hp: string; cf_turnstile_response: string }) => {
  errorMessage.value = null
  isLoadingProceso.value = true

  const d = payload.fecha_nacimiento
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const fechaString = `${year}-${month}-${day}`

  try {
    const response = await inscripcionesService.verificarEstudiante({
      carnet_identidad: payload.carnet_identidad,
      fecha_nacimiento: fechaString,
      username_hp: payload.username_hp,
      cf_turnstile_response: payload.cf_turnstile_response
    })
    
    datosVerificados.value = { carnet_identidad: payload.carnet_identidad, fecha_nacimiento: fechaString }
    estudianteData.value = response.data || null
    pasoActual.value = 'formulario'

  } catch (err: any) {
    if (err.response?.status === 404 || err.status === 404) {
      datosVerificados.value = { carnet_identidad: payload.carnet_identidad, fecha_nacimiento: fechaString }
      estudianteData.value = null 
      pasoActual.value = 'formulario'
    } else {
      errorMessage.value = 'No se pudo completar la verificación en este momento. Inténtelo de nuevo.'
    }
  } finally {
    isLoadingProceso.value = false
  }
}

const handleInscripcion = async (formData: any) => {
  if (!datosVerificados.value || !convocatoriaActiva.value) return
  
  errorMessage.value = null
  
  if (!formData.id_colegio) {
    errorMessage.value = "Por favor, seleccione un colegio válido."
    return
  }
  if (!formData.curso || !formData.nivel) {
    errorMessage.value = "Error: El formulario no cuenta con un curso y nivel válido."
    return
  }

  const estudiantePayload: EstudianteFormularioDTO = {
    nombres: String(formData.nombres).trim(),
    paterno: String(formData.apellidos).trim(), 
    materno: formData.materno ? String(formData.materno).trim() : null,
    carnet_identidad: String(formData.carnet_identidad).trim(),
    fecha_nacimiento: String(formData.fecha_nacimiento), 
    curso: Number(formData.curso),
    nivel: String(formData.nivel).toUpperCase() as 'PRIMARIA' | 'SECUNDARIA',
    rude: formData.rude ? String(formData.rude).trim() : null,
    telefono: formData.telefono ? String(formData.telefono).replace(/\D/g, '') : null,
    correo: formData.correo ? String(formData.correo).trim() : null
  }

  const payload: InscripcionFormularioRequestDTO = {
    id_convocatoria: Number(convocatoriaActiva.value.id_convocatoria),
    id_colegio: Number(formData.id_colegio),
    estudiante: estudiantePayload,
    username_hp: formData.username_hp,
    cf_turnstile_response: formData.cf_turnstile_response
  }

  formularioTemporal.value = estudiantePayload
  isLoadingProceso.value = true

  try {
    await inscripcionesService.registrarPorFormulario(payload)
    pasoActual.value = 'exito'
  } catch (err: any) {
    pasoActual.value = 'error' 
    
    if (err.response?.status === 422) {
      const errores = err.response.data.detail
      if (Array.isArray(errores) && errores.length > 0) {
        errorMessage.value = `Error de validación: ${errores[0].msg}`
      }
    } else if (err.response?.status === 409) {
      errorMessage.value = err.response.data.message || 'El estudiante ya se encuentra registrado.'
    } else {
      errorMessage.value = 'Ocurrió un error inesperado. Por favor, intente más tarde.'
    }
  } finally {
    isLoadingProceso.value = false
  }
}

const volverAtras = () => {
  pasoActual.value = 'verificacion'
  estudianteData.value = null
  datosVerificados.value = null
  errorMessage.value = null
}

const volverAlDetalle = () => {
  if (convocatoriaActiva.value?.id_convocatoria) {
    router.push({ 
      name: 'convocatoria-detalle', 
      params: { id: convocatoriaActiva.value.id_convocatoria } 
    })
  } else {
    router.push({ name: 'convocatorias' })
  }
}
</script>

<template>
  <div class="bg-background min-h-screen py-12 w-full">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div v-if="!convocatoriaActiva || isFetchingConvocatoria" class="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 class="w-10 h-10 text-primary animate-spin" />
        <p class="text-text-muted font-medium">Cargando convocatoria...</p>
      </div>

      <Card v-else class="rounded-xl shadow-soft border-gray-200 overflow-hidden bg-white relative">
        <div v-if="isLoadingProceso" class="absolute inset-0 bg-white/70 z-50 flex flex-col items-center justify-center gap-3 transition-all backdrop-blur-sm">
          <Loader2 class="w-12 h-12 text-primary animate-spin" />
          <p class="text-sm font-semibold text-primary-dark">Procesando información con el servidor...</p>
        </div>

        <CabezalConvocatoria 
          v-if="pasoActual === 'verificacion' || pasoActual === 'formulario'"
          :titulo="convocatoriaActiva.nombre_convocatoria || 'Olimpiada Paceña de Estadística'" 
        />

        <CardContent :class="`relative min-h-100 ${(pasoActual === 'verificacion' || pasoActual === 'formulario') ? 'p-6 sm:p-10 pt-4 sm:pt-6' : 'p-8 sm:p-10'}`">
          <transition name="slide-fade" mode="out-in">
            
            <VerificacionPaso 
              v-if="pasoActual === 'verificacion'" 
              @verificar="handleVerificacion" 
            />

            <FormularioInscripcion 
              v-else-if="pasoActual === 'formulario'" 
              :estudiante-inicial="estudianteData"
              :datos-verificados="datosVerificados"
              @volver="volverAtras"
              @submit="handleInscripcion"
            />

            <VistaExito 
              v-else-if="pasoActual === 'exito'"
              :estudiante="datosEstudianteParaCarnet"
              @volver="volverAlDetalle"
            />

            <VistaError 
              v-else-if="pasoActual === 'error'"
              :mensajeError="errorMessage || 'Ocurrió un error inesperado.'"
              @volver="volverAlDetalle"
            />

          </transition>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>