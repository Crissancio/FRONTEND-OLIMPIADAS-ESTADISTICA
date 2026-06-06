<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { BookOpen, Settings, FileText, BarChart3, Plus } from 'lucide-vue-next'
import { useCategoriasStore } from '@/modules/categorias/stores/categorias.store'

defineProps<{
  activeTab: string
}>()

// Emitimos un evento especial para abrir el modal desde el padre
const emit = defineEmits(['update:activeTab', 'openCreateCategoria', 'selectCategoria'])

const categoriasStore = useCategoriasStore()

const tabItems = [
  { key: 'general', label: 'Vista General', icon: BarChart3 },
  { key: 'categorias', label: 'Categorías', icon: BookOpen },
  { key: 'material', label: 'Material Adjunto', icon: FileText },
  { key: 'configuracion', label: 'Configuración', icon: Settings },
]

const isDesktop = ref(window.innerWidth >= 1024)

const updateWidth = () => {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
  // No llamamos fetchCategorias aquí, el componente tabCategorias se encarga de eso.
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
  categoriasStore.clearCategorias()
})

const handleTabClick = (tabKey: string) => {
  // 🔴 CORRECCIÓN PC: Si es desktop y es categorías, anular el click principal.
  if (isDesktop.value && tabKey === 'categorias') {
    return 
  }
  
  // 🟢 CORRECCIÓN MÓVIL: Cambia la pestaña usando la lógica normal en lugar de un router.push
  emit('update:activeTab', tabKey)
}
</script>

<template>
  <aside 
    class="group flex shrink-0 flex-row lg:flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-soft transition-all duration-300 ease-in-out w-full lg:w-[68px] lg:hover:w-64 overflow-x-auto lg:overflow-visible z-10 h-fit"
  >
    <div v-for="tab in tabItems" :key="tab.key" class="relative group/tab flex-1 lg:flex-none">
      <button
        @click="handleTabClick(tab.key)"
        :class="[
          'flex w-full items-center transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isDesktop 
            ? 'h-11 gap-3 rounded-lg px-3 text-left text-sm font-medium whitespace-nowrap hover:scale-[1.02]' 
            : 'flex-col justify-center gap-1.5 py-2 px-1 rounded-lg text-[10px] sm:text-xs font-semibold text-center',
          activeTab === tab.key
            ? 'bg-primary/10 text-primary font-bold'
            : 'text-text-muted hover:bg-gray-50 hover:text-text-main'
        ]"
        :title="tab.label"
      >
        <component 
          :is="tab.icon" 
          class="shrink-0 transition-transform duration-300"
          :class="[isDesktop ? 'h-5 w-5' : 'h-6 w-6']" 
        />
        
        <span 
          :class="[
            isDesktop 
              ? 'opacity-0 w-0 overflow-hidden lg:group-hover:w-auto lg:group-hover:opacity-100 transition-all duration-300' 
              : 'w-auto opacity-100'
          ]"
        >
          {{ tab.label }}
        </span>
      </button>

      <div 
        v-if="isDesktop && tab.key === 'categorias'"
        class="overflow-hidden transition-all duration-500 max-h-0 group-hover/tab:max-h-[500px] opacity-0 group-hover/tab:opacity-100 pl-10 pr-2 flex flex-col gap-1 mt-1"
      >
        <button
          v-for="cat in categoriasStore.categorias"
          :key="cat.id_categoria"
          @click.stop="emit('update:activeTab', 'categorias')"
          class="w-full text-left text-xs py-2 px-2 rounded-md text-text-muted hover:bg-primary/10 hover:text-primary hover:translate-x-1 transition-all truncate flex items-center gap-2"
        >
          <div class="w-1 h-1 rounded-full bg-primary/50 shrink-0"></div>
          {{ cat.nombre_categoria }}
        </button>
        
        <button
          @click.stop="emit('openCreateCategoria')"
          class="w-full text-left text-xs py-2 px-2 mt-1 rounded-md text-accent font-bold hover:bg-accent/10 hover:translate-x-1 transition-all flex items-center gap-1.5"
        >
          <Plus class="h-3.5 w-3.5" /> Crear Categoría
        </button>
      </div>
    </div>
  </aside>
</template>