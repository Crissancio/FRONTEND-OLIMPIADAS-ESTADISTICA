<script setup lang="ts">
import type { Component } from 'vue'
import { CalendarDays, Settings, Users } from 'lucide-vue-next'

type CategoriaTab = 'fases' | 'inscritos' | 'configuracion'

const props = defineProps<{
  activeTab: CategoriaTab
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: CategoriaTab]
}>()

const tabs = [
  { key: 'fases', label: 'Fases', icon: CalendarDays },
  { key: 'inscritos', label: 'Inscritos', icon: Users },
  { key: 'configuracion', label: 'Configuración', icon: Settings },
] satisfies Array<{ key: CategoriaTab; label: string; icon: Component }>
</script>

<template>
  <aside class="group sticky top-2 z-30 h-fit w-full shrink-0 overflow-visible rounded-xl border border-gray-200 bg-white p-2 shadow-soft transition-all duration-300 ease-out lg:top-28 lg:w-16 lg:overflow-hidden lg:hover:w-56">
    <nav class="flex w-full items-center justify-center gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="group/item relative flex h-10 sm:h-11 items-center justify-center gap-2 rounded-lg px-3 sm:px-4 text-left transition-all duration-300 ease-out lg:h-12 lg:w-full lg:justify-start lg:gap-3 lg:px-2 lg:group-hover:px-3"
        :class="props.activeTab === tab.key 
          ? 'bg-primary text-white shadow-sm lg:bg-transparent lg:text-primary lg:shadow-none lg:group-hover:bg-primary lg:group-hover:text-white lg:group-hover:shadow-sm' 
          : 'bg-gray-50 text-text-muted hover:bg-primary/10 hover:text-primary lg:bg-transparent'"
        @click="emit('update:activeTab', tab.key)"
      >
        <span
          class="flex shrink-0 items-center justify-center rounded-md transition-all duration-300 ease-out group-hover/item:scale-110"
          :class="props.activeTab === tab.key 
            ? 'lg:h-8 lg:w-8 lg:bg-primary lg:text-white lg:group-hover:bg-transparent' 
            : 'lg:h-8 lg:w-8 lg:bg-gray-50 lg:group-hover/item:bg-white'"
        >
          <component :is="tab.icon" class="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <span class="block whitespace-nowrap text-xs sm:text-sm font-bold opacity-100 transition-all duration-300 ease-out lg:opacity-0 lg:group-hover:opacity-100">
          {{ tab.label }}
        </span>
      </button>
    </nav>
  </aside>
</template>