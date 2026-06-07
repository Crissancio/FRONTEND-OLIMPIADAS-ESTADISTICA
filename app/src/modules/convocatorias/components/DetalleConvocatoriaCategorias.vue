<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, Calendar, Monitor, MapPin, BookOpen, ChevronDown, Download, FileText, Video, Link as LinkIcon, File } from 'lucide-vue-next'
import Card from '@/shared/components/ui/molecules/Card.vue'
import CardContent from '@/shared/components/ui/molecules/CardContent.vue'
import Badge from '@/shared/components/ui/atoms/Badge.vue'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'

const props = defineProps<{
  categorias: any[]
}>()

const activeTab = ref(0)
const expandedPhases = ref<Record<string, boolean>>({})

const activeCategory = computed(() => props.categorias[activeTab.value] || null)

const togglePhase = (phaseId: string) => {
  expandedPhases.value = {
    ...expandedPhases.value,
    [phaseId]: !expandedPhases.value[phaseId]
  }
}
</script>

<template>
  <Card class="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
    <div class="bg-gray-50 border-b border-gray-200 px-8 py-6">
      <h2 class="text-2xl font-heading font-bold text-text-main flex items-center gap-3">
        <Users class="w-6 h-6 text-primary" />
        Categorías Habilitadas
      </h2>
    </div>
    
    <div class="border-b border-gray-200 bg-white px-8">
      <div class="flex gap-8 overflow-x-auto pb-px scrollbar-hide">
        <button
          v-for="(cat, idx) in categorias"
          :key="cat.id"
          @click="activeTab = idx"
          class="flex items-center gap-2 py-4 px-2 font-semibold text-sm whitespace-nowrap transition-colors border-b-2"
          :class="activeTab === idx ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main hover:border-gray-300'"
        >
          <CategorySymbol :name="cat.nombre" class="h-7 w-7 text-sm" />
          {{ cat.nombre }}
        </button>
      </div>
    </div>
    
    <CardContent class="p-8 sm:p-10 bg-white">
      <h3 class="text-xl font-heading font-bold text-text-main mb-8 flex items-center gap-2">
        <Calendar class="w-5 h-5 text-text-muted" />
        Cronograma de Fases
      </h3>
      
      <template v-if="activeCategory?.fases && activeCategory.fases.length > 0">
        <div class="relative pl-8 border-l-2 border-gray-100 space-y-12">
          <template v-for="fase in activeCategory.fases" :key="fase.id">
            <div class="relative">
              <div class="absolute -left-10.25 bg-white border-[3px] border-primary w-5 h-5 rounded-full mt-1.5 shadow-sm" />
              <Card class="bg-gray-50 border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                <CardContent class="p-0">
                  <div class="flex flex-wrap items-center gap-3 mb-3">
                    <Badge 
                      :variant="fase.tipo === 'Preparación' ? 'outline' : 'default'"
                      :class="`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border ${fase.tipo === 'Preparación' ? 'bg-warning/10 text-warning hover:bg-warning/10 border-warning/20' : 'bg-info/10 text-info hover:bg-info/10 border-blue-200'}`"
                    >
                      {{ fase.tipo }}{{ fase.subtipo ? ` - ${fase.subtipo}` : '' }}
                    </Badge>
                    <span class="text-sm font-semibold text-text-muted flex items-center gap-1.5">
                      <Calendar class="w-4 h-4" />
                      {{ fase.fechas }}
                    </span>
                  </div>
                  
                  <h4 class="text-xl font-heading font-bold text-text-main mb-3">{{ fase.nombre }}</h4>
                  <p class="text-text-muted mb-4 text-base">{{ fase.descripcion }}</p>
                  
                  <div v-if="fase.modalidad" class="flex items-center gap-2 text-sm font-medium text-text-main bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm mb-4">
                    <component :is="fase.modalidad === 'Virtual' ? Monitor : MapPin" class="w-4 h-4" :class="fase.modalidad === 'Virtual' ? 'text-info' : 'text-danger'" />
                    Modalidad {{ fase.modalidad }}
                  </div>

                  <div v-if="fase.materiales && fase.materiales.length > 0" class="mt-2 border-t border-gray-200 pt-4">
                    <button
                      @click="togglePhase(fase.id)"
                      class="flex items-center justify-between w-full text-left text-sm font-bold text-text-main hover:text-primary transition-colors"
                    >
                      <span class="flex items-center gap-2">
                        <BookOpen class="w-4 h-4" />
                        Materiales de la Fase ({{ fase.materiales.length }})
                      </span>
                      <ChevronDown 
                        class="w-4 h-4 transition-transform duration-200"
                        :class="expandedPhases[fase.id] ? 'rotate-180' : ''"
                      />
                    </button>
                    
                    <div v-if="expandedPhases[fase.id]" class="mt-4 grid gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                      <a
                        v-for="mat in fase.materiales"
                        :key="mat.id"
                        :href="mat.url"
                        target="_blank"
                        class="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-sm transition-all group"
                      >
                        <div class="flex items-center gap-3">
                          <div 
                            class="w-8 h-8 rounded-md flex items-center justify-center"
                            :class="mat.tipo === 'PDF' ? 'bg-danger/10 text-danger' : mat.tipo === 'Video' ? 'bg-purple-50 text-purple-500' : mat.tipo === 'Documento' ? 'bg-info/10 text-info' : 'bg-gray-50 text-text-muted'"
                          >
                            <component 
                              :is="mat.tipo === 'PDF' ? FileText : mat.tipo === 'Video' ? Video : mat.tipo === 'Documento' ? File : LinkIcon" 
                              class="w-4 h-4" 
                            />
                          </div>
                          <div>
                            <p class="text-sm font-semibold text-text-main group-hover:text-primary transition-colors line-clamp-1">{{ mat.nombre }}</p>
                            <p class="text-xs text-text-muted flex gap-2">
                              <span>{{ mat.tipo }}</span>
                            </p>
                          </div>
                        </div>
                        <Download class="w-4 h-4 text-text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </template>
        </div>
      </template>

      <Card v-else class="text-center py-12 bg-gray-50 border-dashed border-gray-200">
        <CardContent class="p-0 flex flex-col items-center">
          <Calendar class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-text-muted font-medium">No hay fases programadas para esta categoría.</p>
        </CardContent>
      </Card>
    </CardContent>
  </Card>
</template>