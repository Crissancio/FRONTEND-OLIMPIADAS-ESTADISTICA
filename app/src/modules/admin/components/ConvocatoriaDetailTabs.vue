<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { Component } from 'vue'
import { BookOpen, FileText, Info, Plus, Settings, Users } from 'lucide-vue-next'
import CategorySymbol from '@/shared/components/ui/atoms/CategorySymbol.vue'

type TabKey = 'general' | 'categorias' | 'inscritos' | 'material' | 'configuracion'

interface CategoriaItem {
  id: string
  nombre: string
  curso: string
  grado: string
}

const props = defineProps<{
  activeTab: TabKey
  categorias: CategoriaItem[]
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: TabKey]
  createCategoria: []
  manageCategoria: [id: string]
}>()

const tabs = [
  { key: 'general', label: 'Información general', icon: Info },
  { key: 'categorias', label: 'Categorías', icon: BookOpen },
  { key: 'inscritos', label: 'Estudiantes inscritos', icon: Users },
  { key: 'material', label: 'Material', icon: FileText },
  { key: 'configuracion', label: 'Configuración', icon: Settings },
] satisfies Array<{ key: TabKey; label: string; icon: Component }>

const isCategoryPanelOpen = ref(false)
const isDesktop = ref(false)

let mediaQuery: MediaQueryList | null = null

const updateDesktop = () => {
  isDesktop.value = Boolean(mediaQuery?.matches)
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1024px)')
  updateDesktop()
  mediaQuery.addEventListener('change', updateDesktop)
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', updateDesktop)
})

const selectTab = (tab: TabKey) => {
  if (tab === 'categorias' && isDesktop.value) {
    isCategoryPanelOpen.value = false
    return
  }

  emit('update:activeTab', tab)
  isCategoryPanelOpen.value = false
}
</script>

<template>
  <aside class="group sticky top-2 z-30 h-fit w-full shrink-0 overflow-visible rounded-xl border border-gray-200 bg-white p-2 shadow-soft transition-all duration-300 ease-out lg:top-28 lg:w-16 lg:overflow-hidden lg:hover:w-72">
    <nav class="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="group/item relative shrink-0"
      >
        <button
          type="button"
          class="relative flex h-12 min-w-12 items-center justify-center gap-3 rounded-lg px-2 text-left transition-all duration-300 ease-out sm:min-w-14 lg:w-full lg:justify-start lg:group-hover:px-3"
          :class="props.activeTab === tab.key ? 'text-primary lg:group-hover:bg-primary lg:group-hover:text-white lg:group-hover:shadow-sm' : 'text-text-muted hover:bg-primary/10 hover:text-primary'"
          @click="selectTab(tab.key)"
        >
          <span
            class="flex shrink-0 items-center justify-center rounded-md transition-all duration-300 ease-out group-hover/item:scale-125"
            :class="props.activeTab === tab.key ? 'h-10 w-10 bg-primary text-white lg:h-8 lg:w-8 lg:group-hover:bg-transparent' : 'h-8 w-8 bg-gray-50 group-hover/item:bg-white'"
          >
            <component :is="tab.icon" class="h-5 w-5" />
          </span>
          <span class="hidden whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ease-out sm:inline sm:opacity-100 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100">
            {{ tab.label }}
          </span>
        </button>

        <div
          v-if="tab.key === 'categorias'"
          class="absolute left-0 right-0 top-14 z-40 overflow-hidden rounded-lg bg-gray-50/95 shadow-soft transition-all duration-300 ease-out lg:static lg:bg-transparent lg:shadow-none lg:group-hover/item:bg-gray-50/80"
          :class="isCategoryPanelOpen ? 'max-h-96 border border-gray-200 lg:border-0' : 'max-h-0 border-0 lg:group-hover/item:max-h-96'"
        >
          <div
            class="grid gap-2 transition-all duration-300 ease-out"
            :class="isCategoryPanelOpen ? 'p-2' : 'p-0 lg:group-hover/item:p-2'"
          >
            <button
              v-for="categoria in props.categorias"
              :key="categoria.id"
              type="button"
              class="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm font-semibold text-text-main shadow-sm transition-all duration-300 ease-out hover:border-primary/30 hover:bg-primary/10 hover:text-primary lg:opacity-0 lg:group-hover/item:opacity-100"
              @click="emit('manageCategoria', categoria.id)"
            >
              <CategorySymbol :name="categoria.nombre" class="h-7 w-7 text-sm" />
              <span class="min-w-0 truncate">{{ categoria.nombre }}</span>
              <span class="ml-auto rounded-full bg-secondary/10 px-2 py-0.5 text-xs text-secondary">{{ categoria.curso }}</span>
            </button>

            <button
              type="button"
              class="flex items-center gap-2 rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-left text-sm font-bold text-primary transition-all duration-300 ease-out hover:bg-primary/10 lg:opacity-0 lg:group-hover/item:opacity-100"
              @click="emit('createCategoria')"
            >
              <Plus class="h-4 w-4 shrink-0" />
              Nueva categoría
            </button>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>
