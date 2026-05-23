<script setup lang="ts">
import ContactInfo from '../components/ContactInfo.vue'
import SocialLinks from '../components/SocialLinks.vue'
import ContactForm from '../components/ContactForm.vue'
import ContactMap from '../components/ContactMap.vue'
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
        
        <div class="lg:col-span-1 space-y-6">
          <ContactInfo />
          <SocialLinks />
        </div>

        <div class="lg:col-span-2 space-y-8">
          <ContactForm />
          <ContactMap />
        </div>
        
      </div>
    </div>
  </div>
</template>