<script setup lang="ts">
import { computed } from 'vue'
import { Mail, UserCog } from 'lucide-vue-next'
import type { AdministradorDTO } from '../types/administradores.api'
import Badge from '@/shared/components/ui/atoms/Badge.vue'

const props = defineProps<{
  admin: AdministradorDTO
}>()

const emit = defineEmits<{
  (e: 'click', admin: AdministradorDTO): void
}>()

const initials = computed(() => {
  return props.admin.nombre.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'AD'
})

const statusClass = computed(() => {
  return props.admin.estado.toUpperCase() === 'ACTIVO'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-amber-200 bg-amber-50 text-amber-700'
})
</script>

<template>
  <button
    type="button"
    class="group rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full"
    @click="emit('click', admin)"
  >
    <div class="flex items-start gap-4 w-full">
      <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        {{ initials }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <p class="truncate font-heading text-lg font-bold text-gray-900">{{ admin.nombre }}</p>
          <Badge variant="not_allowed" :class="`border px-2 py-0.5 text-[10px] font-bold ${statusClass}`">{{ admin.estado }}</Badge>
        </div>
        <p class="mt-2 flex items-center gap-1.5 truncate text-sm text-gray-500 font-medium">
          <Mail class="h-4 w-4 shrink-0 text-gray-400" />
          {{ admin.correo }}
        </p>
        <p class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
          <UserCog class="h-4 w-4" />
          Administrar
        </p>
      </div>
    </div>
  </button>
</template>