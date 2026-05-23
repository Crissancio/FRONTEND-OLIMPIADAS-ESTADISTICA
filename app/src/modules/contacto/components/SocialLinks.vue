<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
</script>

<template>
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
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.058.975.045 1.504.207 1.857.344.466.399.399 1.063.748 1.15.9.137.353.3.882.344 1.857.048 1.37.058 3.807v.468c0 2.43.013 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399 1.063.748 1.15.9.137.353.3.882.344 1.857.048 1.37.058 3.807v.468c0 2.43.013 2.784.058 3.807.045.975.207 1.504.344 1.857a3.097 3.097 0 00.748 1.15c.353.137.882.3 1.857.344 1.023.048 1.37.058 3.807.058zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.505.207-1.858.344a3.097 3.097 0 00-.748 1.15c-.137.353-.3.882-.344 1.857-.048 1.023-.058 1.37-.058 3.807v.468c0 2.456-.011 2.784-.058 3.807-.045.975-.207 1.505-.344 1.858a3.097 3.097 0 00-.748 1.15c-.353.137-.882.3-1.857.344-1.023.048-1.37.058-3.807.058h-.468c-2.597 0-2.917-.01-3.96-.058-.976-.045-1.505-.207-1.858-.344a3.097 3.097 0 00-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.023-.058-1.37-.058-3.807v-.468c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15c-.353-.137-.882-.3-1.857-.344-1.023-.048-1.37-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 01-10.27zm0 1.802a3.333 3.333 0 100 6.666 0 3.333 3.333 0 00-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 0 1.2 1.2 0 01-2.4 0z" clip-rule="evenodd" /></svg>
      </a>
    </div>
  </div>
</template>