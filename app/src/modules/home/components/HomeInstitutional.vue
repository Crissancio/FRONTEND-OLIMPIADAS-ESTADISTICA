<script setup lang="ts">
import { Target, Users, GraduationCap } from 'lucide-vue-next'
</script>

<template>
  <section class="bg-white py-16 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-heading font-bold text-primary-dark mb-4">Misión y Objetivos</h2>
        <div class="w-16 h-1 bg-accent mx-auto rounded-full mb-6"></div>
        <p class="text-text-muted max-w-2xl mx-auto">
          Buscamos potenciar el desarrollo analítico y la excelencia académica de los jóvenes bolivianos a través de desafíos estructurados.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-primary/20 transition-colors">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm">
            <Target class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-heading font-bold text-text-main mb-3">Pensamiento Lógico</h3>
          <p class="text-sm text-text-muted">Desarrollar habilidades críticas para la resolución de problemas mediante la aplicación de herramientas estadísticas y matemáticas.</p>
        </div>

        <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-primary/20 transition-colors">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm">
            <Users class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-heading font-bold text-text-main mb-3">Sana Competencia</h3>
          <p class="text-sm text-text-muted">Incentivar la participación de estudiantes de secundaria (1ro a 6to) de todos los sistemas educativos en un entorno académico riguroso.</p>
        </div>

        <div class="p-6 bg-background rounded-xl border border-gray-100 flex flex-col items-center text-center hover:border-primary/20 transition-colors">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mb-4 shadow-sm">
            <GraduationCap class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-heading font-bold text-text-main mb-3">Impacto Universitario</h3>
          <p class="text-sm text-text-muted">Construir bases sólidas que preparen a los talentos jóvenes para los desafíos de la educación superior en ciencias exactas.</p>
        </div>
      </div>
    </div>
  </section>
</template>