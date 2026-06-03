<script setup lang="ts">
import { onMounted } from 'vue'
import { usePublicStore } from '@/modules/public/stores/public.store'

const logoOpeSrc = `${import.meta.env.BASE_URL}logo-ope.svg`
const publicStore = usePublicStore()

onMounted(() => {
  void publicStore.fetchConvocatoriaPrincipal()
})
</script>

<template>
  <footer class="bg-primary-dark text-white pt-12 pb-8 mt-auto border-t-[4px] border-accent">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        <!-- Institucional -->
        <div class="space-y-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-white/20">
              <img :src="logoOpeSrc" alt="Logo OPE" class="h-14 w-24 object-contain" />
            </div>
            <div class="flex flex-col">
              <span class="font-heading font-bold text-lg tracking-tight leading-none text-white">OPE UMSA</span>
              <span class="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">Olimpiada Paceña</span>
            </div>
          </div>
          <p class="text-blue-100/80 text-sm leading-relaxed">
            Carrera de Estadística<br />
            Facultad de Ciencias Puras y Naturales<br />
            Universidad Mayor de San Andrés
          </p>
          <div class="flex space-x-4 pt-2">
            <!-- Facebook -->
            <a href="#" class="text-blue-200 hover:text-white hover:scale-110 transition-all">
              <span class="sr-only">Facebook</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
              </svg>
            </a>
            <!-- Twitter -->
            <a href="#" class="text-blue-200 hover:text-white hover:scale-110 transition-all">
              <span class="sr-only">Twitter</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Enlaces Rápidos -->
        <div>
          <h3 class="font-heading font-semibold text-lg mb-5 text-white">Enlaces Rápidos</h3>
          <ul class="space-y-3 text-sm">
            <li><a href="#" class="text-blue-200 hover:text-secondary transition-colors flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> Carrera de Estadística</a></li>
            <li><a href="#" class="text-blue-200 hover:text-secondary transition-colors flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> FCPN - UMSA</a></li>
            <li><a href="#" class="text-blue-200 hover:text-secondary transition-colors flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> UMSA Oficial</a></li>
            <li><router-link to="/resultados" class="text-blue-200 hover:text-secondary transition-colors flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> Resultados Anteriores</router-link></li>
          </ul>
        </div>

        <!-- Contacto -->
        <div>
          <h3 class="font-heading font-semibold text-lg mb-5 text-white">Contacto</h3>
          <ul class="space-y-3 text-sm text-blue-100/80">
            <li class="flex items-start gap-3">
              <span class="font-semibold text-blue-200">Dir:</span>
              <span>Campus Universitario Cota Cota,<br/>Calle 27, La Paz, Bolivia</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="font-semibold text-blue-200">Tel:</span>
              <span>+591 2 279 2622</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="font-semibold text-blue-200">Email:</span>
              <span>olimpiadas@estadistica.umsa.bo</span>
            </li>
          </ul>
          <router-link 
            to="/contacto" 
            class="inline-block mt-5 text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all px-5 py-2 rounded-md text-sm font-semibold"
          >
            Formulario de Contacto
          </router-link>
        </div>

        <!-- Mapa -->
        <div class="h-48 bg-primary rounded-xl overflow-hidden relative border border-white/10 shadow-inner">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15299.712613144186!2d-68.07727415234375!3d-16.53755459999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1ses!2sbo!4v1700000000000!5m2!1ses!2sbo" 
            width="100%" 
            height="100%" 
            style="border:0" 
            allowfullscreen="false" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            class="absolute inset-0 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
          ></iframe>
        </div>
      </div>
      
      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-blue-200/60 font-medium">
        <p>&copy; {{ new Date().getFullYear() }} Carrera de Estadística - UMSA. Todos los derechos reservados.</p>
        <div class="mt-4 md:mt-0 flex items-center space-x-6">
          <router-link to="/admin" class="hover:text-accent transition-colors flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-danger"></span> Admin Panel
          </router-link>
          <a href="#" class="hover:text-white transition-colors">Términos de Uso</a>
          <a href="#" class="hover:text-white transition-colors">Privacidad</a>
        </div>
      </div>
    </div>
  </footer>
</template>
