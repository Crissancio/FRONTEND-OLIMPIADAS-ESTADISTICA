<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import TutorialesModuloFiltro from '../components/TutorialesModuloFiltro.vue'
import TutorialesListado from '../components/TutorialesListado.vue'
import TutorialesReproductor from '../components/TutorialesReproductor.vue'
import { useTutoriales } from '../composables/useTutoriales'
import { useTutorialesStore } from '../stores/tutoriales.store'

const { moduloActivo, tutorialesFiltrados, modulos } = useTutoriales()
const store = useTutorialesStore()
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="font-heading text-2xl font-bold text-slate-800">Tutoriales</h1>
        <p class="mt-1 text-sm text-slate-500">Videos de ayuda para el uso del sistema.</p>
      </div>
    </div>

    <Card
      class="overflow-hidden border-gray-200 shadow-soft bg-white flex flex-col"
      style="min-height: calc(100vh - 140px)"
    >
      <CardContent class="p-0 flex flex-col h-full">
        <div class="border-b border-gray-200 bg-gray-50/50 px-4 py-3 shrink-0">
          <TutorialesModuloFiltro
            :modulos="modulos"
            :modulo-activo="moduloActivo"
            @cambiar-modulo="moduloActivo = $event"
          />
        </div>

        <div class="flex flex-1 overflow-hidden">
          <div class="w-72 shrink-0 border-r border-gray-100 flex flex-col overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 bg-white shrink-0">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {{ tutorialesFiltrados.length }}
                video{{ tutorialesFiltrados.length !== 1 ? 's' : '' }}
              </p>
            </div>
            <div class="flex-1 overflow-y-auto p-3">
              <TutorialesListado
                :tutoriales="tutorialesFiltrados"
                :tutorial-activo="store.tutorialActivo"
                @seleccionar="store.seleccionarTutorial"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-5">
            <TutorialesReproductor v-if="store.tutorialActivo" />

            <div
              v-else
              class="flex h-full min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center p-8"
            >
              <BookOpen class="mb-3 size-10 text-slate-300" />
              <p class="text-sm font-semibold text-slate-500">
                Selecciona un tutorial para reproducirlo
              </p>
              <p class="mt-1 text-xs text-slate-400">El video se mostrará aquí</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-medium text-slate-500 shrink-0">
          <span>{{ tutorialesFiltrados.length }} tutoriales disponibles</span>
          <span v-if="store.tutorialActivo" class="text-primary font-semibold">
            Reproduciendo: {{ store.tutorialActivo.title }}
          </span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>