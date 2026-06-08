<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-primary-dark text-white pt-16 pb-12 relative overflow-hidden">
    <!-- Capa de degradado oscura sutil -->
    <div class="absolute inset-0 bg-linear-to-br from-slate-950/50 to-transparent z-10 pointer-events-none" />

    <!-- Trama de fondo con símbolos estadísticos y matemáticos en SVG -->
    <div 
      class="absolute inset-0 opacity-15 z-0" 
      style="background-image: url('data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' font-family=\'serif\' font-size=\'24\' font-style=\'italic\' font-weight=\'bold\'%3E%3Ctext x=\'20\' y=\'30\'%3EΣ%3C/text%3E%3Ctext x=\'70\' y=\'45\'%3Eμ%3C/text%3E%3Ctext x=\'40\' y=\'80\'%3Eσ%3C/text%3E%3Ctext x=\'95\' y=\'90\'%3Eπ%3C/text%3E%3Ctext x=\'15\' y=\'105\'%3EΔ%3C/text%3E%3Ctext x=\'60\' y=\'115\'%3E∫%3C/text%3E%3Ctext x=\'100\' y=\'25\'%3Eα%3C/text%3E%3C/g%3E%3C/svg%3E'); background-size: 120px 120px;"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
      <BookOpen class="w-16 h-16 mx-auto mb-6 opacity-90" />
      <h1 class="text-4xl md:text-5xl font-heading font-black mb-4">Acerca de las Olimpiadas</h1>
      <p class="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
        Conoce más sobre nuestro propósito, impacto y el equipo detrás de la competencia académica más importante de nuestra facultad.
      </p>
    </div>
  </div>
</template>