<template>
  <div class="flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
    <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
      <CheckCircle class="w-14 h-14" />
    </div>

    <div class="text-center space-y-2">
      <h2 class="text-3xl font-extrabold text-gray-800">¡Inscripción Preliminar Exitosa!</h2>
      <p class="text-gray-500">Los datos han sido registrados correctamente en el sistema.</p>
    </div>

    <div class="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden relative">
      <div class="bg-blue-900 px-6 py-4 flex justify-between items-center">
        <span class="text-white font-bold tracking-widest text-sm">CREDENCIAL POSTULANTE</span>
        <span class="text-blue-200 text-xs">OPE UMSA</span>
      </div>
      <div class="p-6 bg-gradient-to-b from-white to-gray-50">
        <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Nombre Completo</p>
        <p class="text-xl font-bold text-gray-800 uppercase">{{ estudiante.nombres }} {{ estudiante.apellidos }}</p>

        <div class="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">C.I.</p>
            <p class="font-semibold text-gray-700">{{ estudiante.ci }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Nivel / Curso</p>
            <p class="font-semibold text-gray-700">{{ estudiante.nivel }} - {{ estudiante.curso }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full max-w-md bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg shadow-sm">
      <div class="flex items-start">
        <AlertTriangle class="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="text-amber-800 font-bold text-lg mb-1">Aviso Académico Obligatorio</h3>
          <p class="text-amber-700 text-sm leading-relaxed">
            Para validar y consolidar su inscripción de manera oficial, es <strong>estrictamente necesario</strong> que el postulante se apersone por las oficinas de la Dirección de la Carrera de Estadística portando una <strong>FOTOCOPIA DE SU CÉDULA DE IDENTIDAD</strong> vigente.
          </p>
        </div>
      </div>
    </div>

    <Button @click="emitirRetorno" variant="outline" size="lg" class="mt-4 font-semibold text-gray-700">
      <ArrowLeft class="w-5 h-5 mr-2" /> Volver al detalle de la convocatoria
    </Button>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-vue-next'
// Asegúrate de importar tu componente Button si usas uno personalizado
// import { Button } from '@/components/ui/button' 

defineProps<{
  estudiante: {
    nombres: string
    apellidos: string // Asegúrate de que esto coincida con lo que pasas (paterno + materno o solo apellidos)
    ci: string
    nivel: string
    curso: number | string
  }
}>()

const emit = defineEmits(['volver'])

const emitirRetorno = () => {
  emit('volver')
}
</script>