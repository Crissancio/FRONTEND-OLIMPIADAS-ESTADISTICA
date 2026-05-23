<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Mail, Phone, ArrowLeft, Send, ChevronDown, GraduationCap, AlertCircle, CheckCircle} from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import ColegioBuscador from './ColegioBuscador.vue'
import { usePublicStore } from '@/modules/public/stores/public.store'
import VueTurnstile from 'vue-turnstile'

const props = defineProps<{
  estudianteInicial: any,
  datosVerificados: { carnet_identidad: string; fecha_nacimiento: string } | null
}>()

const emit = defineEmits(['volver', 'submit'])
const publicStore = usePublicStore()

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

const categoriasDisponibles = computed(() => publicStore.inicio?.categorias || [])

const formData = ref({
  carnet_identidad: props.estudianteInicial?.carnet_identidad || props.datosVerificados?.carnet_identidad || '',
  fecha_nacimiento: props.estudianteInicial?.fecha_nacimiento || props.datosVerificados?.fecha_nacimiento || '',
  
  nombres: props.estudianteInicial?.nombres || '',
  apellidos: props.estudianteInicial?.paterno || '',
  materno: props.estudianteInicial?.materno || '',
  
  correo: props.estudianteInicial?.correo || '',
  telefono: props.estudianteInicial?.telefono || '',
  rude: props.estudianteInicial?.rude || '',
  id_colegio: props.estudianteInicial?.id_colegio || null,
  curso: props.estudianteInicial?.curso || null,
  nivel: props.estudianteInicial?.nivel || ''
})

const aceptaTerminos = ref(false)
const isCategoryDropdownOpen = ref(false)
const categoryRef = ref<HTMLElement | null>(null)
const username_hp = ref('')
const cf_turnstile_response = ref('')

// --- LÓGICA DE V-CALENDAR ---
const fechaNacimientoVCalendar = ref<Date | null>(null)

// Sincronizar VCalendar -> formData
watch(fechaNacimientoVCalendar, (newDate) => {
  if (newDate) {
    const year = newDate.getFullYear()
    const month = String(newDate.getMonth() + 1).padStart(2, '0')
    const day = String(newDate.getDate()).padStart(2, '0')
    formData.value.fecha_nacimiento = `${year}-${month}-${day}`
  } else {
    formData.value.fecha_nacimiento = ''
  }
})

// Determinar si los datos clave fueron verificados en el paso 1
const esDatoVerificado = computed(() => !!props.datosVerificados?.carnet_identidad && !!props.datosVerificados?.fecha_nacimiento)
// ----------------------------

const categoriaSeleccionada = computed(() => {
  const encontrada = categoriasDisponibles.value.find(
    cat => Number(cat.curso) === Number(formData.value.curso) && 
           String(cat.nivel).toUpperCase() === String(formData.value.nivel).toUpperCase()
  )
  return encontrada || null
})

const selectCategoria = (curso: number, nivel: string) => {
  formData.value.curso = curso
  formData.value.nivel = nivel
  isCategoryDropdownOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (categoryRef.value && !categoryRef.value.contains(event.target as Node)) {
    isCategoryDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Inicializar VCalendar si hay fecha verificada
  if (props.datosVerificados?.fecha_nacimiento) {
    const [year, month, day] = props.datosVerificados.fecha_nacimiento.split('-').map(Number)
    fechaNacimientoVCalendar.value = new Date(year, month - 1, day)
  }
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const onSubmit = () => {
  const idCat = categoriaSeleccionada.value?.id_categoria;

  if (!idCat) {
    alert("Error: No se pudo determinar el ID de la categoría para el curso y nivel seleccionados.");
    console.error("Objeto categoría actual:", categoriaSeleccionada.value);
    return;
  }
  
  if (!cf_turnstile_response.value) {
    alert('Por favor, completa la verificación de seguridad.')
    return
  }

  emit('submit', { 
    ...formData.value, 
    id_categoria: Number(idCat),
    username_hp: username_hp.value,
    cf_turnstile_response: cf_turnstile_response.value
  })
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-10 animate-fade-in">
    <div class="flex justify-between items-center pb-4 border-b border-gray-100">
      <h2 class="text-2xl font-heading font-bold text-primary-dark">Formulario de Inscripción</h2>
      <Button type="button" variant="outline" size="sm" @click="$emit('volver')" class="text-text-muted">
        <ArrowLeft class="w-4 h-4 mr-2" /> Volver
      </Button>
    </div>

    <div v-if="estudianteInicial" class="p-5 rounded-xl bg-green-50 border border-green-200 shadow-sm">
      <div class="flex items-center gap-2 mb-2 text-green-700">
        <CheckCircle class="w-6 h-6" />
        <h3 class="font-bold text-lg">¡Datos recuperados con éxito!</h3>
      </div>
      <p class="text-sm text-green-700 mb-4 ml-8">Actualiza los campos que creas necesarios para esta nueva gestión.</p>
      
      <div class="ml-8 p-3 bg-white/60 border border-green-300 rounded-lg text-green-800 font-medium flex items-start gap-3">
        <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p class="text-sm">Por favor, presta especial atención en actualizar tu <b>Categoría / Curso</b> para asegurar que te inscribas en el nivel correcto.</p>
      </div>
    </div>

    <div v-else class="p-5 rounded-xl bg-yellow-50 border-2 border-yellow-300 shadow-sm flex items-start gap-3">
      <AlertCircle class="w-7 h-7 text-yellow-600 mt-0.5 flex-shrink-0" />
      <div>
        <h3 class="font-bold text-lg text-yellow-800 mb-1">¡Bienvenido, nuevo estudiante!</h3>
        <p class="text-sm text-yellow-700">
          Llena tus datos detalladamente y revísalos correctamente antes de enviarlos.
        </p>
      </div>
    </div>

    <section>
      <h3 class="text-lg font-heading font-bold text-primary-dark mb-6 flex items-center gap-3">
        <span class="w-8 h-8 rounded text-white bg-primary flex items-center justify-center text-sm font-bold shadow-sm">1</span>
        Datos Personales
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <template v-if="!estudianteInicial">
          <div class="form-group">
            <label class="block text-sm font-semibold mb-1.5 text-text-main">Carnet de Identidad</label>
            <input 
              v-model="formData.carnet_identidad" 
              type="text" 
              class="input-base disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" 
              :disabled="esDatoVerificado"
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="block text-sm font-semibold mb-1.5 text-text-main">Fecha Nacimiento</label>
            <VDatePicker 
              v-model="fechaNacimientoVCalendar" 
              :max-date="new Date()" 
              mode="date"
            >
              <template #default="{ inputValue, inputEvents }">
                <input
                  class="input-base w-full disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  :value="inputValue"
                  v-on="esDatoVerificado ? {} : inputEvents"
                  placeholder="DD/MM/YYYY"
                  readonly
                  :disabled="esDatoVerificado"
                  required
                />
              </template>
            </VDatePicker>
          </div>
        </template>

        <div class="form-group">
          <label class="block text-sm font-semibold mb-1.5 text-text-main">Nombres</label>
          <input v-model="formData.nombres" type="text" class="input-base" required />
        </div>
        
        <div class="form-group">
          <label class="block text-sm font-semibold mb-1.5 text-text-main">Apellido Paterno</label>
          <input v-model="formData.apellidos" type="text" class="input-base" required />
        </div>
        
        <div class="form-group">
          <label class="block text-sm font-semibold mb-1.5 text-text-main">Apellido Materno (Opcional)</label>
          <input v-model="formData.materno" type="text" class="input-base" />
        </div>
        <div class="form-group"><label class="block text-sm font-semibold mb-1.5 text-text-main"><Mail class="w-4 h-4 inline mr-1 text-secondary" /> Correo Electrónico</label><input v-model="formData.correo" type="email" class="input-base" required /></div>
        <div class="form-group"><label class="block text-sm font-semibold mb-1.5 text-text-main"><Phone class="w-4 h-4 inline mr-1 text-secondary" /> Teléfono / Celular</label><input v-model="formData.telefono" type="tel" class="input-base" required /></div>
      </div>
    </section>

    <section>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="form-group relative" ref="categoryRef">
          <label class="block text-sm font-semibold mb-1.5 text-text-main">
            <GraduationCap class="w-4 h-4 inline mr-1 text-secondary" /> Año de Curso / Categoría
          </label>
          <div @click="isCategoryDropdownOpen = !isCategoryDropdownOpen" class="input-base bg-gray-50 flex items-center justify-between cursor-pointer select-none">
            <div v-if="categoriaSeleccionada">
              <span class="font-bold text-text-main">{{ categoriaSeleccionada.nombre_categoria }}</span>
              <span class="text-xs text-gray-400 font-medium ml-2">- {{ categoriaSeleccionada.curso }}º de {{ categoriaSeleccionada.nivel }}</span>
            </div>
            <span v-else class="text-gray-400">Selecciona tu curso...</span>
            <ChevronDown class="w-4 h-4 text-gray-400" />
          </div>
          <ul v-if="isCategoryDropdownOpen" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto py-1">
            <li v-for="cat in categoriasDisponibles" :key="cat.id_categoria" @click="selectCategoria(cat.curso, cat.nivel)" class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-baseline gap-1.5 text-sm">
              <span class="font-bold text-text-main">{{ cat.nombre_categoria }}</span>
              <span class="text-xs text-gray-400 font-medium">- {{ cat.curso }}º de {{ cat.nivel }}</span>
            </li>
          </ul>
        </div>
        <div class="form-group"><label class="block text-sm font-semibold mb-1.5 text-text-main">Código RUDE (Opcional)</label><input v-model="formData.rude" type="text" class="input-base" /></div>
        <div class="md:col-span-2 pt-4 border-t border-gray-100"><ColegioBuscador v-model="formData.id_colegio" /></div>
      </div>
    </section>

    <section class="bg-info/10 rounded-lg p-5 border border-blue-100 flex gap-3">
      <input v-model="aceptaTerminos" type="checkbox" id="terminos" required class="mt-1 w-5 h-5 rounded border-gray-300 text-primary" />
      <label for="terminos" class="text-sm font-medium text-text-main cursor-pointer leading-relaxed">
        Confirmo que he leído y acepto los términos y el 
        <a href="/reglamentos" target="_blank" class="text-primary font-bold underline hover:text-primary-dark transition-colors">
          reglamento
        </a> 
        de la olimpiada. Declaro que los datos son verídicos.
      </label>
    </section>

    <div class="absolute opacity-0 -z-10 w-0 h-0 overflow-hidden" aria-hidden="true">
      <label for="username_hp_form">Leave blank</label>
      <input id="username_hp_form" v-model="username_hp" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
      <vue-turnstile :site-key="siteKey" v-model="cf_turnstile_response" />
      
      <Button type="submit" variant="accent" size="lg" :disabled="!aceptaTerminos || !formData.id_colegio || !formData.curso || !categoriaSeleccionada || !cf_turnstile_response" class="px-8 py-3 rounded-lg font-bold text-lg shadow-soft flex items-center gap-2">
        Enviar inscripción <Send class="w-5 h-5" />
      </Button>
    </div>
  </form>
</template>