<script setup lang="ts">
import { Mail, Phone, MapPin, Clock } from 'lucide-vue-next'
</script>

<template>
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
</template>