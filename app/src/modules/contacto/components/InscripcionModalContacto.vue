<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { X, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-vue-next'
import Button from '@/shared/components/ui/atoms/Button.vue'
import VueTurnstile from 'vue-turnstile'
import { contactoService } from '@/modules/contacto/services/contacto.service'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const isSuccess = ref(false)

const form = ref({
  nombre_completo: '',
  correo_electronico: '',
  asunto: 'NO ENCUENTRO MI COLEGIO EN EL FORMULARIO',
  mensaje: `Por favor, agrega mi colegio con los siguientes datos:
- Nombre del Colegio: 
- Tipo (Público / Privado / Convenio): 
- Turno (Mañana / Tarde / Noche / Mixto): 
- Departamento: 
- Municipio: 
- Calle y número: `,
  username_hp: '',
  cf_turnstile_response: ''
})

// === BLOQUEO DE SCROLL ===
// Escuchamos si el modal se abre o cierra para bloquear el scroll del fondo
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Limpiamos el estilo si el componente se destruye
onUnmounted(() => {
  document.body.style.overflow = ''
})

const extractError = (err: any, fallbackMsg: string) => {
  console.log('Error recibido:', err)

  const responseData =
    err?.response?.data ??
    err?.data ??
    err?.details ??
    null

  if (responseData) {
    errorMessage.value =
      responseData.error ||
      responseData.message ||
      responseData.detail ||
      fallbackMsg

    return
  }

  errorMessage.value =
    err?.message && !err.message.includes('status code')
      ? err.message
      : fallbackMsg
}

const resetForm = () => {
  form.value.nombre_completo = ''
  form.value.correo_electronico = ''
  form.value.username_hp = ''
  form.value.cf_turnstile_response = ''
  form.value.mensaje = `Por favor, agrega mi colegio con los siguientes datos:
- Nombre del Colegio: 
- Tipo (Público / Privado / Convenio): 
- Turno (Mañana / Tarde / Noche / Mixto): 
- Departamento: 
- Municipio: 
- Calle y número: `
  errorMessage.value = null
  isSuccess.value = false
}

const handleClose = () => {
  resetForm()
  emit('close')
  router.push('/')
}

const submitContacto = async () => {
  errorMessage.value = null
  
  if (!form.value.cf_turnstile_response) {
    errorMessage.value = 'Por favor, completa la verificación de seguridad.'
    return
  }

  isSubmitting.value = true

  try {
    await contactoService.crearContacto({
      nombre_completo: form.value.nombre_completo,
      correo_electronico: form.value.correo_electronico,
      asunto: form.value.asunto,
      mensaje: form.value.mensaje,
      username_hp: form.value.username_hp,
      cf_turnstile_response: form.value.cf_turnstile_response
    })
    
    isSuccess.value = true
  } catch (err: any) {
    extractError(err, 'No se pudo enviar el mensaje. Inténtelo más tarde.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <h3 class="font-heading font-bold text-lg text-primary-dark">Solicitar registro de colegio</h3>
          <button @click="handleClose" class="text-gray-400 hover:text-danger transition-colors p-1 rounded-full hover:bg-gray-200">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto p-6 custom-scrollbar flex-1">
          <template v-if="isSuccess">
            <div class="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div class="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-2">
                <CheckCircle class="w-8 h-8" />
              </div>
              <h4 class="text-xl font-heading font-bold text-text-main">¡Mensaje enviado!</h4>
              <p class="text-text-muted">Hemos recibido los datos de tu colegio. Nuestro equipo lo registrará a la brevedad posible y te notificaremos por correo.</p>
              <Button @click="handleClose" variant="outline" class="mt-4">Volver a Inicio</Button>
            </div>
          </template>

          <template v-else>
            <div v-if="errorMessage" class="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 flex gap-3 text-danger">
              <AlertCircle class="w-5 h-5 shrink-0" />
              <p class="text-sm font-medium">{{ errorMessage }}</p>
            </div>

            <form @submit.prevent="submitContacto" class="space-y-5">
              <div class="form-group">
                <label class="block text-sm font-semibold mb-1.5 text-text-main">Nombre Completo</label>
                <input v-model="form.nombre_completo" type="text" class="input-base w-full" required :disabled="isSubmitting" />
              </div>

              <div class="form-group">
                <label class="block text-sm font-semibold mb-1.5 text-text-main">Correo Electrónico</label>
                <input v-model="form.correo_electronico" type="email" class="input-base w-full" required :disabled="isSubmitting" />
              </div>

              <div class="form-group">
                <label class="block text-sm font-semibold mb-1.5 text-text-main">Asunto</label>
                <input v-model="form.asunto" type="text" class="input-base w-full bg-gray-100 text-gray-600 cursor-not-allowed font-bold" disabled readonly />
              </div>

              <div class="form-group flex flex-col">
                <label class="block text-sm font-semibold mb-1.5 text-text-main">Mensaje / Datos del Colegio</label>
                <textarea v-model="form.mensaje" class="input-base w-full resize-none leading-relaxed min-h-55 shrink-0" required :disabled="isSubmitting"></textarea>
              </div>

              <div class="absolute opacity-0 -z-10 w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <label for="honeypot_contacto">No rellenar</label>
                <input id="honeypot_contacto" v-model="form.username_hp" type="text" tabindex="-1" autocomplete="off" />
              </div>

              <div class="pt-6 mt-2 flex flex-col items-center gap-6 border-t border-gray-100">
                <div class="w-full flex justify-center min-h-16.25">
                  <vue-turnstile :site-key="siteKey" v-model="form.cf_turnstile_response" />
                </div>
                
                <div class="flex justify-end gap-3 w-full shrink-0">
                  <Button type="button" variant="outline" @click="handleClose" :disabled="isSubmitting">Cancelar</Button>
                  <Button type="submit" variant="primary" :disabled="isSubmitting || !form.cf_turnstile_response" class="min-w-37.5 flex justify-center items-center gap-2">
                    <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                    <template v-else>
                      Enviar Solicitud <Send class="w-4 h-4" />
                    </template>
                  </Button>
                </div>
              </div>
            </form>
          </template>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #E5E7EB;
  border-radius: 20px;
}
</style>