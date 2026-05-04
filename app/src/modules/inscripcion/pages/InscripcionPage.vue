<script setup lang="ts">
import { ref } from 'vue'
import { 
  UserPlus, RefreshCcw, Mail, Phone, AlertCircle,
  CheckCircle, Building, ArrowRight
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const tab = ref<'nuevo' | 'existente'>('nuevo')
const isSubmitted = ref(false)
const ciExistente = ref('')
const fechaExistente = ref('')

const nombres = ref('')
const apellidos = ref('')
const fechaNacimiento = ref('')
const ci = ref('')
const correo = ref('')
const telefono = ref('')
const rude = ref('')
const curso = ref('')
const nivel = ref('secundaria')
const colegioId = ref('')
const colegioNombre = ref('')
const colegioTipo = ref('')
const colegioTurno = ref('')
const departamento = ref('')
const ciudad = ref('')
const aceptaTerminos = ref(true)

const onSubmit = () => {
  isSubmitted.value = true
}

const onBuscarExistente = () => {
  if (!ciExistente.value || !fechaExistente.value) {
    alert('Ingresa CI y fecha de nacimiento')
    return
  }
  ci.value = ciExistente.value
  fechaNacimiento.value = fechaExistente.value
  tab.value = 'nuevo'
}

const colegios = [
  { id: '1', nombre: 'Colegio San Ignacio (La Paz)' },
  { id: '2', nombre: 'Unidad Educativa La Paz (La Paz)' },
  { id: '3', nombre: 'Colegio Don Bosco (Cochabamba)' },
  { id: '4', nombre: 'Colegio San Agustín (Santa Cruz)' },
  { id: 'otro', nombre: 'NO ENCONTRÉ MI COLEGIO' }
]
</script>

<template>
  <div class="bg-background min-h-screen py-12 w-full">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Encabezado -->
      <Card class="rounded-xl shadow-soft border-gray-200 mb-8 text-center relative overflow-hidden bg-white">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-accent" />
        <CardContent class="p-8">
          <Badge class="inline-flex items-center gap-1.5 bg-success/10 text-success hover:bg-success/20 px-3 py-1 text-xs font-bold tracking-wide mb-4 shadow-none">
            <span class="w-2 h-2 rounded-full bg-success animate-pulse" />
            Convocatoria Activa
          </Badge>
          <h1 class="text-3xl sm:text-4xl font-heading font-bold text-primary-dark mb-3">
            Olimpiada Paceña de Estadística 2026
          </h1>
          <p class="text-text-muted">Completa el formulario a continuación para registrarte oficialmente.</p>
        </CardContent>
      </Card>

      <Card class="rounded-xl shadow-soft border-gray-200 overflow-hidden bg-white">
        <!-- Tabs -->
        <div class="flex border-b border-gray-200 bg-gray-50/50">
          <button
            @click="tab = 'nuevo'"
            :class="`flex-1 py-4 px-6 font-heading font-semibold text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${tab === 'nuevo' ? 'border-primary text-primary bg-white' : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-100'}`"
          >
            <UserPlus class="w-5 h-5" /> Nuevo Estudiante
          </button>
          <button
            @click="tab = 'existente'"
            :class="`flex-1 py-4 px-6 font-heading font-semibold text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${tab === 'existente' ? 'border-primary text-primary bg-white' : 'border-transparent text-text-muted hover:text-text-main hover:bg-gray-100'}`"
          >
            <RefreshCcw class="w-5 h-5" /> Estudiante Registrado
          </button>
        </div>

        <CardContent class="p-8 sm:p-10">
          <!-- Mensaje de Éxito -->
          <template v-if="isSubmitted">
            <div class="text-center py-12">
              <CheckCircle class="w-24 h-24 text-success mx-auto mb-6" />
              <h2 class="text-3xl font-heading font-bold text-text-main mb-4">¡Inscripción Exitosa!</h2>
              <p class="text-lg text-text-muted mb-8 max-w-lg mx-auto">
                Hemos recibido tus datos correctamente. Te enviamos un correo con los detalles de acceso y próximos pasos a seguir.
              </p>
              <div class="flex justify-center gap-4">
                <Button as="router-link" to="/material" variant="default" size="lg" class="font-bold">
                  Material Académico
                </Button>
                <Button as="router-link" to="/" variant="outline" size="lg" class="font-bold">
                  Ir al Inicio
                </Button>
              </div>
            </div>
          </template>

          <template v-else>
            <!-- Recuperar Datos -->
            <div v-if="tab === 'existente'" class="max-w-md mx-auto py-8 text-center">
              <AlertCircle class="w-16 h-16 text-secondary mx-auto mb-6" />
              <h3 class="text-2xl font-heading font-bold text-text-main mb-2">Recuperar Datos</h3>
              <p class="text-text-muted mb-8">Ingresa tu Carnet de Identidad y Fecha de Nacimiento para autocompletar el formulario.</p>

              <div class="space-y-5 text-left">
                <div class="form-group">
                  <label>Carnet de Identidad</label>
                  <input v-model="ciExistente" type="text" class="input-base" placeholder="Ej. 1234567" />
                </div>
                <div class="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input v-model="fechaExistente" type="date" class="input-base" />
                </div>
                <Button type="button" @click="onBuscarExistente" variant="default" size="lg" class="w-full font-bold flex justify-center items-center gap-2 mt-4">
                  Buscar Datos <ArrowRight class="w-5 h-5" />
                </Button>
              </div>
            </div>

            <!-- Formulario Nuevo -->
            <form v-else @submit.prevent="onSubmit" class="space-y-10">
              
              <!-- Sección 1 -->
              <section>
                <h3 class="text-lg font-heading font-bold text-primary-dark mb-6 flex items-center gap-3 pb-3 border-b border-gray-100">
                  <span class="w-8 h-8 rounded text-white bg-primary flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                  Datos Personales
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="form-group"><label>Nombres</label><input v-model="nombres" type="text" class="input-base" placeholder="Ej. Juan" /></div>
                  <div class="form-group"><label>Apellidos</label><input v-model="apellidos" type="text" class="input-base" placeholder="Ej. Pérez" /></div>
                  <div class="form-group"><label>Fecha de Nacimiento</label><input v-model="fechaNacimiento" type="date" class="input-base text-text-muted" /></div>
                  <div class="form-group"><label>Carnet de Identidad</label><input v-model="ci" type="text" class="input-base" placeholder="Ej. 1234567" /></div>
                  <div class="form-group"><label><Mail class="w-4 h-4 inline mr-1 text-secondary" /> Correo Electrónico</label><input v-model="correo" type="email" class="input-base" placeholder="ejemplo@correo.com" /></div>
                  <div class="form-group"><label><Phone class="w-4 h-4 inline mr-1 text-secondary" /> Teléfono / Celular</label><input v-model="telefono" type="tel" class="input-base" placeholder="Ej. 71234567" /></div>
                </div>
              </section>

              <!-- Sección 2 -->
              <section>
                <h3 class="text-lg font-heading font-bold text-primary-dark mb-6 flex items-center gap-3 pb-3 border-b border-gray-100">
                  <span class="w-8 h-8 rounded text-white bg-primary flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                  Datos Académicos
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="form-group">
                    <label>Nivel</label>
                    <select v-model="nivel" class="input-base custom-select">
                      <option value="secundaria">Secundaria</option>
                      <option value="primaria" disabled>Primaria (No habilitado)</option>
                    </select>
                  </div>
                  <div class="form-group"><label>Curso</label><input v-model="curso" type="text" class="input-base" placeholder="Ej. 5" /></div>
                  <div class="form-group md:col-span-2"><label>Código RUDE (Opcional)</label><input v-model="rude" type="text" class="input-base md:w-1/2" placeholder="Ej. 807300..." /></div>

                  <!-- Colegios -->
                  <div class="md:col-span-2 pt-4 border-t border-gray-100">
                    <div class="form-group mb-4">
                      <label><Building class="w-4 h-4 inline mr-1 text-secondary" /> Buscar Colegio</label>
                      <select v-model="colegioId" class="input-base custom-select text-text-main font-medium">
                        <option value="">Selecciona tu colegio...</option>
                        <option v-for="col in colegios" :key="col.id" :value="col.id">{{ col.nombre }}</option>
                      </select>
                    </div>

                    <div v-if="colegioId === 'otro'" class="grid grid-cols-1 md:grid-cols-2 gap-5 bg-background p-6 rounded-lg border border-gray-200 shadow-inner mt-4">
                      <div class="form-group md:col-span-2"><label>Nombre del Colegio *</label><input v-model="colegioNombre" type="text" class="input-base bg-white" /></div>
                      <div class="form-group"><label>Tipo *</label><select v-model="colegioTipo" class="input-base bg-white custom-select"><option value="privado">Privado</option><option value="fiscal">Fiscal</option></select></div>
                      <div class="form-group"><label>Turno *</label><select v-model="colegioTurno" class="input-base bg-white custom-select"><option value="mañana">Mañana</option><option value="tarde">Tarde</option></select></div>
                      <div class="form-group"><label>Departamento *</label><select v-model="departamento" class="input-base bg-white custom-select"><option value="LP">La Paz</option></select></div>
                      <div class="form-group"><label>Ciudad *</label><input v-model="ciudad" type="text" class="input-base bg-white" /></div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Final -->
              <section class="bg-info/10/50 rounded-lg p-5 border border-blue-100 flex gap-3">
                <input v-model="aceptaTerminos" type="checkbox" id="terminos" class="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus-visible:ring-primary" />
                <label for="terminos" class="text-sm font-medium text-text-main cursor-pointer leading-relaxed">
                  Confirmo que he leído y acepto los términos y el reglamento de la olimpiada. Declaro que los datos son verídicos.
                </label>
              </section>

              <div class="flex justify-end pt-6 border-t border-gray-200">
                <Button type="submit" variant="accent" size="lg" class="px-8 py-3 rounded-lg font-bold text-lg shadow-soft flex items-center gap-2">
                  Enviar inscripción <ArrowRight class="w-5 h-5" />
                </Button>
              </div>
            </form>
          </template>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
@reference "../../../style.css";

.form-group label {
  @apply block text-sm font-semibold text-text-main mb-1.5;
}
.input-base {
  @apply w-full h-11 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-text-main shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all;
}
.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}
</style>
