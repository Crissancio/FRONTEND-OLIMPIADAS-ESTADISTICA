<script setup lang="ts">
import { BookOpen, Settings, FileText, BarChart3 } from 'lucide-vue-next'

defineProps<{
  activeTab: string
}>()

const emit = defineEmits(['update:activeTab'])

const tabItems = [
  { key: 'general', label: 'Vista General', icon: BarChart3 },
  { key: 'categorias', label: 'Categorías', icon: BookOpen },
  { key: 'material', label: 'Material Adjunto', icon: FileText },
  { key: 'configuracion', label: 'Configuración', icon: Settings },
]
</script>

<template>
  <aside 
    class="group flex shrink-0 flex-row lg:flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-soft transition-all duration-300 ease-in-out w-full lg:w-[68px] lg:hover:w-64 overflow-x-auto lg:overflow-x-hidden z-10"
  >
    <button
      v-for="tab in tabItems"
      :key="tab.key"
      @click="emit('update:activeTab', tab.key)"
      :class="[
        'flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-primary',
        activeTab === tab.key
          ? 'bg-primary/10 text-primary font-bold'
          : 'text-text-muted hover:bg-gray-50 hover:text-text-main'
      ]"
      :title="tab.label"
    >
      <component :is="tab.icon" class="h-5 w-5 shrink-0" />
      <span class="opacity-100 lg:opacity-0 lg:w-0 lg:group-hover:w-auto lg:group-hover:opacity-100 transition-all duration-300">
        {{ tab.label }}
      </span>
    </button>
  </aside>
</template>