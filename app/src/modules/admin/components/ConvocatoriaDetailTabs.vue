<template>
  <aside class="w-full lg:w-64 shrink-0 bg-white border border-gray-200 rounded-xl p-4 shadow-soft space-y-2">
    <button
      v-for="tab in tabItems"
      :key="tab.key"
      @click="emit('update:activeTab', tab.key)"
      :class="[
        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
        activeTab === tab.key
          ? 'bg-primary/10 text-primary border-l-4 border-l-primary font-bold'
          : 'text-text-muted hover:bg-gray-50 hover:text-text-main'
      ]"
    >
      <component :is="tab.icon" class="h-4 w-4" />
      <span>{{ tab.label }}</span>
    </button>
  </aside>
</template>

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