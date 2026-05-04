<script setup lang="ts">
import { ref } from 'vue'
import { 
  Mail, Phone, MapPin, Clock, Send, CheckCircle 
} from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Button from '@/shared/components/ui/atoms/Button.vue'

const isSubmitted = ref(false)

// Form data
const nombre = ref('')
const correo = ref('')
const asunto = ref('')
const mensaje = ref('')

const onSubmit = () => {
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
  
  console.log('Formulario de contacto enviado:', {
    nombre: nombre.value,
    correo: correo.value,
    asunto: asunto.value,
    mensaje: mensaje.value
  })
  
  isSubmitted.value = true
  setTimeout(() => {
    isSubmitted.value = false
    nombre.value = ''
    correo.value = ''
    asunto.value = ''
    mensaje.value = ''
  }, 5000)
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-12 w-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center mb-12">
        <h1 class="text-4xl font-heading font-black text-text-main mb-4">Contáctanos</h1>
        <p class="text-lg text-text-muted max-w-2xl mx-auto">
          ¿Tienes alguna consulta sobre las olimpiadas? Estamos aquí para ayudarte. Escríbenos o visítanos en nuestras oficinas.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
        <!-- Información de Contacto -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 class="font-heading font-bold text-xl text-text-main mb-6 border-b border-gray-100 pb-4">Información Directa</h3>
            
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center shrink-0 text-primary">
                  <MapPin class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-text-main text-sm mb-1">Dirección</h4>
                  <p class="text-text-muted text-sm leading-relaxed">
                    Campus Universitario Cota Cota,<br />
                    Edificio de Informática y Estadística,<br />
                    Calle 27, La Paz, Bolivia
                  </p>
                </div>
              </div>
            
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center shrink-0 text-primary">
                  <Phone class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-text-main text-sm mb-1">Teléfonos</h4>
                  <p class="text-text-muted text-sm">
                    +591 2 279 2622<br />
                    +591 2 279 2238 (Int. 125)
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center shrink-0 text-primary">
                  <Mail class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-text-main text-sm mb-1">Correo Electrónico</h4>
                  <a href="mailto:olimpiadas@estadistica.umsa.bo" class="text-primary hover:underline text-sm font-medium">
                    olimpiadas@estadistica.umsa.bo
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center shrink-0 text-primary">
                  <Clock class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-bold text-text-main text-sm mb-1">Horarios de Atención</h4>
                  <p class="text-text-muted text-sm">
                    Lunes a Viernes<br />
                    08:30 - 12:00 y 14:30 - 18:30
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Redes -->
          <div class="bg-primary rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <Mail class="w-24 h-24" />
            </div>
            <h3 class="font-heading font-bold text-xl mb-2 relative z-10">Síguenos en Redes</h3>
            <p class="text-blue-100 text-sm mb-6 relative z-10">Mantente al tanto de las últimas noticias y actualizaciones.</p>
            <div class="flex gap-3 relative z-10">
              <a href="#" class="w-10 h-10 rounded-lg bg-white/20 hover:bg-white flex items-center justify-center text-white hover:text-primary transition-all">
                <span class="sr-only">Facebook</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" class="w-10 h-10 rounded-lg bg-white/20 hover:bg-white flex items-center justify-center text-white hover:text-primary transition-all">
                <span class="sr-only">Instagram</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.058.975.045 1.504.207 1.857.344.466.399.399 1.063.748 1.15.9.137.353.3.882.344 1.857.048 1.37.058 3.807v.468c0 2.43.013 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399 1.063.748 1.15.9.137.353.3.882.344 1.857.048 1.37.058 3.807v.468c0 2.43.013 2.784.058 3.807.045.975.207 1.504.344 1.857a3.097 3.097 0 00.748 1.15c.353.137.882.3 1.857.344 1.023.048 1.37.058 3.807.058zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.505.207-1.858.344a3.097 3.097 0 00-.748 1.15c-.137.353-.3.882-.344 1.857-.048 1.023-.058 1.37-.058 3.807v.468c0 2.456-.011 2.784-.058 3.807-.045.975-.207 1.505-.344 1.858a3.097 3.097 0 00-.748 1.15c-.353.137-.882.3-1.857.344-1.023.048-1.37.058-3.807.058h-.468c-2.597 0-2.917-.01-3.96-.058-.976-.045-1.505-.207-1.858-.344a3.097 3.097 0 00-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.023-.058-1.37-.058-3.807v-.468c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15c-.353-.137-.882-.3-1.857-.344-1.023-.048-1.37-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 01-10.27zm0 1.802a3.333 3.333 0 100 6.666 0 3.333 3.333 0 00-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 0 1.2 1.2 0 01-2.4 0z" clip-rule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Formulario & Mapa -->
        <div class="lg:col-span-2 space-y-8">
          <Card class="rounded-2xl shadow-sm border-gray-100">
            <CardContent class="p-8">
              <h3 class="font-heading font-bold text-2xl text-text-main mb-6">Envíanos un mensaje</h3>
              
              <template v-if="isSubmitted">
                <div class="bg-success/10 text-green-800 rounded-xl p-6 flex flex-col items-center justify-center h-64 text-center border border-success/20">
                  <CheckCircle class="w-16 h-16 text-success mb-4" />
                  <h4 class="font-bold text-xl mb-2">¡Mensaje Enviado!</h4>
                  <p class="text-success/80 max-w-md">Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos a la brevedad posible.</p>
                </div>
              </template>
              
              <template v-else>
                <form @submit.prevent="onSubmit" class="space-y-6">
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-text-main mb-1.5">Nombre Completo</label>
                      <input 
                        v-model="nombre"
                        type="text" 
                        class="w-full rounded-xl border-gray-300 shadow-sm focus-visible:ring-primary p-3 border bg-gray-50 h-auto" 
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
                        class="w-full rounded-xl border-gray-300 shadow-sm focus-visible:ring-primary p-3 border bg-gray-50 h-auto" 
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-semibold text-text-main mb-1.5">Asunto</label>
                    <input 
                      v-model="asunto"
                      type="text" 
                      class="w-full rounded-xl border-gray-300 shadow-sm focus-visible:ring-primary p-3 border bg-gray-50 h-auto" 
                      placeholder="¿En qué te podemos ayudar?"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-semibold text-text-main mb-1.5">Mensaje</label>
                    <textarea 
                      v-model="mensaje"
                      class="w-full rounded-xl border-gray-300 shadow-sm focus-visible:ring-primary p-3 border bg-gray-50 resize-none h-32" 
                      placeholder="Escribe tu mensaje aquí..."
                    ></textarea>
                  </div>
                  
                  <div class="flex justify-end pt-2">
                    <Button 
                      type="submit"
                      variant="default"
                      size="lg"
                      class="px-8 py-6 rounded-xl font-bold transition-all shadow-soft flex items-center gap-2 h-auto"
                    >
                      Enviar Mensaje
                      <Send class="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </template>
            </CardContent>
          </Card>

        <!-- Mapa Embed -->
          <Card class="rounded-2xl shadow-sm border-gray-100 overflow-hidden h-64 md:h-80 p-0 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15299.712613144186!2d-68.07727415234375!3d-16.53755459999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1ses!2sbo!4v1700000000000!5m2!1ses!2sbo"
              width="100%" 
              height="100%" 
              style="border: 0" 
              allowfullscreen="false" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade"
              class="absolute inset-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            ></iframe>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
