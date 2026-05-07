<script setup lang="ts">
import type { Component } from 'vue'
import { CalendarDays, Settings, Trophy, Users } from 'lucide-vue-next'

type CategoriaTab = 'fases' | 'estudiantes' | 'resultados' | 'configuracion'

const props = defineProps<{
  activeTab: CategoriaTab
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: CategoriaTab]
}>()

const tabs = [
  { key: 'fases', label: 'Fases', icon: CalendarDays },
  { key: 'estudiantes', label: 'Estudiantes', icon: Users },
  { key: 'resultados', label: 'Resultados', icon: Trophy },
  { key: 'configuracion', label: 'Configuración', icon: Settings },
] satisfies Array<{ key: CategoriaTab; label: string; icon: Component }>
</script>

<template>
  <aside class="group sticky top-2 z-30 h-fit w-full shrink-0 overflow-visible rounded-xl border border-gray-200 bg-white p-2 shadow-soft transition-all duration-300 ease-out lg:top-28 lg:w-16 lg:overflow-hidden lg:hover:w-56">
    <nav class="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="group/item relative flex h-12 min-w-12 items-center justify-center gap-3 rounded-lg px-2 text-left transition-all duration-300 ease-out sm:min-w-14 lg:w-full lg:justify-start lg:group-hover:px-3"
        :class="props.activeTab === tab.key ? 'text-primary lg:group-hover:bg-primary lg:group-hover:text-white lg:group-hover:shadow-sm' : 'text-text-muted hover:bg-primary/10 hover:text-primary'"
        @click="emit('update:activeTab', tab.key)"
      >
        <span
          class="flex shrink-0 items-center justify-center rounded-md transition-all duration-300 ease-out group-hover/item:scale-125"
          :class="props.activeTab === tab.key ? 'h-10 w-10 bg-primary text-white lg:h-8 lg:w-8 lg:group-hover:bg-transparent' : 'h-8 w-8 bg-gray-50 group-hover/item:bg-white'"
        >
          <component :is="tab.icon" class="h-5 w-5" />
        </span>
        <span class="hidden whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 ease-out sm:inline sm:opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
          {{ tab.label }}
        </span>
      </button>
    </nav>
  </aside>
</template>
