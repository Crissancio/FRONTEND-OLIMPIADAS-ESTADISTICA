<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { usePublicStore } from '@/modules/public/stores/public.store'
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

const convocatoriaActiva = computed(() => publicStore.convocatoriaInicio)
const isLoadingProceso = computed(() => inscripcionStore.isLoadingProceso)

const pasoActual = ref<'verificacion' | 'formulario' | 'exito' | 'error'>('verificacion')
const errorMessage = ref<string | null>(null)
const datosVerificados = ref<{ carnet_identidad: string; fecha_nacimiento: string } | null>(null)
const estudianteData = ref<any>(null)
const formularioTemporal = ref<any>(null)

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

onMounted(() => {
  if (!convocatoriaActiva.value) {
    router.push('/')
    return
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const handleVerificacion = async (payload: { carnet_identidad: string; fecha_nacimiento: Date; username_hp: string; cf_turnstile_response: string }) => {
  errorMessage.value = null

  const d = payload.fecha_nacimiento
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const fechaString = `${year}-${month}-${day}`

  try {
    // Aquí enviamos el objeto completo con los tokens de seguridad
    const response = await inscripcionStore.verificarEstudiante({
      carnet_identidad: payload.carnet_identidad,
      fecha_nacimiento: fechaString,
      username_hp: payload.username_hp,
      cf_turnstile_response: payload.cf_turnstile_response
    })
    
    datosVerificados.value = { carnet_identidad: payload.carnet_identidad, fecha_nacimiento: fechaString }

    let estudiante = null

    if (response?.data?.id_estudiante) {
      estudiante = response.data
    } else if (response?.data?.data?.id_estudiante) {
      estudiante = response.data.data
    } else if (response?.id_estudiante) {
      estudiante = response
    }

    if (estudiante) {
      estudianteData.value = estudiante
    } else {
      estudianteData.value = null
    }
    pasoActual.value = 'formulario'

  } catch (err: any) {
    if (err.response?.status === 404 || err.status === 404) {
      datosVerificados.value = { carnet_identidad: payload.carnet_identidad, fecha_nacimiento: fechaString }
      estudianteData.value = null 
      pasoActual.value = 'formulario'
    } else {
      errorMessage.value = 'No se pudo completar la verificación en este momento. Inténtelo de nuevo.'
    }
  }
}

const handleInscripcion = async (formData: any) => {
  if (!datosVerificados.value || !convocatoriaActiva.value) return
  errorMessage.value = null

  if (!formData.id_categoria) {
    errorMessage.value = "Error: El formulario no cuenta con un ID de categoría válido."
    return
  }
  if (!formData.id_colegio) {
    errorMessage.value = "Por favor, seleccione un colegio válido."
    return
  }

  const payload = {
    id_convocatoria: Number(convocatoriaActiva.value.id_convocatoria),
    id_categoria: Number(formData.id_categoria),
    id_colegio: Number(formData.id_colegio),
    estudiante: {
      nombres: String(formData.nombres).trim(),
      paterno: String(formData.apellidos).trim(), 
      materno: formData.materno ? String(formData.materno).trim() : null,
      carnet_identidad: String(formData.carnet_identidad).trim(),
      fecha_nacimiento: String(formData.fecha_nacimiento), 
      curso: Number(formData.curso),
      nivel: String(formData.nivel).toUpperCase(),
      rude: formData.rude ? String(formData.rude).trim() : null,
      telefono: formData.telefono ? Number(String(formData.telefono).replace(/\D/g, '')) : null,
      correo: formData.correo ? String(formData.correo).trim() : null
    },
    // Añadimos los tokens de seguridad en la raíz del payload
    username_hp: formData.username_hp,
    cf_turnstile_response: formData.cf_turnstile_response
  }

  formularioTemporal.value = payload.estudiante

  try {
    await inscripcionStore.enviarInscripcion(payload)
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
      
      <Card v-if="convocatoriaActiva" class="rounded-xl shadow-soft border-gray-200 overflow-hidden bg-white relative">
        <div v-if="isLoadingProceso" class="absolute inset-0 bg-white/70 z-50 flex flex-col items-center justify-center gap-3 transition-all">
          <Loader2 class="w-12 h-12 text-primary animate-spin" />
          <p class="text-sm font-semibold text-primary-dark">Procesando información con el servidor...</p>
        </div>

        <CabezalConvocatoria 
          v-if="pasoActual === 'verificacion' || pasoActual === 'formulario'"
          :titulo="convocatoriaActiva.nombre_convocatoria || 'Olimpiada Paceña de Estadística'" 
        />

        <CardContent :class="`relative min-h-[400px] ${(pasoActual === 'verificacion' || pasoActual === 'formulario') ? 'p-6 sm:p-10 pt-4 sm:pt-6' : 'p-8 sm:p-10'}`">
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