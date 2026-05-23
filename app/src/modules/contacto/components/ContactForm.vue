<script setup lang="ts">
import { ref } from 'vue'
import { Send, CheckCircle, Mail, AlertCircle, Loader2 } from 'lucide-vue-next'
import VueTurnstile from 'vue-turnstile'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'
import { useContactoStore } from '../stores/contacto.store'

const store = useContactoStore()
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

// Campos del formulario
const nombre = ref('')
const correo = ref('')
const asunto = ref('')
const mensaje = ref('')

// Campos Anti-Bots
const username_hp = ref('') // Honeypot (Trampa para bots)
const cf_turnstile_response = ref('') // Token de Cloudflare

const onSubmit = async () => {
  // Validaciones del Frontend
  if (nombre.value.length < 2) {
    alert('El nombre debe tener al menos 2 caracteres')
    return
  }
  if (!correo.value.includes('@')) {
    alert('Correo electrónico inválido')
    return
  }
  if (asunto.value.length < 5) {
    alert('El asunto debe tener al menos 5 caracteres')
    return
  }
  if (mensaje.value.length < 10) {
    alert('El mensaje debe tener al menos 10 caracteres')
    return
  }
  if (!cf_turnstile_response.value) {
    alert('Por favor, completa la verificación de seguridad.')
    return
  }
  
  // Llamada al store para enviar al backend
  await store.enviarContacto({
    nombre_completo: nombre.value,
    correo_electronico: correo.value,
    asunto: asunto.value,
    mensaje: mensaje.value,
    username_hp: username_hp.value,
    cf_turnstile_response: cf_turnstile_response.value
  })
  
  // Si fue exitoso, limpiamos tras 5 segundos
  if (store.isSuccess) {
    setTimeout(() => {
      store.resetState()
      nombre.value = ''
      correo.value = ''
      asunto.value = ''
      mensaje.value = ''
      username_hp.value = ''
      cf_turnstile_response.value = ''
    }, 5000)
  }
}
</script>

<template>
  <Card class="rounded-2xl shadow-sm border-gray-100">
    <CardContent class="p-8">
      <h3 class="font-heading font-bold text-2xl text-text-main mb-6">Envíanos un mensaje</h3>
      
      <template v-if="store.isSuccess">
        <div class="bg-success/10 text-green-800 rounded-xl p-6 flex flex-col items-center justify-center h-64 text-center border border-success/20 animate-in fade-in zoom-in duration-300">
          <CheckCircle class="w-16 h-16 text-success mb-4" />
          <h4 class="font-bold text-xl mb-2">¡Mensaje Enviado!</h4>
          <p class="text-success/80 max-w-md">Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos a la brevedad posible.</p>
        </div>
      </template>
      
      <template v-else>
        <div v-if="store.error" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
          <p class="text-sm font-medium">{{ store.error }}</p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-6">
          
          <div class="absolute opacity-0 -z-10 w-0 h-0 overflow-hidden" aria-hidden="true">
            <label for="username_hp">Leave this field blank</label>
            <input 
              id="username_hp"
              v-model="username_hp" 
              type="text" 
              tabindex="-1" 
              autocomplete="off" 
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1.5">Nombre Completo</label>
              <input 
                v-model="nombre"
                type="text" 
                :disabled="store.isLoading"
                class="w-full rounded-xl border-gray-300 shadow-sm focus-visible:ring-primary p-3 border bg-gray-50 h-auto disabled:opacity-50" 
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1.5 flex items-center gap-1.5">
                <Mail class="w-4 h-4 text-text-muted" /> Correo Electrónico
              </label>
              <input 
                v-model="correo"
                type="email" 
                :disabled="store.isLoading"
                class="w-full rounded-xl border-gray-300 shadow-sm focus-visible:ring-primary p-3 border bg-gray-50 h-auto disabled:opacity-50" 
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-text-main mb-1.5">Asunto</label>
            <input 
              v-model="asunto"
              type="text" 
              :disabled="store.isLoading"
              class="w-full rounded-xl border-gray-300 shadow-sm focus-visible:ring-primary p-3 border bg-gray-50 h-auto disabled:opacity-50" 
              placeholder="¿En qué te podemos ayudar?"
            />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-text-main mb-1.5">Mensaje</label>
            <textarea 
              v-model="mensaje"
              :disabled="store.isLoading"
              class="w-full rounded-xl border-gray-300 shadow-sm focus-visible:ring-primary p-3 border bg-gray-50 resize-none h-32 disabled:opacity-50" 
              placeholder="Escribe tu mensaje aquí..."
            ></textarea>
          </div>

          <div class="flex justify-start">
            <vue-turnstile 
              :site-key="siteKey" 
              v-model="cf_turnstile_response" 
            />
          </div>
          
          <div class="flex justify-end pt-2">
            <Button 
              type="submit"
              variant="default"
              size="lg"
              :disabled="store.isLoading || !cf_turnstile_response"
              class="px-8 py-6 rounded-xl font-bold transition-all shadow-soft flex items-center gap-2 h-auto disabled:cursor-not-allowed"
            >
              <template v-if="store.isLoading">
                Enviando...
                <Loader2 class="w-5 h-5 animate-spin" />
              </template>
              <template v-else>
                Enviar Mensaje
                <Send class="w-5 h-5" />
              </template>
            </Button>
          </div>
        </form>
      </template>
    </CardContent>
  </Card>
</template>